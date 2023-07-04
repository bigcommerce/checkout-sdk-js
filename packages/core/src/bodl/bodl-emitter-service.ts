import { LineItem, LineItemMap } from '../cart';
import { CheckoutSelectors, CheckoutStoreSelector } from '../checkout';
import { MissingDataError, MissingDataErrorType } from '../common/error/errors';
import { flatten } from 'lodash';

import { AnalyticStepOrder, AnalyticStepType } from './analytics-steps';
import BodlService from './bodl-service';
import {
    BodlEventsCheckout,
    BodlEventsPayload,
    BODLProduct,
    CommonCheckoutData,
} from './bodl-window';

export default class BodlEmitterService implements BodlService {
    private _checkoutStarted = false;
    private _emailEntryBegan = false;
    private _shippingOptionsShown = false;
    private _completedSteps: { [key: string]: boolean } = {};
    private state?: CheckoutStoreSelector;

    constructor(
        private subscribe: (subscriber: (state: CheckoutSelectors) => void) => void,
        private bodlEvents: BodlEventsCheckout,
    ) {
        this.subscribe((state) => {
            this.setState(state.data);

            const config = this.state?.getConfig();

            if (!config) {
                throw new MissingDataError(MissingDataErrorType.MissingCheckoutConfig);
            }
        });
    }

    setState(state: CheckoutStoreSelector) {
        this.state = state;
    }

    checkoutBegin(): void {
        const data = this._getCommonCheckoutData();

        if (this._checkoutStarted || !data) {
            return;
        }

        this.bodlEvents.emitCheckoutBeginEvent(data);

        this._checkoutStarted = true;
    }

    orderPurchased(): void {
        const order = this.state?.getOrder();

        if (!order) {
            return;
        }

        const {
            currency,
            isComplete,
            orderId,
            orderAmount,
            shippingCostTotal,
            lineItems,
            cartId,
            coupons,
            channelId,
            taxTotal,
        } = order;

        if (!isComplete) {
            return;
        }

        this.bodlEvents.emitOrderPurchasedEvent({
            event_id: cartId,
            currency: currency.code,
            order_id: orderId,
            tax: taxTotal,
            channel_id: channelId,
            cart_value: orderAmount,
            coupon_codes: coupons.map((coupon) => coupon.code.toUpperCase()),
            shipping_cost: shippingCostTotal,
            line_items: this._getProducts(lineItems, currency.code),
        });
    }

    stepCompleted(currentStep?: AnalyticStepType): void {
        if (!currentStep) {
            return;
        }

        AnalyticStepOrder.some((step: AnalyticStepType) => {
            if (!this._hasStepCompleted(step)) {
                this._trackCompletedStep(step);
            }

            return step === currentStep;
        });
    }

    customerEmailEntry(email?: string) {
        if (this._emailEntryBegan || !email?.length) {
            return;
        }

        this._emailEntryBegan = true;
        this.bodlEvents.emit('bodl_checkout_email_entry_began');
    }

    customerSuggestionInit(payload?: BodlEventsPayload) {
        this.bodlEvents.emit('bodl_checkout_customer_suggestion_initialization', payload);
    }

    customerSuggestionExecute() {
        this.bodlEvents.emit('bodl_checkout_customer_suggestion_execute');
    }

    customerPaymentMethodExecuted(payload?: BodlEventsPayload) {
        this.bodlEvents.emit('bodl_checkout_customer_payment_method_executed', payload);
    }

    showShippingMethods() {
        if (this._shippingOptionsShown) {
            return;
        }

        this._shippingOptionsShown = true;
        this.bodlEvents.emit('bodl_checkout_show_shipping_options');
    }

    selectedPaymentMethod(paymentOption?: string) {
        const commonData = this._getCommonCheckoutData();

        if (!commonData || !paymentOption) {
            return;
        }

        this.bodlEvents.emitPaymentDetailsProvidedEvent({
            ...commonData,
            payment_type: paymentOption,
        });
    }

    clickPayButton(payload?: BodlEventsPayload) {
        this.bodlEvents.emit('bodl_checkout_click_pay_button', payload);
    }

