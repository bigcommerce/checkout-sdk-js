import { FormPoster } from '@bigcommerce/form-poster';

import { CheckoutActionCreator, CheckoutStore } from '../../../checkout';
import { InvalidArgumentError, MissingDataError, MissingDataErrorType, } from '../../../common/error/errors';
import { PaymentMethodClientUnavailableError } from '../../../payment/errors';
import {
    ApproveDataOptions,
    ButtonsOptions1, CompleteCallbackDataPayload,
    PaypalButtonStyleOptions,
    PaypalCommerceRequestSender,
    PaypalCommerceScriptLoader,
    PaypalCommerceSDK,
    ShippingAddressChangeCallbackPayload,
    ShippingOptionChangeCallbackPayload
} from "../../../payment/strategies/paypal-commerce";
import { CheckoutButtonInitializeOptions } from '../../checkout-button-options';
import CheckoutButtonStrategy from '../checkout-button-strategy';

import getValidButtonStyle from './get-valid-button-style';
import { BillingAddressActionCreator, BillingAddressRequestBody } from '../../../billing';
// import { PaymentActionCreator } from '../../../payment';
import { ConsignmentActionCreator, ShippingOption } from "../../../shipping";

export default class PaypalCommerceButtonStrategy implements CheckoutButtonStrategy {
    private _paypalCommerceSdk?: PaypalCommerceSDK;

    constructor(
        private _store: CheckoutStore,
        private _checkoutActionCreator: CheckoutActionCreator,
        private _formPoster: FormPoster,
        private _paypalScriptLoader: PaypalCommerceScriptLoader,
        private _paypalCommerceRequestSender: PaypalCommerceRequestSender,
        private _consignmentActionCreator: ConsignmentActionCreator,
        private _billingAddressActionCreator: BillingAddressActionCreator,
        // private _paymentActionCreator: PaymentActionCreator
    ) {}

    async initialize(options: CheckoutButtonInitializeOptions): Promise<void> {
        const { paypalcommerce, containerId, methodId } = options

        if (!methodId) {
            throw new InvalidArgumentError('Unable to initialize payment because "options.methodId" argument is not provided.');
        }

        if (!containerId) {
            throw new InvalidArgumentError(`Unable to initialize payment because "options.containerId" argument is not provided.`);
        }

        if (!paypalcommerce) {
            throw new InvalidArgumentError(`Unable to initialize payment because "options.paypalcommerce" argument is not provided.`);
        }

        const { initializesOnCheckoutPage, style } = paypalcommerce;

        const state = await this._store.dispatch(this._checkoutActionCreator.loadDefaultCheckout());
        const currencyCode = state.cart.getCartOrThrow().currency.code;
        const paymentMethod = state.paymentMethods.getPaymentMethodOrThrow(methodId);
        const { initializationData } = paymentMethod;
        const { isHostedCheckoutEnabled } = initializationData;
        this._paypalCommerceSdk = await this._paypalScriptLoader.getPayPalSDK(paymentMethod, currencyCode, initializesOnCheckoutPage);

        this._renderButton(containerId, methodId, initializesOnCheckoutPage, style, isHostedCheckoutEnabled);
    }

    deinitialize(): Promise<void> {
        return Promise.resolve();
    }

    private _renderButton(containerId: string, methodId: string, initializesOnCheckoutPage?: boolean, style?: PaypalButtonStyleOptions, isHostedCheckoutEnabled?: boolean): void {
        const paypalCommerceSdk = this._getPayPalCommerceSdkOrThrow();

        const buttonRenderOptions: ButtonsOptions1 = {
            fundingSource: paypalCommerceSdk.FUNDING.PAYPAL,
            style: style ? this._getButtonStyle(style) : {},
            onShippingAddressChange: (data: ShippingAddressChangeCallbackPayload) => this._onShippingAddressChange(data),
        ...(isHostedCheckoutEnabled && { onShippingOptionsChange: (data: ShippingOptionChangeCallbackPayload) => this._onShippingOptionsChange(data)}),
            createOrder: () => this._createOrder(initializesOnCheckoutPage),
            onComplete: (data: CompleteCallbackDataPayload) => console.log(data),
            onApprove: ({ orderID }: ApproveDataOptions) => this._tokenizePayment(methodId, orderID),
        };

        const paypalButton = paypalCommerceSdk.Buttons(buttonRenderOptions);

        if (paypalButton.isEligible()) {
            paypalButton.render(`#${containerId}`);
        } else {
            this._removeElement(containerId);
        }
    }

