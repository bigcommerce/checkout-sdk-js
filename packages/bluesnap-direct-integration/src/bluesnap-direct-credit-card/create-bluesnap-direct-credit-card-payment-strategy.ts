import { createRequestSender } from '@bigcommerce/request-sender';
import { getScriptLoader } from '@bigcommerce/script-loader';

import {
    PaymentStrategyFactory,
    SurchargeActionHandler,
    SurchargeRequestSender,
    toResolvableModule,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import BlueSnapDirect3ds from './bluesnap-direct-3ds';
import BlueSnapDirectCreditCardPaymentStrategy from './bluesnap-direct-credit-card-payment-strategy';
import BlueSnapDirectHostedForm from './bluesnap-direct-hosted-form';
import BlueSnapHostedInputValidator from './bluesnap-direct-hosted-input-validator';
import BluesnapDirectNameOnCardInput from './bluesnap-direct-name-on-card-input';
import BlueSnapDirectScriptLoader from './bluesnap-direct-script-loader';

const createBlueSnapDirectCreditCardPaymentStrategy: PaymentStrategyFactory<
    BlueSnapDirectCreditCardPaymentStrategy
> = (paymentIntegrationService) =>
    new BlueSnapDirectCreditCardPaymentStrategy(
        new BlueSnapDirectScriptLoader(getScriptLoader()),
        paymentIntegrationService,
        new BlueSnapDirectHostedForm(
            new BluesnapDirectNameOnCardInput(),
            new BlueSnapHostedInputValidator(),
        ),
        new BlueSnapDirect3ds(),
        new SurchargeActionHandler(
            paymentIntegrationService,
            new SurchargeRequestSender(createRequestSender()),
        ),
    );

export default toResolvableModule(createBlueSnapDirectCreditCardPaymentStrategy, [
    { id: 'credit_card', gateway: 'bluesnapdirect' },
]);
