import { FormPoster } from '@bigcommerce/form-poster';

import { BillingAddressActionCreator, BillingAddressRequestBody } from '../../../billing';
import { CartRequestSender } from '../../../cart';
import { BuyNowCartCreationError } from '../../../cart/errors';
import { CheckoutActionCreator, CheckoutStore } from '../../../checkout';
import {
    InvalidArgumentError,
    MissingDataError,
    MissingDataErrorType,
    RequestError,
} from '../../../common/error/errors';
import { OrderActionCreator } from '../../../order';
import { PaymentActionCreator } from '../../../payment';
import { PaymentMethodClientUnavailableError } from '../../../payment/errors';
import {
    ApproveCallbackActions,
    ApproveCallbackPayload,
    ButtonsOptions,
    PaypalCommerceRequestSender,
    PaypalCommerceScriptLoader,
    PaypalCommerceSDK,
    PaypalStyleOptions,
    ShippingAddressChangeCallbackPayload,
    ShippingOptionChangeCallbackPayload,
} from '../../../payment/strategies/paypal-commerce';
import { ConsignmentActionCreator, ShippingOption } from '../../../shipping';
import { CheckoutButtonInitializeOptions } from '../../checkout-button-options';
import CheckoutButtonStrategy from '../checkout-button-strategy';

import getValidButtonStyle from './get-valid-button-style';
import { PaypalCommerceButtonInitializeOptions } from './paypal-commerce-button-options';

export default class PaypalCommerceButtonStrategy implements CheckoutButtonStrategy {
    private _paypalCommerceSdk?: PaypalCommerceSDK;
    private _buyNowCartId?: string;

    constructor(
        private _store: CheckoutStore,
        private _checkoutActionCreator: CheckoutActionCreator,
        private _cartRequestSender: CartRequestSender,
        private _formPoster: FormPoster,
        private _paypalScriptLoader: PaypalCommerceScriptLoader,
        private _paypalCommerceRequestSender: PaypalCommerceRequestSender,
        private _consignmentActionCreator: ConsignmentActionCreator,
        private _billingAddressActionCreator: BillingAddressActionCreator,
        private _paymentActionCreator: PaymentActionCreator,
        private _orderActionCreator: OrderActionCreator,
    ) {}

    async initialize(options: CheckoutButtonInitializeOptions): Promise<void> {
        const { paypalcommerce, containerId, methodId } = options;

        if (!methodId) {
            throw new InvalidArgumentError(
                'Unable to initialize payment because "options.methodId" argument is not provided.',
            );
        }

        if (!containerId) {
            throw new InvalidArgumentError(
                `Unable to initialize payment because "options.containerId" argument is not provided.`,
            );
        }

        if (!paypalcommerce) {
            throw new InvalidArgumentError(
                `Unable to initialize payment because "options.paypalcommerce" argument is not provided.`,
            );
        }

        if (paypalcommerce.buyNowInitializeOptions) {
            const state = this._store.getState();
            const paymentMethod = state.paymentMethods.getPaymentMethodOrThrow(methodId);

            if (!paypalcommerce.currencyCode) {
                throw new InvalidArgumentError(
                    `Unable to initialize payment because "options.paypalcommerce.currencyCode" argument is not provided.`,
                );
            }

            this._paypalCommerceSdk = await this._paypalScriptLoader.getPayPalSDK(
                paymentMethod,
                paypalcommerce.currencyCode,
                paypalcommerce.initializesOnCheckoutPage,
            );
        } else {
            const state = await this._store.dispatch(
                this._checkoutActionCreator.loadDefaultCheckout(),
            );
            const currencyCode = state.cart.getCartOrThrow().currency.code;
            const paymentMethod = state.paymentMethods.getPaymentMethodOrThrow(methodId);

            this._paypalCommerceSdk = await this._paypalScriptLoader.getPayPalSDK(
                paymentMethod,
                currencyCode,
                paypalcommerce.initializesOnCheckoutPage,
            );
        }

        this._renderButton(containerId, methodId, paypalcommerce);
    }

