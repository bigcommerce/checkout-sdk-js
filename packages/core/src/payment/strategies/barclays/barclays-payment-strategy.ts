import { CheckoutStore, InternalCheckoutSelectors } from '../../../checkout';
import { HostedFormFactory } from '../../../hosted-form';
import { OrderActionCreator, OrderRequestBody } from '../../../order';
import PaymentActionCreator from '../../payment-action-creator';
import { PaymentInitializeOptions, PaymentRequestOptions } from '../../payment-request-options';
import { CardinalThreeDSecureFlowV2 } from '../cardinal';
import { CreditCardPaymentStrategy } from '../credit-card';

export default class BarclaysPaymentStrategy extends CreditCardPaymentStrategy {
    constructor(
        store: CheckoutStore,
        orderActionCreator: OrderActionCreator,
        paymentActionCreator: PaymentActionCreator,
        hostedFormFactory: HostedFormFactory,
        private _threeDSecureFlow: CardinalThreeDSecureFlowV2
    ) {
        super(
            store,
            orderActionCreator,
            paymentActionCreator,
            hostedFormFactory
        );
    }

    async initialize(options: PaymentInitializeOptions): Promise<InternalCheckoutSelectors> {
        await super.initialize(options);

        const { paymentMethods: { getPaymentMethodOrThrow } } = this._store.getState();
        const paymentMethod = getPaymentMethodOrThrow(options.methodId);

        if (paymentMethod.config.is3dsEnabled) {
            await this._threeDSecureFlow.prepare(paymentMethod);
        }

        return this._store.getState();
    }

    async execute(payload: OrderRequestBody, options?: PaymentRequestOptions): Promise<InternalCheckoutSelectors> {
        const { payment: { methodId = '' } = {} } = payload;
        const { paymentMethods: { getPaymentMethodOrThrow } } = this._store.getState();

        if (getPaymentMethodOrThrow(methodId).config.is3dsEnabled) {
            return this._threeDSecureFlow.start(
                super.execute.bind(this),
                payload,
                options,
                this._hostedForm
            );
        }

        return super.execute(payload, options);
    }
}
