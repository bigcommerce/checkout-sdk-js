import { FormPoster } from '@bigcommerce/form-poster';
import { noop } from 'lodash';

import { BillingAddressActionCreator, BillingAddressRequestBody } from '../../../billing';
import { CheckoutStore, InternalCheckoutSelectors } from '../../../checkout';
import {
    InvalidArgumentError,
    MissingDataError,
    MissingDataErrorType,
    RequestError,
} from '../../../common/error/errors';
import { OrderActionCreator } from '../../../order';
import { PaymentActionCreator, PaymentMethodActionCreator } from '../../../payment';
import { PaymentMethodClientUnavailableError } from '../../../payment/errors';
import {
    ApproveCallbackActions,
    ApproveCallbackPayload,
    ButtonsOptions,
    PaypalCommerceRequestSender,
    PaypalCommerceScriptLoader,
    PaypalCommerceSDK,
    PayPalOrderDetails,
    ShippingAddressChangeCallbackPayload,
    ShippingOptionChangeCallbackPayload,
} from '../../../payment/strategies/paypal-commerce';
import { ConsignmentActionCreator, ShippingOption } from '../../../shipping';
import CustomerActionCreator from '../../customer-action-creator';
import CustomerCredentials from '../../customer-credentials';
import {
    CustomerInitializeOptions,
    CustomerRequestOptions,
    ExecutePaymentMethodCheckoutOptions,
} from '../../customer-request-options';
import CustomerStrategy from '../customer-strategy';
import PaypalCommerceCustomerInitializeOptions from './paypalcommerce-customer-initialize-options';

export default class PaypalCommerceCustomerStrategy implements CustomerStrategy {
    private _paypalCommerceSdk?: PaypalCommerceSDK;
    private _onError = noop;

    constructor(
        private _store: CheckoutStore,
        private _customerActionCreator: CustomerActionCreator,
        private _formPoster: FormPoster,
        private _paypalScriptLoader: PaypalCommerceScriptLoader,
        private _paypalCommerceRequestSender: PaypalCommerceRequestSender,
        private _consignmentActionCreator: ConsignmentActionCreator,
        private _billingAddressActionCreator: BillingAddressActionCreator,
        private _paymentActionCreator: PaymentActionCreator,
        private _paymentMethodActionCreator: PaymentMethodActionCreator,
        private _orderActionCreator: OrderActionCreator,
    ) {}

    async initialize(options: CustomerInitializeOptions): Promise<InternalCheckoutSelectors> {
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

        const { container, onError } = paypalcommerce;

        this._onError = onError || noop;

        if (!container) {
            throw new InvalidArgumentError(
                `Unable to initialize payment because "options.paypalcommerce.container" argument is not provided.`,
            );
        }

        const state = await this._store.dispatch(
            this._paymentMethodActionCreator.loadPaymentMethod(methodId),
        );
        const currencyCode = state.cart.getCartOrThrow().currency.code;
        const paymentMethod = state.paymentMethods.getPaymentMethodOrThrow(methodId);

        this._paypalCommerceSdk = await this._paypalScriptLoader.getPayPalSDK(
            paymentMethod,
            currencyCode,
        );

        this._renderButton(methodId, paypalcommerce);

        return this._store.getState();
    }

    deinitialize(): Promise<InternalCheckoutSelectors> {
        return Promise.resolve(this._store.getState());
    }

    signIn(
        credentials: CustomerCredentials,
        options?: CustomerRequestOptions,
    ): Promise<InternalCheckoutSelectors> {
        return this._store.dispatch(
            this._customerActionCreator.signInCustomer(credentials, options),
        );
    }

    signOut(options?: CustomerRequestOptions): Promise<InternalCheckoutSelectors> {
        return this._store.dispatch(this._customerActionCreator.signOutCustomer(options));
    }

    executePaymentMethodCheckout(
        options?: ExecutePaymentMethodCheckoutOptions,
    ): Promise<InternalCheckoutSelectors> {
        options?.continueWithCheckoutCallback?.();

        return Promise.resolve(this._store.getState());
    }

