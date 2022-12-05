import { LineItemMap } from '../cart';
import { CheckoutSelectors, CheckoutStoreSelector } from '../checkout';
import { MissingDataError, MissingDataErrorType } from '../common/error/errors';

import { AnalyticStepOrder, AnalyticStepType } from './analytics-steps';
import BodlService from './bodl-service';
import { BodlEventsCheckout, BodlEventsPayload, BODLProduct } from './bodl-window';

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
        if (this._checkoutStarted) {
            return;
        }

        const checkout = this.state?.getCheckout();

        if (!checkout) {
            return;
        }

        const {
            cart: { cartAmount, currency, lineItems, id, coupons },
            channelId,
        } = checkout;

        this.bodlEvents.emitCheckoutBeginEvent({
            event_id: id,
            currency: currency.code,
            cart_value: cartAmount,
            coupon_codes: coupons.map((coupon) => coupon.code.toUpperCase()),
            line_items: this._getProducts(lineItems, currency.code),
            channel_id: channelId,
        });

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
        this.bodlEvents.emit('bodl_checkout_payment_method_selected', { paymentOption });
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
                category_names: item.categoryNames || [],
            };
        });

        return [...customItems, ...physicalAndDigitalItems, ...giftCertificateItems];
    }

    private _trackCompletedStep(step: AnalyticStepType) {
        this._completedSteps[step] = true;
        this.bodlEvents.emit('bodl_checkout_step_completed', { step });
    }

    private _hasStepCompleted(step: AnalyticStepType): boolean {
        return this._completedSteps[step];
    }
}
