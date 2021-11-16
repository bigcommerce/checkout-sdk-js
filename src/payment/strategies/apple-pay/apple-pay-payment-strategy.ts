import { PaymentStrategy } from "..";
import { PaymentMethodActionCreator, PaymentRequestOptions } from "../..";
import { CheckoutStore, InternalCheckoutSelectors } from "../../../checkout";
import { OrderRequestBody } from "../../../order";
import { OrderFinalizationNotRequiredError } from "../../../order/errors";
import { PaymentArgumentInvalidError } from "../../errors";
import { assertApplePayWindow } from "./is-apple-pay-window";

export default class ApplePayPaymentStrategy implements PaymentStrategy {
    constructor(
        private _store: CheckoutStore,
        private _paymentMethodActionCreator: PaymentMethodActionCreator,
    ) { }

    initialize(): Promise<InternalCheckoutSelectors> {
        return Promise.resolve(this._store.getState());
    }

    async execute(payload: OrderRequestBody, options?: PaymentRequestOptions): Promise<InternalCheckoutSelectors> {
        const { payment } = payload;
        const state = this._store.getState();
        const cart = state.cart.getCartOrThrow();

        const request = this._getBaseRequest(cart);

        const applePaySession = new ApplePaySession(1, request);

        if (!payment) {
            throw new PaymentArgumentInvalidError(['payment']);
        }

        const { methodId } = payment;
        const {
            paymentMethods: { getPaymentMethodOrThrow },
        } = await this._store.dispatch(
            this._paymentMethodActionCreator.loadPaymentMethod(methodId, options)
        );
        const paymentMethod = getPaymentMethodOrThrow(methodId);

        assertApplePayWindow(window);

        console.log(paymentMethod, payload);
        this._handleApplePayEvents(applePaySession);

        applePaySession.begin()

        // Applepay will handle the rest of the flow so return a promise that doesn't really resolve
        return new Promise<never>(() => {});
    }

    finalize(): Promise<InternalCheckoutSelectors> {
        return Promise.reject(new OrderFinalizationNotRequiredError());
    }

    deinitialize(): Promise<InternalCheckoutSelectors> {
        return Promise.resolve(this._store.getState());
    }

    private _getBaseRequest(cart: any): ApplePayJS.ApplePayPaymentRequest {
        return {
            countryCode: 'US',
            currencyCode: cart.currency.code,
            merchantCapabilities: ['supports3DS'],
            supportedNetworks: [
                "visa",
                "masterCard",
                "amex",
                'discover',
            ],
            lineItems: [
                {
                    label: "Sales Tax",
                    amount: "0.00"
                },
                {
                    label: "Shipping",
                    amount: "0.00"
                }
            ],
            total: {
                label: "Total",
                amount: cart.cartAmount,
                type: "final"
            },
        }
    }

    private _handleApplePayEvents(applePaySession: any) {
        console.log('applePaySession is: ', applePaySession);

        // Implement callback handler for onvalidatemerchant

        // Implement callback handler for onshippingcontactselected
        // this is when we dont pass shipping address to applepay

        // Implement callback handler for onpaymentauthorized

        return;
    }
}
