import { CheckoutStore, InternalCheckoutSelectors } from '../../../checkout';
import { HostedFormFactory } from '../../../hosted-form';
import { OrderActionCreator, OrderRequestBody } from '../../../order';
import { PaymentArgumentInvalidError } from '../../errors';
import PaymentActionCreator from '../../payment-action-creator';
import { PaymentRequestOptions } from '../../payment-request-options';
import { CreditCardPaymentStrategy } from '../credit-card';

export default class ElavonPaymentStrategy extends CreditCardPaymentStrategy {
    constructor(
        store: CheckoutStore,
        orderActionCreator: OrderActionCreator,
        paymentActionCreator: PaymentActionCreator,
        hostedFormFactory: HostedFormFactory
    ) {
        super(
            store,
            orderActionCreator,
            paymentActionCreator,
            hostedFormFactory
        );
    }

    async execute(orderRequest: OrderRequestBody, options?: PaymentRequestOptions): Promise<InternalCheckoutSelectors> {
        const { payment, payment: { methodId = '' } = {}, ...order } = orderRequest;
        const { paymentMethods: { getPaymentMethodOrThrow } } = this._store.getState();
        const paymentMethod = getPaymentMethodOrThrow(methodId);
        const ip = paymentMethod.initializationData.ip;

        if (!payment) {
            throw new PaymentArgumentInvalidError(['payment']);
        }

        return this._store.dispatch(
            this._orderActionCreator.submitOrder(order, options)
        )
        .then( () =>
            this._store.dispatch(this._paymentActionCreator.submitPayment({
                ...payment,
                methodId: payment.methodId,
                    paymentData: {
                        formattedPayload: {
                            ip_address: ip,
                        },
                    },
            }))
        )
        .catch((error: Error) => this._handleError(error));

    }

    private _handleError(error: Error): never {
        throw error;
    }

}
