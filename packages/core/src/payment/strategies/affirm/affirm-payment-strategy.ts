import { LineItemCategory } from '../../../cart';
import { CheckoutStore, InternalCheckoutSelectors } from '../../../checkout';
import { MissingDataError, MissingDataErrorType, NotInitializedError, NotInitializedErrorType } from '../../../common/error/errors';
import { AmountTransformer } from '../../../common/utility';
import { Order, OrderActionCreator, OrderIncludes, OrderRequestBody } from '../../../order';
import { OrderFinalizationNotRequiredError } from '../../../order/errors';
import { Consignment } from '../../../shipping';
import { PaymentArgumentInvalidError, PaymentMethodCancelledError, PaymentMethodInvalidError } from '../../errors';
import PaymentActionCreator from '../../payment-action-creator';
import PaymentMethodActionCreator from '../../payment-method-action-creator';
import { PaymentInitializeOptions, PaymentRequestOptions } from '../../payment-request-options';
import PaymentStrategy from '../payment-strategy';

import { Affirm, AffirmAddress, AffirmDiscount, AffirmFailResponse, AffirmItem, AffirmRequestData, AffirmSuccessResponse } from './affirm';
import AffirmScriptLoader from './affirm-script-loader';

export default class AffirmPaymentStrategy implements PaymentStrategy {
    private _affirm?: Affirm;

    constructor(
        private _store: CheckoutStore,
        private _orderActionCreator: OrderActionCreator,
        private _paymentActionCreator: PaymentActionCreator,
        private _paymentMethodActionCreator: PaymentMethodActionCreator,
        private _affirmScriptLoader: AffirmScriptLoader
    ) { }

    initialize(options: PaymentInitializeOptions): Promise<InternalCheckoutSelectors> {
        return this._store.dispatch(this._paymentMethodActionCreator.loadPaymentMethod(options.methodId))
            .then(state => {
                const paymentMethod = state.paymentMethods.getPaymentMethod(options.methodId);

                if (!paymentMethod || !paymentMethod.clientToken) {
                    throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
                }

                const { config: { testMode }, clientToken: publicKey } = paymentMethod;

                return this._affirmScriptLoader.load(publicKey, testMode);
            })
            .then(affirm => {
                this._affirm = affirm;

                return this._store.getState();
            });
    }

    execute(payload: OrderRequestBody, options?: PaymentRequestOptions): Promise<InternalCheckoutSelectors> {
        const methodId = payload.payment && payload.payment.methodId;
        const { useStoreCredit } = payload;
        const { _affirm } = this;

        if (!_affirm) {
            throw new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized);
        }

        if (!methodId) {
            throw new PaymentArgumentInvalidError(['payment.methodId']);
        }

        const requestOptions = {
            ...options,
            params: {
                include: [
                    OrderIncludes.PhysicalItemsCategories,
                    OrderIncludes.DigitalItemsCategories,
                ],
            },
        };

