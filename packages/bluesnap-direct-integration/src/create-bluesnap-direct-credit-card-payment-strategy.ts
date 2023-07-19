import { getScriptLoader } from '@bigcommerce/script-loader';

import {
    PaymentStrategyFactory,
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
        paymentIntegrationService,
        new BlueSnapDirectHostedForm(
            new BlueSnapDirectScriptLoader(getScriptLoader()),
            new BluesnapDirectNameOnCardInput(),
            new BlueSnapHostedInputValidator(),
        ),
        new BlueSnapDirect3ds(new BlueSnapDirectScriptLoader(getScriptLoader())),
    );

export default toResolvableModule(createBlueSnapDirectCreditCardPaymentStrategy, [
    { id: 'credit_card', gateway: 'bluesnapdirect' },
]);