    private async _onShippingAddressChange(data: ShippingAddressChangeCallbackPayload): Promise<void> {
        const address = this._transformAddress({
            city: data.shippingAddress.city,
            countryCode: data.shippingAddress.country_code,
            postalCode: data.shippingAddress.postal_code,
            stateOrProvinceCode: data.shippingAddress.state,
        });

        // Info: we use the same address to fill billing and consignment addresses to have valid quota on BE for order updating process
        // on this stage we don't have access to valid customer's address accept shipping data
        await this._store.dispatch(this._billingAddressActionCreator.updateAddress(address));
        await this._store.dispatch(this._consignmentActionCreator.updateAddress(address));

        const shippingOption = this._getShippingOptionOrThrow();

        await this._store.dispatch(this._consignmentActionCreator.selectShippingOption(shippingOption.id));
        await this._updateOrder();
    }

    private async _onShippingOptionsChange(data: ShippingOptionChangeCallbackPayload): Promise<void> {
        const shippingOption = this._getShippingOptionOrThrow(data.selectedShippingOption?.id);

        await this._store.dispatch(this._consignmentActionCreator.selectShippingOption(shippingOption.id));
        await this._updateOrder();
    }

    // private async _onComplete(
    //     data: CompleteCallbackDataPayload,
    //     methodId: string,
    //     callback?: () => void
    // ): Promise<void> {
    //     await this._submitPayment(methodId, data.orderID);
    //
    //     if (callback) {
    //         callback();
    //     }
    // }

    // private async _submitPayment(methodId: string, orderId: string): Promise<void> {
    //     const paymentData =  {
    //         formattedPayload: {
    //             vault_payment_instrument: null,
    //             set_as_default_stored_instrument: null,
    //             device_info: null,
    //             method_id: methodId,
    //             paypal_account: {
    //                 order_id: orderId,
    //             },
    //         },
    //     };
    //
    //     await this._store.dispatch(this._paymentActionCreator.submitPayment({ methodId, paymentData }));
    // }

    private async _updateOrder(): Promise<void> {
        const state = this._store.getState();
        const cart = state.cart.getCartOrThrow();
        const consignment = state.consignments.getConsignmentsOrThrow()[0];

        await this._paypalCommerceRequestSender.updateOrder({
            availableShippingOptions: consignment?.availableShippingOptions,
            cartId: cart.id,
            selectedShippingOption: consignment?.selectedShippingOption,
        });
    }

    private _transformAddress(address?: Partial<BillingAddressRequestBody>): BillingAddressRequestBody {
        return {
            firstName: address?.firstName || 'Fake',
            lastName: address?.lastName || 'Fake',
            email: address?.email || 'fake@fake.fake',
            phone: '',
            company: '',
            address1: address?.address1 || 'Fake street',
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

        const availableShippingOptions = consignment?.availableShippingOptions || [];

        const recommendedShippingOption = availableShippingOptions.find(option => option.isRecommended);
        const selectedShippingOption = selectedShippingOptionId
            ? availableShippingOptions.find(option => option.id === selectedShippingOptionId)
            : availableShippingOptions.find(option => option.id === consignment?.selectedShippingOption?.id);

        const shippingOptionToSelect = selectedShippingOption || recommendedShippingOption;

        if (!shippingOptionToSelect) {
            throw new Error('Your order can\'t be shipped to this address');
        }

        return shippingOptionToSelect;
    }

    private async _createOrder(initializesOnCheckoutPage?: boolean): Promise<string> {
        const state = this._store.getState();
        const cart = state.cart.getCartOrThrow();

        const providerId = initializesOnCheckoutPage ? 'paypalcommercecheckout': 'paypalcommerce';

        const { orderId } = await this._paypalCommerceRequestSender.createOrder(cart.id, providerId);

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

    private _getButtonStyle(style: PaypalButtonStyleOptions): PaypalButtonStyleOptions {
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