        return this._store.dispatch(this._orderActionCreator.submitOrder({ useStoreCredit }, requestOptions))
            .then<AffirmSuccessResponse>(() => {
                _affirm.checkout(this._getCheckoutInformation());

                return new Promise((resolve, reject) => {
                    _affirm.checkout.open({
                        onFail: (failObject: AffirmFailResponse) => {
                            failObject.reason === 'canceled' ? reject(new PaymentMethodCancelledError()) : reject(new PaymentMethodInvalidError());
                        },
                        onSuccess: successObject => { resolve(successObject); },
                    });
                    _affirm.ui.error.on('close', () => {
                        reject(new PaymentMethodCancelledError());
                    });
                });
            })
            .then(result => {
                const paymentPayload = {
                    methodId,
                    paymentData: { nonce: result.checkout_token },
                };

                return this._store.dispatch(this._paymentActionCreator.submitPayment(paymentPayload));
            });
    }

    deinitialize(): Promise<InternalCheckoutSelectors> {
        if (this._affirm) {
            this._affirm = undefined;
        }

        return Promise.resolve(this._store.getState());
    }

    finalize(): Promise<InternalCheckoutSelectors> {
        return Promise.reject(new OrderFinalizationNotRequiredError());
    }

    private _getCheckoutInformation(): AffirmRequestData {
        const state = this._store.getState();
        const config = state.config.getStoreConfig();
        const consignments = state.consignments.getConsignments();
        const order = state.order.getOrder();

        if (!config) {
            throw new MissingDataError(MissingDataErrorType.MissingCheckoutConfig);
        }

        if (!order) {
            throw new MissingDataError(MissingDataErrorType.MissingCheckout);
        }

        const amountTransformer = new AmountTransformer(order.currency.decimalPlaces);
        const billingAddress = this._getBillingAddress();

        return {
            merchant: {
                user_confirmation_url: config.links.checkoutLink,
                user_cancel_url: config.links.checkoutLink,
                user_confirmation_url_action: 'POST',
            },
            shipping: this._getShippingAddress() || billingAddress,
            billing: billingAddress,
            items: this._getItems(amountTransformer, order),
            metadata: {
                shipping_type: this._getShippingType(consignments),
                mode: 'modal',
                platform_type: 'BigCommerce',
                platform_version: '',
                platform_affirm: '',
            },
            discounts: this._getDiscounts(amountTransformer, order),
            order_id: order.orderId ? order.orderId.toString() : '',
            shipping_amount: amountTransformer.toInteger(order.shippingCostTotal),
            tax_amount: amountTransformer.toInteger(order.taxTotal),
            total: amountTransformer.toInteger(order.orderAmount),
        };
    }

    private _getShippingType(consignments?: Consignment[]): string {
        if (!consignments) {
            return '';
        }

        const consignment = consignments[0];

        return consignment && consignment.selectedShippingOption ?
            consignment.selectedShippingOption.type : '';
    }

    private _getBillingAddress(): AffirmAddress {
        const state = this._store.getState();
        const billingAddress = state.billingAddress.getBillingAddress();

        if (!billingAddress) {
            throw new MissingDataError(MissingDataErrorType.MissingBillingAddress);
        }

        const billingInformation = {
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

    private _getShippingAddress(): AffirmAddress | undefined {
        const state = this._store.getState();
        const shippingAddress = state.shippingAddress.getShippingAddress();

        if (!shippingAddress) {
            return;
        }

        const shippingInformation = {
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
        };

        return shippingInformation;
    }

    private _getItems(amountTransformer: AmountTransformer, order: Order): AffirmItem[] {
        const items: AffirmItem[] = [];

        for (const item of order.lineItems.physicalItems) {
            items.push({
                display_name: item.name,
                sku: item.sku,
                unit_price: amountTransformer.toInteger(item.salePrice),
                qty: item.quantity,
                item_image_url: item.imageUrl,
                item_url: item.url,
                categories: this._getCategories(item.categories),
            });
        }

        for (const item of order.lineItems.digitalItems) {
            items.push({
                display_name: item.name,
                sku: item.sku,
                unit_price: amountTransformer.toInteger(item.salePrice),
                qty: item.quantity,
                item_image_url: item.imageUrl,
                item_url: item.url,
                categories: this._getCategories(item.categories),
            });
        }

        for (const item of order.lineItems.giftCertificates) {
            items.push({
                display_name: item.name,
                sku: '',
                unit_price: amountTransformer.toInteger(item.amount),
                qty: 1,
                item_image_url: '',
                item_url: '',
            });
        }

        if (order.lineItems.customItems) {
            for (const item of order.lineItems.customItems) {
                items.push({
                    display_name: item.name,
                    sku: item.sku,
                    unit_price: amountTransformer.toInteger(item.listPrice),
                    qty: item.quantity,
                    item_image_url: '',
                    item_url: '',
                });
            }
        }

        return items;
    }

    private _getDiscounts(amountTransformer: AmountTransformer, order: Order): AffirmDiscount {
        const discounts: AffirmDiscount = {};

        for (const line of order.coupons) {
            if (line.discountedAmount > 0) {
                discounts[line.code] = {
                    discount_amount: amountTransformer.toInteger(line.discountedAmount),
                    discount_display_name: line.displayName,
                };
            }
        }

        if (order.discountAmount > 0) {
            discounts.DISCOUNTED_AMOUNT = {
                discount_amount: amountTransformer.toInteger(order.discountAmount),
                discount_display_name: 'discount',
            };
        }

        return discounts;
    }

    private _getCategories(categories?: LineItemCategory[][]): string[][] {
        if (!categories) {
            return[[]];
        }

        return categories.map(categoryTree => categoryTree.map(category => category.name));
    }
}
