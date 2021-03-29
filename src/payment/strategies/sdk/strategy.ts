import { CheckoutStore, InternalCheckoutSelectors } from '../../../checkout';
import { OrderActionCreator, OrderRequestBody } from '../../../order';
import { OrderFinalizationNotRequiredError } from '../../../order/errors';
import { PaymentRequestOptions } from '../../payment-request-options';
import PaymentStrategy from '../payment-strategy';

import { handler } from './handler';

/*
    BIG TODO: How do we handle the return journey of redirects?
*/

/*
    This strategy would be used for all PPSDK methods, other than:
        - ones requiring our credit card hosted field
        - 'non-standard' SDK methods

    Key points:
        - The use of a "PPSDK Response Handler", which would
            (1) discern different code paths based on success/failure/error/continue
                responses from our checkout/processing endpoint (received via HostedFormFactory above)
            (2) not return control to the strategy until all continue steps are exhausted
            (3) attempt to handle any recoverable failure responses(?)
            (4) translate error and un-recoverable failure responses into Checkout SDK errors
                (e.g. those from src/common/error/errors/index.ts)
                before throwing
            (5) Delegate and await the resolving of relevant(?) continue steps to checkout-js
            (6) Return a resolving promise from 'execute'
                upon a success message from the checkout/processing endpoint

*/

export class Strategy implements PaymentStrategy {
    constructor(
        protected _store: CheckoutStore,
        protected _orderActionCreator: OrderActionCreator
    ) {}

    initialize(): Promise<InternalCheckoutSelectors> {
        // Nothing to be done here?
        return Promise.resolve(this._store.getState());
    }

    deinitialize(_options?: PaymentRequestOptions): Promise<InternalCheckoutSelectors> {
        // Nothing to be done here?
        return Promise.resolve(this._store.getState());
    }

    async execute(payload: OrderRequestBody, options?: PaymentRequestOptions): Promise<InternalCheckoutSelectors> {
        // this strategy doesn't really know what the view will send it
        // it will just pass it on to the processing/checkout endpoint

        if (!options?.gatewayId || !options?.methodId) {
            // throw? reject?
            return Promise.reject();
        }

        const { gatewayId: paymentProvider, methodId } = options;

        const jsonBody = JSON.stringify(payload);

        const initialResponse = await fetch(`/payment/${paymentProvider}.${methodId}`, {
            method: 'POST',
            body: jsonBody,
        });

        // Same handler as used in HostedFormStrategy
        return handler(initialResponse)
            .then(() => this._store.dispatch(this._orderActionCreator.loadCurrentOrder()));
    }

    finalize(_options?: PaymentRequestOptions): Promise<InternalCheckoutSelectors> {
        // Nothing to be done here?
        return Promise.reject(new OrderFinalizationNotRequiredError());
    }
}