    paymentRejected() {
        this.bodlEvents.emit('bodl_checkout_payment_rejected');
    }

    paymentComplete() {
        this.bodlEvents.emit('bodl_checkout_payment_complete');
    }

    exitCheckout() {
        this.bodlEvents.emit('bodl_checkout_exit');
    }

    private _trackCompletedStep(step: AnalyticStepType) {
        this._completedSteps[step] = true;

        const bodlEventsMap: { [key in AnalyticStepType]?: () => void } = {
            [AnalyticStepType.SHIPPING]: this._trackShippingStepCompleted.bind(this),
        };
        const emit = bodlEventsMap[step];

        if (emit) {
            emit();
        } else {
            this.bodlEvents.emit('bodl_checkout_step_completed', { step });
        }
    }

    private _trackShippingStepCompleted(): void {
        const shippingMethod = this.state?.getSelectedShippingOption()?.description;
        const commonData = this._getCommonCheckoutData();

        if (!commonData || !shippingMethod) {
            return;
        }

        this.bodlEvents.emitShippingDetailsProvidedEvent({
            ...commonData,
            shipping_method: shippingMethod,
        });
    }

    private _getCommonCheckoutData(): CommonCheckoutData | null {
        const checkout = this.state?.getCheckout();

        if (!checkout) {
            return null;
        }

        const {
            cart: { cartAmount, currency, lineItems, id, coupons },
            channelId,
        } = checkout;

        return {
            event_id: id,
            currency: currency.code,
            cart_value: cartAmount,
            coupon_codes: coupons.map((coupon) => coupon.code.toUpperCase()),
            line_items: this._getProducts(lineItems, currency.code),
            channel_id: channelId,
        };
    }

    private _getProducts(lineItems: LineItemMap, currencyCode: string): BODLProduct[] {
        const customItems: BODLProduct[] = (lineItems.customItems || []).map((item) => ({
            product_id: item.id,
            sku: item.sku,
            base_price: item.listPrice,
            sale_price: item.listPrice,
            purchase_price: item.listPrice,
            quantity: item.quantity,
            product_name: item.name,
            currency: currencyCode,
        }));

        const giftCertificateItems: BODLProduct[] = lineItems.giftCertificates.map((item) => {
            return {
                product_id: item.id,
                gift_certificate_id: item.id,
                base_price: item.amount,
                sale_price: item.amount,
                purchase_price: item.amount,
                product_name: item.name,
                gift_certificate_name: item.name,
                gift_certificate_theme: item.theme,
                quantity: 1,
                currency: currencyCode,
            };
        });

        const physicalAndDigitalItems: BODLProduct[] = [
            ...lineItems.physicalItems,
            ...lineItems.digitalItems,
        ].map((item) => {
            const getCategoryNames = (lineItem: LineItem): string[] => {
                if (Array.isArray(lineItem.categoryNames)) {
                    return lineItem.categoryNames;
                } else if (Array.isArray(lineItem.categories)) {
                    return flatten(lineItem.categories).map(({ name }) => name);
                }

                return [];
            };

            let itemAttributes;

            if (item.options && item.options.length) {
                itemAttributes = item.options.map((option) => `${option.name}:${option.value}`);
                itemAttributes.sort();
            }

            return {
                product_id: item.productId,
                quantity: item.quantity,
                product_name: item.name,
                base_price: item.listPrice,
                sale_price: item.salePrice,
                purchase_price: item.salePrice > 0 ? item.salePrice : item.listPrice,
                sku: item.sku,
                variant_id: item.variantId,
                discount: item.discountAmount,
                brand_name: item.brand,
                currency: currencyCode,
                category_names: getCategoryNames(item),
                retail_price: item.retailPrice,
            };
        });

        return [...customItems, ...physicalAndDigitalItems, ...giftCertificateItems].map(
            (item) => ({
                ...item,
                product_id: String(item.product_id),
            }),
        );
    }

    private _hasStepCompleted(step: AnalyticStepType): boolean {
        return this._completedSteps[step];
    }
}