    deinitialize(): Promise<void> {
        return Promise.resolve();
    }

    private _renderButton(
        containerId: string,
        methodId: string,
        paypalcommerce: PaypalCommerceButtonInitializeOptions,
    ): void {
        const { buyNowInitializeOptions, initializesOnCheckoutPage, style, onComplete } =
            paypalcommerce;
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
            style: style ? this._getButtonStyle(style) : {},
            onClick: () => this._handleClick(buyNowInitializeOptions),
            createOrder: () => this._createOrder(initializesOnCheckoutPage),
            ...paypalCallbacks,
        };

        const paypalButton = paypalCommerceSdk.Buttons(buttonRenderOptions);

        if (paypalButton.isEligible()) {
            paypalButton.render(`#${containerId}`);
        } else {
            this._removeElement(containerId);
        }
    }

    private async _handleClick(
        buyNowInitializeOptions: PaypalCommerceButtonInitializeOptions['buyNowInitializeOptions'],
    ): Promise<void> {
        if (
            buyNowInitializeOptions &&
            typeof buyNowInitializeOptions.getBuyNowCartRequestBody === 'function'
        ) {
            const cartRequestBody = buyNowInitializeOptions.getBuyNowCartRequestBody();

            if (!cartRequestBody) {
                throw new MissingDataError(MissingDataErrorType.MissingCart);
            }

            try {
                const { body: cart } = await this._cartRequestSender.createBuyNowCart(
                    cartRequestBody,
                );

                this._buyNowCartId = cart.id;
                await this._store.dispatch(this._checkoutActionCreator.loadCheckout(cart.id));
            } catch (error) {
                throw new BuyNowCartCreationError();
            }
        }
    }

    private async _onHostedCheckoutApprove(
        data: ApproveCallbackPayload,
        actions: ApproveCallbackActions,
        methodId: string,
        onComplete?: () => void,
    ): Promise<boolean> {
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

            return true;
        } catch (error) {
            throw new Error(error);
        }
    }

    private async _getOrderDetailsOrThrow(actions: ApproveCallbackActions) {
        try {
            return actions.order.get();
        } catch (error) {
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
            // on this stage we don't have access to valid customer's address accept shipping data
            await this._store.dispatch(this._billingAddressActionCreator.updateAddress(address));
            await this._store.dispatch(this._consignmentActionCreator.updateAddress(address));

            const shippingOption = this._getShippingOptionOrThrow();

            await this._store.dispatch(
                this._consignmentActionCreator.selectShippingOption(shippingOption.id),
            );
            await this._updateOrder();
        } catch (error) {
            throw new Error(error);
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
            throw new Error(error);
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

    private async _createOrder(initializesOnCheckoutPage?: boolean): Promise<string> {
        const cartId = this._buyNowCartId || this._store.getState().cart.getCartOrThrow().id;

        const providerId = initializesOnCheckoutPage ? 'paypalcommercecheckout' : 'paypalcommerce';

        const { orderId } = await this._paypalCommerceRequestSender.createOrder(providerId, {
            cartId,
        });

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
            ...(this._buyNowCartId && { cart_id: this._buyNowCartId }),
        });
    }

    private _getPayPalCommerceSdkOrThrow(): PaypalCommerceSDK {
        if (!this._paypalCommerceSdk) {
            throw new PaymentMethodClientUnavailableError();
        }

        return this._paypalCommerceSdk;
    }

    private _getButtonStyle(style: PaypalStyleOptions): PaypalStyleOptions {
        const { color, height, label, layout, shape } = getValidButtonStyle(style);

        return { color, height, label, layout, shape };
    }

    private _removeElement(elementId?: string): void {
        const element = elementId && document.getElementById(elementId);

        if (element) {
            element.remove();
        }
    }
}
