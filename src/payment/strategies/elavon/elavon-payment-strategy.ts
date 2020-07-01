import { CheckoutStore, InternalCheckoutSelectors } from '../../../checkout';
import { HostedFormFactory } from '../../../hosted-form';
import { OrderActionCreator, OrderRequestBody } from '../../../order';
import { PaymentArgumentInvalidError } from '../../errors';
import { HostedInstrument } from '../../payment';
import PaymentActionCreator from '../../payment-action-creator';
import { CreditCardPaymentStrategy } from '../credit-card';

import { PaymentRequestOptions } from './../../payment-request-options';

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

    execute(orderRequest: OrderRequestBody, options?: PaymentRequestOptions): Promise<InternalCheckoutSelectors> {
        const { payment } = orderRequest;
        const paymentData = payment && payment.paymentData;
        const shouldSaveInstrument = paymentData && (paymentData as HostedInstrument).shouldSaveInstrument;

        if (!payment) {
            throw new PaymentArgumentInvalidError(['payment']);
        }

        // isVaulted

        const { paymentMethods: { getPaymentMethodOrThrow } } = this._store.getState();
        const paymentMethod = getPaymentMethodOrThrow(payment.methodId);
        const ip = paymentMethod.initializationData.ip;

        return this._store.dispatch(
            this._orderActionCreator.submitOrder(orderRequest, options)
        )
        .then( () => {
            return this._store.dispatch(this._paymentActionCreator.submitPayment({
                    ...payment,
                    methodId: payment.methodId,
                    paymentData: {
                        ...paymentData,
                        formattedPayload: {
                            ip_address: ip,
                            vault_payment_instrument: shouldSaveInstrument,
                        },
                    },
                }));
        })
        .catch((error: Error) => this._handleError(error));

    }

    private _handleError(error: Error): never {
        throw error;
    }

}
