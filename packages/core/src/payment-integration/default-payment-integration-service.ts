import {
    BillingAddressRequestBody,
    BuyNowCartRequestBody,
    Cart,
    HostedForm,
    HostedFormOptions,
    InitializeOffsitePaymentConfig,
    OrderRequestBody,
    Payment,
    PaymentIntegrationSelectors,
    PaymentIntegrationService,
    RequestOptions,
    ShippingAddressRequestBody,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import { BillingAddressActionCreator } from '../billing';
import { CartRequestSender } from '../cart';
import { CheckoutActionCreator, CheckoutStore } from '../checkout';
import { DataStoreProjection } from '../common/data-store';
import { CustomerActionCreator, CustomerCredentials } from '../customer';
import { HostedFormFactory } from '../hosted-form';
import { OrderActionCreator } from '../order';
import {
    PaymentProviderCustomer,
    PaymentProviderCustomerActionCreator,
} from '../payment-provider-customer';
import PaymentActionCreator from '../payment/payment-action-creator';
import PaymentMethodActionCreator from '../payment/payment-method-action-creator';
import { RemoteCheckoutActionCreator } from '../remote-checkout';
import { InitializePaymentOptions } from '../remote-checkout/remote-checkout-request-sender';
import { ConsignmentActionCreator, ShippingCountryActionCreator } from '../shipping';
import { SpamProtectionActionCreator } from '../spam-protection';
import { StoreCreditActionCreator } from '../store-credit';

import PaymentIntegrationStoreProjectionFactory from './payment-integration-store-projection-factory';

export default class DefaultPaymentIntegrationService implements PaymentIntegrationService {
    private _storeProjection: DataStoreProjection<PaymentIntegrationSelectors>;

    constructor(
        private _store: CheckoutStore,
        private _storeProjectionFactory: PaymentIntegrationStoreProjectionFactory,
        private _checkoutActionCreator: CheckoutActionCreator,
        private _hostedFormFactory: HostedFormFactory,
        private _orderActionCreator: OrderActionCreator,
        private _billingAddressActionCreator: BillingAddressActionCreator,
        private _consignmentActionCreator: ConsignmentActionCreator,
        private _paymentMethodActionCreator: PaymentMethodActionCreator,
        private _paymentActionCreator: PaymentActionCreator,
        private _customerActionCreator: CustomerActionCreator,
        private _cartRequestSender: CartRequestSender,
        private _storeCreditActionCreator: StoreCreditActionCreator,
        private _spamProtectionActionCreator: SpamProtectionActionCreator,
        private _paymentProviderCustomerActionCreator: PaymentProviderCustomerActionCreator,
        private _shippingCountryActionCreator: ShippingCountryActionCreator,
        private _remoteCheckoutActionCreator: RemoteCheckoutActionCreator,
    ) {
        this._storeProjection = this._storeProjectionFactory.create(this._store);
    }

    createHostedForm(host: string, options: HostedFormOptions): HostedForm {
        return this._hostedFormFactory.create(host, options);
    }

    subscribe(
        subscriber: (state: PaymentIntegrationSelectors) => void,
        ...filters: Array<(state: PaymentIntegrationSelectors) => unknown>
    ): () => void {
        return this._storeProjection.subscribe(subscriber, ...filters);
    }

    getState(): PaymentIntegrationSelectors {
        return this._storeProjection.getState();
    }

    async initializeOffsitePayment(
        initializeOffsitePaymentConfig: InitializeOffsitePaymentConfig,
    ): Promise<PaymentIntegrationSelectors> {
        await this._store.dispatch(
            this._paymentActionCreator.initializeOffsitePayment(initializeOffsitePaymentConfig),
        );

        return this._storeProjection.getState();
    }

    async loadCheckout(id?: string): Promise<PaymentIntegrationSelectors> {
        if (id) {
            await this._store.dispatch(this._checkoutActionCreator.loadCheckout(id));
        } else {
            await this._store.dispatch(this._checkoutActionCreator.loadCurrentCheckout());
        }

        return this._storeProjection.getState();
    }

    async loadDefaultCheckout(): Promise<PaymentIntegrationSelectors> {
        await this._store.dispatch(this._checkoutActionCreator.loadDefaultCheckout());

        return this._storeProjection.getState();
    }

    async loadPaymentMethod(
        methodId: string,
        options?: RequestOptions,
    ): Promise<PaymentIntegrationSelectors> {
        await this._store.dispatch(
            this._paymentMethodActionCreator.loadPaymentMethod(methodId, options),
        );

        return this._storeProjection.getState();
    }

    async loadPaymentMethods(options?: RequestOptions): Promise<PaymentIntegrationSelectors> {
        await this._store.dispatch(this._paymentMethodActionCreator.loadPaymentMethods(options));

        return this._storeProjection.getState();
    }

    async submitOrder(
        payload?: OrderRequestBody,
        options?: RequestOptions,
    ): Promise<PaymentIntegrationSelectors> {
        await this._store.dispatch(this._orderActionCreator.submitOrder(payload, options));

        return this._storeProjection.getState();
    }

    async submitPayment(payment: Payment): Promise<PaymentIntegrationSelectors> {
        await this._store.dispatch(this._paymentActionCreator.submitPayment(payment));

        return this._storeProjection.getState();
    }

    async finalizeOrder(options?: RequestOptions): Promise<PaymentIntegrationSelectors> {
        const {
            order: { getOrderOrThrow },
        } = this._store.getState();

        await this._store.dispatch(
            this._orderActionCreator.finalizeOrder(getOrderOrThrow().orderId, options),
        );

        return this._storeProjection.getState();
    }

    async updateBillingAddress(
        payload: BillingAddressRequestBody,
    ): Promise<PaymentIntegrationSelectors> {
        await this._store.dispatch(this._billingAddressActionCreator.updateAddress(payload));

        return this._storeProjection.getState();
    }

    async updateShippingAddress(
        payload: ShippingAddressRequestBody,
    ): Promise<PaymentIntegrationSelectors> {
        await this._store.dispatch(this._consignmentActionCreator.updateAddress(payload));

        return this._storeProjection.getState();
    }

    async selectShippingOption(
        id: string,
        options?: RequestOptions,
    ): Promise<PaymentIntegrationSelectors> {
        await this._store.dispatch(
            this._consignmentActionCreator.selectShippingOption(id, options),
        );

        return this._storeProjection.getState();
    }

    async signInCustomer(
        credentials: CustomerCredentials,
        options?: RequestOptions,
    ): Promise<PaymentIntegrationSelectors> {
        await this._store.dispatch(
            this._customerActionCreator.signInCustomer(credentials, options),
        );

        return this._storeProjection.getState();
    }

    async signOutCustomer(options?: RequestOptions): Promise<PaymentIntegrationSelectors> {
        await this._store.dispatch(this._customerActionCreator.signOutCustomer(options));

        return this._storeProjection.getState();
    }

    async createBuyNowCart(
        buyNowCartRequestBody: BuyNowCartRequestBody,
        options?: RequestOptions,
    ): Promise<Cart> {
        const { body: buyNowCart } = await this._cartRequestSender.createBuyNowCart(
            buyNowCartRequestBody,
            options,
        );

        return buyNowCart;
    }

    async applyStoreCredit(
        useStoreCredit: boolean,
        options?: RequestOptions,
    ): Promise<PaymentIntegrationSelectors> {
        await this._store.dispatch(
            this._storeCreditActionCreator.applyStoreCredit(useStoreCredit, options),
        );

        return this._storeProjection.getState();
    }

    async verifyCheckoutSpamProtection(): Promise<PaymentIntegrationSelectors> {
        const { checkout } = this._store.getState();
        const { shouldExecuteSpamCheck } = checkout.getCheckoutOrThrow();

        if (shouldExecuteSpamCheck) {
            await this._store.dispatch(
                this._spamProtectionActionCreator.verifyCheckoutSpamProtection(),
            );
        }

        return this._storeProjection.getState();
    }

    async loadCurrentOrder(options?: RequestOptions): Promise<PaymentIntegrationSelectors> {
        await this._store.dispatch(this._orderActionCreator.loadCurrentOrder(options));

        return this._storeProjection.getState();
    }

    async updatePaymentProviderCustomer(
        paymentProviderCustomer: PaymentProviderCustomer,
    ): Promise<PaymentIntegrationSelectors> {
        await this._store.dispatch(
            this._paymentProviderCustomerActionCreator.updatePaymentProviderCustomer(
                paymentProviderCustomer,
            ),
        );

        return this._storeProjection.getState();
    }

    async loadShippingCountries(options?: RequestOptions): Promise<PaymentIntegrationSelectors> {
        await this._store.dispatch(this._shippingCountryActionCreator.loadCountries(options));

        return this._storeProjection.getState();
    }

    async deleteConsignment(
        consignmentId: string,
        options?: RequestOptions,
    ): Promise<PaymentIntegrationSelectors> {
        await this._store.dispatch(
            this._consignmentActionCreator.deleteConsignment(consignmentId, options),
        );

        return this._storeProjection.getState();
    }

    async initializePayment(
        methodId: string,
        params?: InitializePaymentOptions,
        options?: RequestOptions,
    ): Promise<PaymentIntegrationSelectors> {
        await this._store.dispatch(
            this._remoteCheckoutActionCreator.initializePayment(methodId, params, options),
        );

        return this._storeProjection.getState();
    }
}
