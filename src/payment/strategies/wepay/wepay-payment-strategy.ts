import { merge } from 'lodash';

import { CheckoutStore, InternalCheckoutSelectors } from '../../../checkout';
import { OrderActionCreator, OrderRequestBody } from '../../../order';
import PaymentActionCreator from '../../payment-action-creator';
import { PaymentInitializeOptions, PaymentRequestOptions } from '../../payment-request-options';
import { CreditCardPaymentStrategy } from '../credit-card';

import WepayRiskClient from './wepay-risk-client';

export default class WepayPaymentStrategy extends CreditCardPaymentStrategy {
    constructor(
        store: CheckoutStore,
        orderActionCreator: OrderActionCreator,
        paymentActionCreator: PaymentActionCreator,
        private _wepayRiskClient: WepayRiskClient
    ) {
        super(store, orderActionCreator, paymentActionCreator);
    }

    initialize(options: PaymentInitializeOptions): Promise<InternalCheckoutSelectors> {
        this._wepayRiskClient.initialize();

        return super.initialize(options);
    }

    execute(payload: OrderRequestBody, options?: PaymentRequestOptions): Promise<InternalCheckoutSelectors> {
        const token = this._wepayRiskClient.getRiskToken();
        const payloadWithToken = merge({}, payload, {
            payment: {
                paymentData: {
                    deviceSessionId: token,
                },
            },
        });

        return super.execute(payloadWithToken, options);
    }
}
