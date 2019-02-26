import { CheckoutStore, InternalCheckoutSelectors } from '../../../checkout';
import { CustomError, MissingDataError, MissingDataErrorType, NotInitializedError, NotInitializedErrorType} from '../../../common/error/errors';
import { OrderActionCreator, OrderRequestBody } from '../../../order';
import { RemoteCheckoutActionCreator } from '../../../remote-checkout';
import { PaymentArgumentInvalidError } from '../../errors';
import PaymentActionCreator from '../../payment-action-creator';
import { PaymentInitializeOptions, PaymentRequestOptions } from '../../payment-request-options';
import PaymentStrategy from '../payment-strategy';

import affirmJs from './affirmJs';
import { AffirmAddress, AffirmItem, AffirmRequestData, SCRIPTS_DEFAULT } from './affirm';
declare let affirm: any;

export default class AffirmPaymentStrategy implements PaymentStrategy {

    constructor(
        private _store: CheckoutStore,
        private _orderActionCreator: OrderActionCreator,
        private _paymentActionCreator: PaymentActionCreator,
        private _remoteCheckoutActionCreator: RemoteCheckoutActionCreator,
    ) {

    }

    initialize(options: PaymentInitializeOptions): Promise<InternalCheckoutSelectors> {
        const state = this._store.getState();
        const paymentMethod = state.paymentMethods.getPaymentMethod(options.methodId, options.gatewayId);

        if (!paymentMethod) {
            throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
        }

        const testMode = paymentMethod.config.testMode;
        const publicApiKey = paymentMethod.initializationData.publicKey;

        affirmJs(publicApiKey, this._getScriptURI(testMode!));
        return Promise.resolve(this._store.getState());
    }

    execute(payload: OrderRequestBody, options?: PaymentRequestOptions): Promise<InternalCheckoutSelectors> {
        const paymentId = payload.payment && payload.payment.methodId;
        const useStoreCredit = !!payload.useStoreCredit;

        if (!paymentId) {
            throw new PaymentArgumentInvalidError(['payment.methodId']);
        }

        return this._store.dispatch(this._remoteCheckoutActionCreator.initializePayment(paymentId, { useStoreCredit }))
            .then(affirm.checkout(this._initiliazeCheckout()))
            .then(affirm.checkout.open())
            .then(() => new Promise<never>(() => {}));

    }

    deinitialize(options?: PaymentRequestOptions): Promise<InternalCheckoutSelectors> {
        if (affirm) {
            affirm = undefined;
        }
        return Promise.resolve(this._store.getState());
    }

    finalize(options: PaymentRequestOptions): Promise<InternalCheckoutSelectors> {

        const state = this._store.getState();
        const payment = state.payment.getPaymentId();
        const config = state.config.getContextConfig();
        const affirm = state.remoteCheckout.getCheckout('affirm');

        if (!payment) {
            throw new MissingDataError(MissingDataErrorType.MissingCheckout);
        }

        if (!config || !config.payment.token) {
            throw new MissingDataError(MissingDataErrorType.MissingCheckoutConfig);
        }

        if (!affirm || !affirm.settings) {
            throw new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized);
        }

        const orderPayload = {
            useStoreCredit: affirm.settings.useStoreCredit,
        };

        const paymentPayload = {
            methodId: payment.providerId,
            paymentData: { nonce: config.payment.token },
        };

        return this._store.dispatch(this._orderActionCreator.submitOrder(orderPayload, options))
            .then(() => this._store.dispatch(this._paymentActionCreator.submitPayment(paymentPayload)))
    }

    private _getScriptURI(testMode: boolean): string {
        return testMode ? SCRIPTS_DEFAULT.SANDBOX : SCRIPTS_DEFAULT.PROD;
    }

    private _initiliazeCheckout(): AffirmRequestData {
        const state = this._store.getState();
        const checkout = state.checkout.getCheckout();
        const config = state.config.getStoreConfig();

        if (!config) {
            throw new MissingDataError(MissingDataErrorType.MissingCheckoutConfig);
        }

        if (!checkout) {
            throw new MissingDataError(MissingDataErrorType.MissingCheckout);
        }

        let affirmRequestObject: AffirmRequestData = {
            merchant: {
                user_confirmation_url: `${config.links.checkoutLink}.php?action=set_external_checkout&provider=affirm&status=success`,
                user_cancel_url: `${config.links.checkoutLink}.php?action=set_external_checkout&provider=affirm&status=cancelled`,
                user_confirmation_url_action: "POST"
            },
            shipping: this._setShippingAddress(),
            billing: this._setBillingAddress(),
            items: this._buildItems(),
            metadata: {
                shipping_type: checkout.consignments[0].selectedShippingOption!.type
            },
            order_id: checkout.orderId ? checkout.orderId.toString() : '',
            shipping_ammount: checkout.shippingCostTotal * 100,
            tax_amount: checkout.taxTotal * 100,
            total: checkout.grandTotal * 100
        };
        return affirmRequestObject;
    }

    private _setBillingAddress(): AffirmAddress {
        const state = this._store.getState();
        const billingAddress = state.billingAddress.getBillingAddress();

        if (!billingAddress) {
            throw new MissingDataError(MissingDataErrorType.MissingBillingAddress);
        }

        let billingInformation = {
            name: {
                first: billingAddress.firstName,
                last: billingAddress.lastName,
                full: `${billingAddress.firstName} ${billingAddress.lastName}`,
            },
            address: {
                line1: billingAddress.address1,
                line2: billingAddress.address2,
                city: billingAddress.city,
                state: billingAddress.stateOrProvinceCode,
                zipcode: billingAddress.postalCode,
                country: billingAddress.countryCode,
            },
            phone_number: billingAddress.phone,
            email: billingAddress.email,
        };

        return billingInformation;
    }

    private _setShippingAddress(): AffirmAddress {
        const state = this._store.getState();
        const shippingAddress = state.shippingAddress.getShippingAddress();
        const billingAddress = state.billingAddress.getBillingAddress();

        if (!shippingAddress) {
            throw new MissingDataError(MissingDataErrorType.MissingShippingAddress);
        }

        if (!billingAddress) {
            throw new MissingDataError(MissingDataErrorType.MissingBillingAddress);
        }
        
        let shippingInformation = {
            name: {
                first: shippingAddress.firstName,
                last: shippingAddress.lastName,
                full: `${shippingAddress.firstName} ${shippingAddress.lastName}`,
            },
            address: {
                line1: shippingAddress.address1,
                line2: shippingAddress.address2,
                city: shippingAddress.city,
                state: shippingAddress.stateOrProvinceCode,
                zipcode: shippingAddress.postalCode,
                country: shippingAddress.countryCode,
            },
            phone_number: shippingAddress.phone,
            email: shippingAddress.email || billingAddress.email,
        };

        return shippingInformation;
    }

    private _buildItems(): Array<AffirmItem> {
        const state = this._store.getState();
        const cart = state.cart.getCart();

        if (!cart) {
            throw new MissingDataError(MissingDataErrorType.MissingCart);
        }
        let items: Array<AffirmItem> = [];

        for (const key in cart.lineItems) {
            let itemType = (cart.lineItems as any)[key];
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
        return items;
    }
}