    private _renderButton(
        methodId: string,
        paypalcommerce: PaypalCommerceCustomerInitializeOptions,
    ): void {
        const { container, onComplete } = paypalcommerce;
        const paypalCommerceSdk = this._getPayPalCommerceSdkOrThrow();

        const state = this._store.getState();
        const paymentMethod = state.paymentMethods.getPaymentMethodOrThrow(methodId);
        const { isHostedCheckoutEnabled } = paymentMethod.initializationData;

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

        const buttonRenderOptions: ButtonsOptions = {
            fundingSource: paypalCommerceSdk.FUNDING.PAYPAL,
            style: {
                height: 40,
            },
            createOrder: () => this._createOrder(),
            ...paypalCallbacks,
        };

        const paypalButton = paypalCommerceSdk.Buttons(buttonRenderOptions);

        if (paypalButton.isEligible()) {
            paypalButton.render(`#${container}`);
        } else {
            this._removeElement(container);
        }
    }

    private async _onHostedCheckoutApprove(
        data: ApproveCallbackPayload,
        actions: ApproveCallbackActions,
        methodId: string,
        onComplete?: () => void,
    ): Promise<void> {
        const state = this._store.getState();
        const cart = state.cart.getCartOrThrow();
        const orderDetails = await this._getOrderDetailsOrThrow(actions);

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

                await this._store.dispatch(
                    this._billingAddressActionCreator.updateAddress(address),
                );
                await this._store.dispatch(this._consignmentActionCreator.updateAddress(address));
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

                await this._store.dispatch(
                    this._billingAddressActionCreator.updateAddress(address),
                );
            }

            await this._store.dispatch(
                this._orderActionCreator.submitOrder({}, { params: { methodId } }),
            );
            await this._submitPayment(methodId, data.orderID);

            if (onComplete) {
                onComplete();
            }
        } catch (error) {
            this._handleError(error);
        }
    }

    private async _getOrderDetailsOrThrow(
        actions: ApproveCallbackActions,
    ): Promise<PayPalOrderDetails> {
        try {
            return actions.order.get();
        } catch (_) {
            throw new RequestError();
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
            // Info: we use the same address to fill billing and consignment addresses to have valid quota on BE for order updating process
            // on this stage we don't have access to valid customer's address except shipping data
            await this._store.dispatch(this._billingAddressActionCreator.updateAddress(address));
            await this._store.dispatch(this._consignmentActionCreator.updateAddress(address));

            const shippingOption = this._getShippingOptionOrThrow();

            await this._store.dispatch(
                this._consignmentActionCreator.selectShippingOption(shippingOption.id),
            );
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
            await this._store.dispatch(
                this._consignmentActionCreator.selectShippingOption(shippingOption.id),
            );
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

        await this._store.dispatch(
            this._paymentActionCreator.submitPayment({ methodId, paymentData }),
        );
    }

    private async _updateOrder(): Promise<void> {
        const state = this._store.getState();
        const cart = state.cart.getCartOrThrow();
        const consignment = state.consignments.getConsignmentsOrThrow()[0];

        try {
            await this._paypalCommerceRequestSender.updateOrder({
                availableShippingOptions: consignment.availableShippingOptions,
                cartId: cart.id,
                selectedShippingOption: consignment.selectedShippingOption,
            });
        } catch (_error) {
            throw new RequestError();
        }
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
        const state = this._store.getState();
        const consignment = state.consignments.getConsignmentsOrThrow()[0];

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
        const cart = this._store.getState().cart.getCartOrThrow();

        const { orderId } = await this._paypalCommerceRequestSender.createOrder(
            cart.id,
            'paypalcommerce',
        );

        return orderId;
    }

    private _tokenizePayment(methodId: string, orderId?: string): void {
        if (!orderId) {
            throw new MissingDataError(MissingDataErrorType.MissingOrderId);
        }

        return this._formPoster.postForm('/checkout.php', {
            payment_type: 'paypal',
            action: 'set_external_checkout',
            provider: methodId,
            order_id: orderId,
        });
    }

    private _getPayPalCommerceSdkOrThrow(): PaypalCommerceSDK {
        if (!this._paypalCommerceSdk) {
            throw new PaymentMethodClientUnavailableError();
        }

        return this._paypalCommerceSdk;
    }

    private _removeElement(elementId?: string): void {
        const element = elementId && document.getElementById(elementId);

        if (element) {
            element.remove();
        }
    }

    private _handleError(error: Error) {
        if (this._onError && typeof this._onError === 'function') {
            this._onError(error);
        } else {
            throw error;
        }
    }
}
