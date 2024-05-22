import {
    AmountTransformer,
    Consignment,
    LineItemCategory,
    MissingDataError,
    MissingDataErrorType,
    NotInitializedError,
    NotInitializedErrorType,
    Order,
    OrderFinalizationNotRequiredError,
    OrderRequestBody,
    PaymentArgumentInvalidError,
    PaymentInitializeOptions,
    PaymentIntegrationService,
    PaymentMethodCancelledError,
    PaymentMethodInvalidError,
    PaymentRequestOptions,
    PaymentStrategy,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import {
    Affirm,
    AffirmAddress,
    AffirmDiscount,
    AffirmFailResponse,
    AffirmHostWindow,
    AffirmItem,
    AffirmRequestData,
    AffirmSuccessResponse,
} from './affirm';
import AffirmScriptLoader from './affirm-script-loader';

export default class AffirmPaymentStrategy implements PaymentStrategy {
    private affirm?: Affirm;

    constructor(
        private paymentIntegrationService: PaymentIntegrationService,
        private affirmScriptLoader: AffirmScriptLoader,
    ) {}

    async initialize(options: PaymentInitializeOptions): Promise<void> {
        await this.paymentIntegrationService.loadPaymentMethod(options.methodId);

        const state = this.paymentIntegrationService.getState();

        const {
            clientToken,
            config: { testMode },
        } = state.getPaymentMethodOrThrow(options.methodId);

        if (!clientToken) {
            throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
        }

        console.log('window ===> ', window);
        this.affirm = await this.affirmScriptLoader.load(clientToken, testMode);
        console.log('this.affirm', this.affirm, window);

        // tu jest problem. this.affirm.ui.error -> brakuje tutaj on. Dlatego później się wywala
        console.log('window ===> ', window);
        console.log('this.affirm ===> ', this.affirm);
    }

    async execute(payload: OrderRequestBody, options?: PaymentRequestOptions): Promise<void> {
        const methodId = payload.payment?.methodId;
        const { useStoreCredit } = payload;

        console.log('this.affirm', this.affirm, window);

        if (!this.affirm) {
            throw new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized);
        }

        if (!methodId) {
            throw new PaymentArgumentInvalidError(['payment.methodId']);
        }

        await this.paymentIntegrationService.submitOrder({ useStoreCredit }, options);

        const affirmCheckout = await this.initializeAffirmCheckout();

        const paymentPayload = {
            methodId,
            paymentData: { nonce: affirmCheckout.checkout_token },
        };

        await this.paymentIntegrationService.submitPayment(paymentPayload);
    }

    deinitialize(): Promise<void> {
        if (this.affirm) {
            this.affirm = undefined;
        }

        return Promise.resolve();
    }

    finalize(): Promise<void> {
        return Promise.reject(new OrderFinalizationNotRequiredError());
    }

    private initializeAffirmCheckout(): Promise<AffirmSuccessResponse> {
        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
        this.affirm = (window as AffirmHostWindow).affirm;
        this.affirm?.checkout(this.getCheckoutInformation());

        // console.log('this.affirm?.checkout ===> ', this.affirm?.checkout);
        // console.log('this.affirm?.checkout.open ===> ', this.affirm?.checkout.open);

        // console.log('this.affirm?.ui ===>', this.affirm?.ui);
        // console.log('this.affirm?.ui.error ===>', this.affirm?.ui.error);
        // console.log('this.affirm?.ui.error.on ===>', this.affirm?.ui.error.on);
        console.log('this.affirm', this.affirm);
        console.log('window', window);

        return new Promise((resolve, reject) => {
            this.affirm?.checkout.open({
                onFail: (failObject: AffirmFailResponse) => {
                    if (failObject.reason === 'canceled') {
                        console.log('onFail canceled this.affirm ', this.affirm, window);

                        reject(new PaymentMethodCancelledError());
                    } else {
                        console.log('onFail else this.affirm', this.affirm, window);
                        reject(new PaymentMethodInvalidError());
                    }
                },
                onSuccess: (successObject) => {
                    console.log('onSucces this.affirm', this.affirm, window);
                    resolve(successObject);
                },
            });
            this.affirm?.ui.error.on('close', () => {
                reject(new PaymentMethodCancelledError());
            });
        });
    }

    private getCheckoutInformation(): AffirmRequestData {
        const state = this.paymentIntegrationService.getState();
        const config = state.getStoreConfig();
        const consignments = state.getConsignments();
        const order = state.getOrder();

        if (!config) {
            throw new MissingDataError(MissingDataErrorType.MissingCheckoutConfig);
        }

        if (!order) {
            throw new MissingDataError(MissingDataErrorType.MissingCheckout);
        }

        const amountTransformer = new AmountTransformer(order.currency.decimalPlaces);
        const billingAddress = this.getBillingAddress();

        return {
            merchant: {
                user_confirmation_url: config.links.checkoutLink,
                user_cancel_url: config.links.checkoutLink,
                user_confirmation_url_action: 'POST',
            },
            shipping: this.getShippingAddress() || billingAddress,
            billing: billingAddress,
            items: this.getItems(amountTransformer, order),
            metadata: {
                shipping_type: this.getShippingType(consignments),
                mode: 'modal',
                platform_type: 'BigCommerce',
                platform_version: '',
                platform_affirm: '',
            },
            discounts: this.getDiscounts(amountTransformer, order),
            order_id: order.orderId ? order.orderId.toString() : '',
            shipping_amount: amountTransformer.toInteger(order.shippingCostTotal),
            tax_amount: amountTransformer.toInteger(order.taxTotal),
            total: amountTransformer.toInteger(order.orderAmount),
        };
    }

    private getShippingType(consignments?: Consignment[]): string {
        if (!consignments) {
            return '';
        }

        const consignment = consignments[0];

        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        return consignment?.selectedShippingOption ? consignment.selectedShippingOption.type : '';
    }

    private getBillingAddress(): AffirmAddress {
        const state = this.paymentIntegrationService.getState();
        const billingAddress = state.getBillingAddress();

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

    private getShippingAddress(): AffirmAddress | undefined {
        const state = this.paymentIntegrationService.getState();
        const shippingAddress = state.getShippingAddress();

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

    private getItems(amountTransformer: AmountTransformer, order: Order): AffirmItem[] {
        const items: AffirmItem[] = [];

        order.lineItems.physicalItems.forEach((item) => {
            items.push({
                display_name: item.name,
                sku: item.sku,
                unit_price: amountTransformer.toInteger(item.salePrice),
                qty: item.quantity,
                item_image_url: item.imageUrl,
                item_url: item.url,
                categories: this.getCategories(item.categories),
            });
        });

        order.lineItems.digitalItems.forEach((item) => {
            items.push({
                display_name: item.name,
                sku: item.sku,
                unit_price: amountTransformer.toInteger(item.salePrice),
                qty: item.quantity,
                item_image_url: item.imageUrl,
                item_url: item.url,
                categories: this.getCategories(item.categories),
            });
        });

        order.lineItems.giftCertificates.forEach((item) => {
            items.push({
                display_name: item.name,
                sku: '',
                unit_price: amountTransformer.toInteger(item.amount),
                qty: 1,
                item_image_url: '',
                item_url: '',
            });
        });

        if (order.lineItems.customItems) {
            order.lineItems.customItems.forEach((item) => {
                items.push({
                    display_name: item.name,
                    sku: item.sku,
                    unit_price: amountTransformer.toInteger(item.listPrice),
                    qty: item.quantity,
                    item_image_url: '',
                    item_url: '',
                });
            });
        }

        return items;
    }

    private getDiscounts(amountTransformer: AmountTransformer, order: Order): AffirmDiscount {
        const discounts: AffirmDiscount = {};

        order.coupons.forEach((line) => {
            if (line.discountedAmount > 0) {
                discounts[line.code] = {
                    discount_amount: amountTransformer.toInteger(line.discountedAmount),
                    discount_display_name: line.displayName,
                };
            }
        });

        if (order.discountAmount > 0) {
            discounts.DISCOUNTED_AMOUNT = {
                discount_amount: amountTransformer.toInteger(order.discountAmount),
                discount_display_name: 'discount',
            };
        }

        return discounts;
    }

    private getCategories(categories?: LineItemCategory[][]): string[][] {
        if (!categories) {
            return [[]];
        }

        return categories.map((categoryTree) => categoryTree.map((category) => category.name));
    }
}
