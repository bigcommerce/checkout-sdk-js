import { ReadableDataStore } from '@bigcommerce/data-store';

import { CheckoutSelectors, CheckoutStore } from '../../checkout';
import { OrderRequestBody, PlaceOrderService } from '../../order';
import { WepayRiskClient } from '../../remote-checkout/methods/wepay';
import { CreditCard } from '../payment';

import { CreditCardPaymentStrategy } from '.';
import PaymentStrategy, { InitializeOptions } from './payment-strategy';

export default class WepayPaymentStrategy extends CreditCardPaymentStrategy {

    constructor(
        store: CheckoutStore,
        placeOrderService: PlaceOrderService,
        private _wepayRiskClient: WepayRiskClient
    ) {
        super(store, placeOrderService);
    }

    initialize(options: InitializeOptions): Promise<CheckoutSelectors> {
        this._wepayRiskClient.initialize();
        return super.initialize(options);
    }

    execute(
        payload: OrderRequestBody,
        options?: any
    ): Promise<CheckoutSelectors> {
        const token = this._wepayRiskClient.getRiskToken();
        const payloadWithToken = { ...payload };

        (payloadWithToken.payment.paymentData as CreditCard).extraData = {
            riskToken: token,
        };

        return super.execute(payloadWithToken, options);
    }
}
