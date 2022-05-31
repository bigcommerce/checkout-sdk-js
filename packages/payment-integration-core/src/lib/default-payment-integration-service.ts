import { BillingAddressActionCreator,
    BillingAddressRequestBody,
    CheckoutActionCreator,
    CheckoutStore,
    ConsignmentActionCreator,
    DataStoreProjection,
    OrderActionCreator,
    OrderRequestBody,
    Payment,
    PaymentActionCreator,
    PaymentMethodActionCreator,
    ShippingAddressRequestBody } from '@bigcommerce/checkout-sdk/core';

import PaymentIntegrationService from './payment-integration-core';
import PaymentIntegrationSelectors from './payment-integration-selectors';
import PaymentIntegrationStoreProjectionFactory from './payment-integration-store-projection-factory';

export default class DefaultPaymentIntegrationService implements PaymentIntegrationService {
    private _storeProjection: DataStoreProjection<PaymentIntegrationSelectors>;

    constructor(
        private _store: CheckoutStore,
        private _storeProjectionFactory: PaymentIntegrationStoreProjectionFactory,
        private _checkoutActionCreator: CheckoutActionCreator,
        private _orderActionCreator: OrderActionCreator,
        private _billingAddressActionCreator: BillingAddressActionCreator,
        private _consignmentActionCreator: ConsignmentActionCreator,
        private _paymentMethodActionCreator: PaymentMethodActionCreator,
        private _paymentActionCreator: PaymentActionCreator
    ) {
        this._storeProjection = this._storeProjectionFactory.create(this._store);
    }

    /* eslint-disable  @typescript-eslint/no-explicit-any */
    subscribe(subscriber: (state: PaymentIntegrationSelectors) => void, ...filters: Array<(state: PaymentIntegrationSelectors) => any>): () => void {
        return this._storeProjection.subscribe(subscriber, ...filters);
    }

    getState(): PaymentIntegrationSelectors {
        return this._storeProjection.getState();
    }

    async loadCheckout(): Promise<PaymentIntegrationSelectors> {
        await this._store.dispatch(
            this._checkoutActionCreator.loadCurrentCheckout()
        );

        return this._storeProjection.getState();
    }

    async loadPaymentMethod(methodId: string): Promise<PaymentIntegrationSelectors> {
        await this._store.dispatch(
            this._paymentMethodActionCreator.loadPaymentMethod(methodId)
        );

        return this._storeProjection.getState();
    }

    async submitOrder(payload?: OrderRequestBody): Promise<PaymentIntegrationSelectors> {
        await this._store.dispatch(
            this._orderActionCreator.submitOrder(payload)
        );

        return this._storeProjection.getState();
    }

    async submitPayment(payment: Payment): Promise<PaymentIntegrationSelectors> {
        await this._store.dispatch(
            this._paymentActionCreator.submitPayment(payment)
        );

        return this._storeProjection.getState();
    }

    async finalizeOrder(): Promise<PaymentIntegrationSelectors> {
        const { order: { getOrderOrThrow } } = this._store.getState();

        await this._store.dispatch(
            this._orderActionCreator.finalizeOrder(getOrderOrThrow().orderId)
        );

        return this._storeProjection.getState();
    }

    async updateBillingAddress(payload: BillingAddressRequestBody): Promise<PaymentIntegrationSelectors> {
        await this._store.dispatch(
            this._billingAddressActionCreator.updateAddress(payload)
        );

        return this._storeProjection.getState();
    }

    async updateShippingAddress(payload: ShippingAddressRequestBody): Promise<PaymentIntegrationSelectors> {
        await this._store.dispatch(
            this._consignmentActionCreator.updateAddress(payload)
        );

        return this._storeProjection.getState();
    }
}
