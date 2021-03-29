import { CheckoutStore, InternalCheckoutSelectors } from '../../../checkout';
import { NotInitializedError, NotInitializedErrorType } from '../../../common/error/errors';
import { HostedForm, HostedFormFactory } from '../../../hosted-form';
import { OrderActionCreator, OrderRequestBody } from '../../../order';
import { OrderFinalizationNotRequiredError } from '../../../order/errors';
import { PaymentArgumentInvalidError } from '../../errors';
import { PaymentInitializeOptions, PaymentRequestOptions } from '../../payment-request-options';
import PaymentStrategy from '../payment-strategy';

import { handler } from './handler';

/*
    BIG TODO: How do we handle the return journey of redirects?
*/

/*
    This strategy would be similar-ish to src/payment/strategies/credit-card/credit-card-payment-strategy.ts

    Key points:
        - HostedFormFactory would be either extended or cloned and modified to
            (1) allow the post action to be constructed as needed
                e.g. `/payment/${paymentProvider}.${methodId}/${paymentId}`
            (2) transparently return the response from this submission
                allowing it to be processed here, in the strategy scope

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

export class HostedFormStrategy implements PaymentStrategy {
    protected _hostedForm?: HostedForm;

    constructor(
        protected _store: CheckoutStore,
        protected _orderActionCreator: OrderActionCreator,
        protected _hostedFormFactory: HostedFormFactory
    ) {}

    initialize(options?: PaymentInitializeOptions): Promise<InternalCheckoutSelectors> {
        const host = ''; // Discerned from config/payment method options etc
        const formOptions = {
            mode: 'PPSDK', // or we have our own PPSDK variant of the HostedFormFactory
            // Other props discerned from config/payment method options etc
        };

        const form = this._hostedFormFactory.create(host, formOptions);

        return form.attach()
            .then(() => {
                this._hostedForm = form;

                return this._store.getState();
            });
    }

    deinitialize(_options?: PaymentRequestOptions): Promise<InternalCheckoutSelectors> {
        if (this._hostedForm) {
            this._hostedForm.detach();
        }

        return Promise.resolve(this._store.getState());
    }

    execute(payload: OrderRequestBody, options?: PaymentRequestOptions): Promise<InternalCheckoutSelectors> {
        const { payment, ...order } = payload;
        const form = this._hostedForm;

        if (!form) {
            throw new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized);
        }

        if (!payment || !payment.methodId) {
            throw new PaymentArgumentInvalidError(['payment.methodId']);
        }

        return form.validate()
            .then(() => this._store.dispatch(this._orderActionCreator.submitOrder(order, options)))
            .then(() => form.submit(payment))
            // Very key difference:
            .then(handler)
            .then(() => this._store.dispatch(this._orderActionCreator.loadCurrentOrder()));
    }

    finalize(_options?: PaymentRequestOptions): Promise<InternalCheckoutSelectors> {
        return Promise.reject(new OrderFinalizationNotRequiredError());
    }
}
