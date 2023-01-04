import { FormPoster } from '@bigcommerce/form-poster';
import { noop } from 'lodash';

import {
    BillingAddressRequestBody,
    CustomerCredentials,
    CustomerInitializeOptions,
    CustomerStrategy,
    ExecutePaymentMethodCheckoutOptions,
    InvalidArgumentError,
    MissingDataError,
    MissingDataErrorType,
    PaymentIntegrationService,
    PaymentMethodClientUnavailableError,
    RequestOptions,
    ShippingOption,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import PaypalCommerceRequestSender from '../paypal-commerce-request-sender';
import PaypalCommerceScriptLoader from '../paypal-commerce-script-loader';
import {
    ApproveCallbackActions,
    ApproveCallbackPayload,
    PayPalCommerceButtonsOptions,
    PayPalSDK,
    ShippingAddressChangeCallbackPayload,
    ShippingOptionChangeCallbackPayload,
} from '../paypal-commerce-types';

import PaypalCommerceCustomerInitializeOptions, {
    WithPayPalCommerceCustomerInitializeOptions,
} from './paypal-commerce-customer-initialize-options';

export default class PayPalCommerceCustomerStrategy implements CustomerStrategy {
    private _onError = noop;
    private _paypalSdk?: PayPalSDK;

    constructor(
        private _formPoster: FormPoster,
        private _paymentIntegrationService: PaymentIntegrationService,
        private _paypalCommerceRequestSender: PaypalCommerceRequestSender,
        private _paypalCommerceScriptLoader: PaypalCommerceScriptLoader,
    ) {}

    async initialize(
        options: CustomerInitializeOptions & WithPayPalCommerceCustomerInitializeOptions,
    ): Promise<void> {
        const { paypalcommerce, methodId } = options;

        if (!methodId) {
            throw new InvalidArgumentError(
                'Unable to initialize payment because "options.methodId" argument is not provided.',
            );
        }

        if (!paypalcommerce) {
            throw new InvalidArgumentError(
                `Unable to initialize payment because "options.paypalcommerce" argument is not provided.`,
            );
        }

        this._onError = paypalcommerce.onError || noop;

        await this._paymentIntegrationService.loadPaymentMethod(methodId);

        const state = this._paymentIntegrationService.getState();
        const currencyCode = state.getCartOrThrow().currency.code;
        const paymentMethod = state.getPaymentMethodOrThrow(methodId);

        this._paypalSdk = await this._paypalCommerceScriptLoader.getPayPalSDK(
            paymentMethod,
            currencyCode,
        );

        this._renderButton(methodId, paypalcommerce);
    }

    deinitialize(): Promise<void> {
        return Promise.resolve();
    }

    async signIn(credentials: CustomerCredentials, options?: RequestOptions): Promise<void> {
        await this._paymentIntegrationService.signInCustomer(credentials, options);

        return Promise.resolve();
    }

    async signOut(options?: RequestOptions): Promise<void> {
        await this._paymentIntegrationService.signOutCustomer(options);

        return Promise.resolve();
    }

    executePaymentMethodCheckout(options?: ExecutePaymentMethodCheckoutOptions): Promise<void> {
        options?.continueWithCheckoutCallback?.();

        return Promise.resolve();
    }

    private _renderButton(
        methodId: string,
        paypalcommerce: PaypalCommerceCustomerInitializeOptions,
    ): void {
        const paypalSdk = this._getPayPalSdkOrThrow();
        const { container, onComplete } = paypalcommerce;

        const state = this._paymentIntegrationService.getState();
        const paymentMethod = state.getPaymentMethodOrThrow(methodId);
        const { isHostedCheckoutEnabled } = paymentMethod.initializationData;

        if (!container) {
            throw new InvalidArgumentError(
                `Unable to initialize payment because "options.paypalcommerce.container" argument is not provided.`,
            );
        }

        if (isHostedCheckoutEnabled && (!onComplete || typeof onComplete !== 'function')) {
            throw new InvalidArgumentError(
                `Unable to initialize payment because "options.paypalcommerce.onComplete" argument is not provided or it is not a function.`,
            );
        }

        const hostedCheckoutCallbacks = {
            onShippingAddressChange: (data: ShippingAddressChangeCallbackPayload) =>
                this._onShippingAddressChange(data),
            onShippingOptionsChange: (data: ShippingOptionChangeCallbackPayload) =>
                this._onShippingOptionsChange(data),
            onApprove: (data: ApproveCallbackPayload, actions: ApproveCallbackActions) =>
                this._onHostedCheckoutApprove(data, actions, methodId, onComplete),
        };

        const regularCallbacks = {
            onApprove: ({ orderID }: ApproveCallbackPayload) =>
                this._tokenizePayment(methodId, orderID),
        };

        const paypalCallbacks = isHostedCheckoutEnabled
            ? hostedCheckoutCallbacks
            : regularCallbacks;

        const buttonRenderOptions: PayPalCommerceButtonsOptions = {
            fundingSource: paypalSdk.FUNDING.PAYPAL,
            style: {
                height: 40,
            },
            createOrder: () => this._createOrder(),
            ...paypalCallbacks,
        };

        const paypalButton = paypalSdk.Buttons(buttonRenderOptions);

        if (paypalButton.isEligible()) {
            paypalButton.render(`#${container}`);
        } else {
            this._removeElement(container);
        }
    }

    private _tokenizePayment(methodId: string, orderId?: string): void {
        if (!orderId) {
            throw new MissingDataError(MissingDataErrorType.MissingOrderId);
        }

        return this._formPoster.postForm('/checkout.php', {
            action: 'set_external_checkout',
            order_id: orderId,
            payment_type: 'paypal',
            provider: methodId,
        });
    }

    private async _onHostedCheckoutApprove(
        data: ApproveCallbackPayload,
        actions: ApproveCallbackActions,
        methodId: string,
        onComplete?: () => void,
    ): Promise<void> {
        if (!data.orderID) {
            throw new MissingDataError(MissingDataErrorType.MissingOrderId);
        }

        const cart = this._paymentIntegrationService.getState().getCartOrThrow();
        const orderDetails = actions.order.get();

        try {
            if (cart.lineItems.physicalItems.length > 0) {
                const { payer, purchase_units } = orderDetails;
                const shippingAddress = purchase_units[0]?.shipping?.address || {};

                const address = this._getAddress({
                    firstName: payer.name.given_name,
                    lastName: payer.name.surname,
                    email: payer.email_address,
                    address1: shippingAddress.address_line_1,
                    city: shippingAddress.admin_area_2,
                    countryCode: shippingAddress.country_code,
                    postalCode: shippingAddress.postal_code,
                    stateOrProvinceCode: shippingAddress.admin_area_1,
                });

                await this._paymentIntegrationService.updateBillingAddress(address);
                await this._paymentIntegrationService.updateShippingAddress(address);
                await this._updateOrder();
            } else {
                const { payer } = orderDetails;

                const address = this._getAddress({
                    firstName: payer.name.given_name,
                    lastName: payer.name.surname,
                    email: payer.email_address,
                    address1: payer.address.address_line_1,
                    city: payer.address.admin_area_2,
                    countryCode: payer.address.country_code,
                    postalCode: payer.address.postal_code,
                    stateOrProvinceCode: payer.address.admin_area_1,
                });

                await this._paymentIntegrationService.updateBillingAddress(address);
            }

            await this._paymentIntegrationService.submitOrder({}, { params: { methodId } });
            await this._submitPayment(methodId, data.orderID);

            if (onComplete) {
                onComplete();
            }
        } catch (error) {
            this._handleError(error);
        }
    }

    private async _onShippingAddressChange(
        data: ShippingAddressChangeCallbackPayload,
    ): Promise<void> {
        const address = this._getAddress({
            city: data.shippingAddress.city,
            countryCode: data.shippingAddress.country_code,
            postalCode: data.shippingAddress.postal_code,
            stateOrProvinceCode: data.shippingAddress.state,
        });

        try {
            // Info: we use the same address to fill billing and shipping addresses to have valid quota on BE for order updating process
            // on this stage we don't have access to valid customer's address except shipping data
            await this._paymentIntegrationService.updateBillingAddress(address);
            await this._paymentIntegrationService.updateShippingAddress(address);

            const shippingOption = this._getShippingOptionOrThrow();

            await this._paymentIntegrationService.selectShippingOption(shippingOption.id);
            await this._updateOrder();
        } catch (error) {
            this._handleError(error);
        }
    }

    private async _onShippingOptionsChange(
        data: ShippingOptionChangeCallbackPayload,
    ): Promise<void> {
        const shippingOption = this._getShippingOptionOrThrow(data.selectedShippingOption.id);

        try {
            await this._paymentIntegrationService.selectShippingOption(shippingOption.id);
            await this._updateOrder();
        } catch (error) {
            this._handleError(error);
        }
    }

    private async _submitPayment(methodId: string, orderId: string): Promise<void> {
        const paymentData = {
            formattedPayload: {
                vault_payment_instrument: null,
                set_as_default_stored_instrument: null,
                device_info: null,
                method_id: methodId,
                paypal_account: {
                    order_id: orderId,
                },
            },
        };

        await this._paymentIntegrationService.submitPayment({ methodId, paymentData });
    }

    private async _updateOrder(): Promise<void> {
        const state = this._paymentIntegrationService.getState();
        const cart = state.getCartOrThrow();
        const consignment = state.getConsignmentsOrThrow()[0];

        await this._paypalCommerceRequestSender.updateOrder({
            availableShippingOptions: consignment.availableShippingOptions,
            cartId: cart.id,
            selectedShippingOption: consignment.selectedShippingOption,
        });
    }

    private _getAddress(address?: Partial<BillingAddressRequestBody>): BillingAddressRequestBody {
        return {
            firstName: address?.firstName || '',
            lastName: address?.lastName || '',
            email: address?.email || '',
            phone: '',
            company: '',
            address1: address?.address1 || '',
            address2: '',
            city: address?.city || '',
            countryCode: address?.countryCode || '',
            postalCode: address?.postalCode || '',
            stateOrProvince: '',
            stateOrProvinceCode: address?.stateOrProvinceCode || '',
            customFields: [],
        };
    }

    private _getShippingOptionOrThrow(selectedShippingOptionId?: string): ShippingOption {
        const consignment = this._paymentIntegrationService.getState().getConsignmentsOrThrow()[0];
        const availableShippingOptions = consignment.availableShippingOptions || [];

        const recommendedShippingOption = availableShippingOptions.find(
            (option) => option.isRecommended,
        );
        const selectedShippingOption = selectedShippingOptionId
            ? availableShippingOptions.find((option) => option.id === selectedShippingOptionId)
            : availableShippingOptions.find(
                  (option) => option.id === consignment.selectedShippingOption?.id,
              );

        const shippingOptionToSelect = selectedShippingOption || recommendedShippingOption;

        if (!shippingOptionToSelect) {
            throw new Error("Your order can't be shipped to this address");
        }

        return shippingOptionToSelect;
    }

    private async _createOrder(): Promise<string> {
        const cart = this._paymentIntegrationService.getState().getCartOrThrow();

        const { orderId } = await this._paypalCommerceRequestSender.createOrder('paypalcommerce', {
            cartId: cart.id,
        });

        return orderId;
    }

    private _getPayPalSdkOrThrow(): PayPalSDK {
        if (!this._paypalSdk) {
            throw new PaymentMethodClientUnavailableError();
        }

        return this._paypalSdk;
    }

    private _removeElement(elementId?: string): void {
        const element = elementId && document.getElementById(elementId);

        if (element) {
            element.remove();
        }
    }

    private _handleError(error: Error) {
        if (typeof this._onError === 'function') {
            this._onError(error);
        } else {
            throw error;
        }
    }
}
