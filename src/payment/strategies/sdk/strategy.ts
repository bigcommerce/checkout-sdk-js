import { CheckoutStore, InternalCheckoutSelectors } from '../../../checkout';
import { NotInitializedError, NotInitializedErrorType } from '../../../common/error/errors';
import { OrderActionCreator, OrderRequestBody } from '../../../order';
import { OrderFinalizationNotRequiredError } from '../../../order/errors';
import { PaymentArgumentInvalidError } from '../../errors';
import { PaymentInitializeOptions, PaymentRequestOptions } from '../../payment-request-options';
import PaymentStrategy from '../payment-strategy';

import { handler } from './handler';
import { initializers, PaymentProcessor } from './initializers';

/*
    This strategy would be used for all PPSDK methods

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
    protected _paymentProcessor?: PaymentProcessor;

    constructor(
        protected _store: CheckoutStore,
        protected _orderActionCreator: OrderActionCreator
    ) {}

    async initialize(options?: PaymentInitializeOptions): Promise<InternalCheckoutSelectors> {
        if (!options || !options.methodId) {
            // TODO: Can we make this object and attribute mandatory?
            throw new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized);
        }

        const { methodId } = options;

        /*
            TODO: probably too brittle to just use methodId going forward

            if methodId is 'card', how do we differentiate between standard and "has own JS" implementations?

            N.B. looking for a "has own JS" initializer, not finding one,
            then falling back to a default one for that methodId
            could produce some unpredictable (and likely broken) UX during execute
        */
        const initializer = initializers[methodId];

        if (!initializer) {
            throw new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized);
        }

        // Suggestions for better names welcome :D
        const paymentProcessor = await initializer({
            options,
            store: this._store,
        });

        if (!paymentProcessor) {
            throw new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized);
        }

        // Sore the processor for later use in execute
        this._paymentProcessor = paymentProcessor;

        return this._store.getState();
    }

    deinitialize(_options?: PaymentRequestOptions): Promise<InternalCheckoutSelectors> {
        // Nothing to be done here?
        return Promise.resolve(this._store.getState());
    }

    async execute(payload: OrderRequestBody, options?: PaymentRequestOptions): Promise<InternalCheckoutSelectors> {
        const { payment, ...order } = payload;

        if (!payment || !payment.methodId) {
            throw new PaymentArgumentInvalidError(['payment.methodId']);
        }

        const paymentProcessor = this._paymentProcessor;

        if (!paymentProcessor) {
            throw new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized);
        }

        // Submitting the order should let us restore it post redirect in finalize
        const submitOrder = () => this._store.dispatch(this._orderActionCreator.submitOrder(order, options));
        const getPaymentStep = () => paymentProcessor(payment);
        const loadOrder = () => this._store.dispatch(this._orderActionCreator.loadCurrentOrder());

        // TODO: move to async/await format?
        return submitOrder()
            // Very key differences to a typical strategy:
            .then(getPaymentStep)
            .then(handler)
            .then(loadOrder);
    }

    finalize(options?: PaymentRequestOptions): Promise<InternalCheckoutSelectors> {
        /*
            This is actually called first, before initialize
            We can check if there was a payment left for us to continue
            i.e. at the return of a redirect

            N.B. we will need a different mechanism for continue steps in the future
            'finalize' runs and dead-ends prior to rendering payment methods
            some future steps will want to run with the method choice visually open
            we'll likely need a new 'continueOrderIfNeeded' feature in checkout-js
        */

        const state = this._store.getState();
        const order = state.order.getOrder();
        const status = state.payment.getPaymentStatus();
        const method = options?.methodId;
        const provider = state.payment.getPaymentId()?.providerId;

        // Is this a correct use of this 'INITIALIZE' status?
        if (provider && method && order && status === 'INITIALIZE') {
            // Now we know we should carry on asking for next steps

            /*
                Where can we get this 'sdkPaymentId' value from?
                Either from a get param of the checkout page itself (added by the returning redirect)
                or by extending '/internalapi/v1/checkout/order' to store it as part of payment state there
            */
            const sdkPaymentId = ''; // Will need a real value

            // These functions would be built elsewhere
            const dispatchOrderFinalizedNotice = () => this._store.dispatch(
                this._orderActionCreator.finalizeOrder(order.orderId, options)
            );
            const getPaymentStep = () => fetch(`/payment/${provider}.${method}/${sdkPaymentId}`);

            // Similar to the return step of execute
            return getPaymentStep()
                .then(handler)
                .then(dispatchOrderFinalizedNotice);
        }

        // Else, no payment to continue...

        // This looks odd, but is normal
        // In effect, this just leads to checkout loading up methods as normal
        return Promise.reject(new OrderFinalizationNotRequiredError());
    }
}
