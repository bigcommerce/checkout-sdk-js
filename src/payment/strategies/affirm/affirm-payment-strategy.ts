import { CheckoutStore, /* CheckoutValidator ,*/ InternalCheckoutSelectors } from '../../../checkout';
import { MissingDataError, MissingDataErrorType } from '../../../common/error/errors';
import {  OrderActionCreator, OrderRequestBody } from '../../../order';
import { OrderFinalizationNotRequiredError } from '../../../order/errors';
import { RemoteCheckoutActionCreator } from '../../../remote-checkout';
import { PaymentArgumentInvalidError } from '../../errors';
// import PaymentActionCreator from '../../payment-action-creator';
import PaymentMethod from '../../payment-method';
import PaymentMethodActionCreator from '../../payment-method-action-creator';
import { PaymentInitializeOptions, PaymentRequestOptions } from '../../payment-request-options';
import PaymentStrategy from '../payment-strategy';

import affirmJs from './affirmJs';
import { AffirmItem, AffirmRequestData, SCRIPTS_DEFAULT } from './affirm';
import AffirmWindow from './affirm-window';
//import AffirmScriptLoader from './affirm-script-loader';
import AffirmSdk from './affirm-sdk';
import  getReturnURL from './get-return-url';
declare let affirm: any;

export default class AffirmPaymentStrategy implements PaymentStrategy {

    private _affirmSdk?: AffirmSdk;
    private _affirmRequest?: AffirmRequestData;

    constructor(
        private _store: CheckoutStore,
        /* private _checkoutValidator: CheckoutValidator,*/
        private _orderActionCreator: OrderActionCreator,
        /*private _paymentActionCreator: PaymentActionCreator,
        private _paymentMethodActionCreator: PaymentMethodActionCreator,
        private _remoteCheckoutActionCreator: RemoteCheckoutActionCreator,
        private _affirmScriptLoader: AffirmScriptLoader*/
    ) {

    }

    initialize(options: PaymentInitializeOptions): Promise<InternalCheckoutSelectors> {
        const state = this._store.getState();
        const paymentMethod = state.paymentMethods.getPaymentMethod(options.methodId, options.gatewayId);
        const publicApiKey = paymentMethod ? paymentMethod['initializationData']['publicKey'] : '';
        const testMode = paymentMethod!.config.testMode;
        if (!paymentMethod) {
            throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
        }
        affirmJs(publicApiKey, this._getScriptURI(testMode!));
        return Promise.resolve(this._store.getState());
    }

    execute(payload: OrderRequestBody, options?: PaymentRequestOptions): Promise<InternalCheckoutSelectors> {
        const order = { useStoreCredit: payload.useStoreCredit };
        const state = this._store.getState();
        const shippingAddress = state.shippingAddress.getShippingAddress();
        const billingAddress = state.billingAddress.getBillingAddress();
        const cart: any = state.cart.getCart();
        const checkout = state.checkout.getCheckout();
        let items: Array<AffirmItem> = [];
        for (let key in cart!.lineItems) {
            let itemType = cart.lineItems[key];
            for (let i = 0; i < itemType.length; i++) {
                items.push({
                    display_name: itemType[i].name,
                    sku: itemType[i].sku,
                    unit_price: itemType[i].salePrice,
                    qty: itemType[i].quantity,
                    item_image_url: itemType[i].imageUrl,
                    item_url: itemType[i].url
                });
            }
        }
        this._affirmRequest = {
            merchant: {
                user_confirmation_url: 'https://my-dev-store-723723656.store.bcdev/checkout.php?action=set_external_checkout&provider=affirm',
                user_cancel_url: 'https://my-dev-store-723723656.store.bcdev/checkout.php?action=set_external_checkout&provider=affirm',
                user_confirmation_url_action: "POST"
            },
            shipping: {
                name: {
                    first: shippingAddress!.firstName,
                    last: shippingAddress!.lastName,
                    full: `${shippingAddress!.firstName} ${shippingAddress!.lastName}`,
                },
                address: {
                    line1: shippingAddress!.address1,
                    line2: shippingAddress!.address2,
                    city: shippingAddress!.city,
                    state: shippingAddress!.stateOrProvinceCode,
                    zipcode: shippingAddress!.postalCode,
                    country: shippingAddress!.countryCode,
                },
                phone_number: shippingAddress!.phone,
                email: billingAddress!.email,
            },
            billing: {
                name: {
                    first: billingAddress!.firstName,
                    last: billingAddress!.lastName,
                    full: `${billingAddress!.firstName} ${billingAddress!.lastName}`,
                },
                address: {
                    line1: billingAddress!.address1,
                    line2: billingAddress!.address2,
                    city: billingAddress!.city,
                    state: billingAddress!.stateOrProvinceCode,
                    zipcode: billingAddress!.postalCode,
                    country: billingAddress!.countryCode,
                },
                phone_number: billingAddress!.phone,
                email: billingAddress!.email,
            },
            items: items,
            metadata: {
                shipping_type: checkout!.consignments[0].selectedShippingOption!.type
            },
            order_id: checkout!.orderId ? checkout!.orderId!.toString() : '',
            shipping_ammount: checkout!.shippingCostTotal * 100,
            tax_amount: checkout!.taxTotal * 100,
            total: checkout!.grandTotal * 100
        };
        console.log(this._affirmRequest.merchant);
        affirm.checkout(this._affirmRequest);
        debugger;
        return this._store.dispatch(this._orderActionCreator.submitOrder(order, options))
            .then(affirm.checkout.open())

    }

    deinitialize(options?: PaymentRequestOptions): Promise<InternalCheckoutSelectors> {
        if (affirm) {
            affirm = undefined;
        }
        return Promise.resolve(this._store.getState());
    }

    finalize(options: PaymentRequestOptions): Promise<InternalCheckoutSelectors> {
        console.log(options);
        return Promise.reject(new OrderFinalizationNotRequiredError());

    }    
    
    private _getScriptURI(testMode: boolean): string {
        return testMode ? SCRIPTS_DEFAULT.SANDBOX : SCRIPTS_DEFAULT.PROD;
    }
}
