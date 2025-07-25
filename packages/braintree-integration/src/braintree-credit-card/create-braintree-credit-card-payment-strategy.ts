import { getScriptLoader } from '@bigcommerce/script-loader';

import {
  BraintreeHostWindow,
  BraintreeIntegrationService,
  BraintreeScriptLoader,
  BraintreeSDKVersionManager,
} from '@bigcommerce/checkout-sdk/braintree-utils';
import {
  PaymentStrategyFactory,
  toResolvableModule,
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import BraintreeCreditCardPaymentStrategy from './braintree-credit-card-payment-strategy';
import BraintreeHostedForm from '../braintree-hosted-form/braintree-hosted-form';

const createBraintreeCreditCardPaymentStrategy: PaymentStrategyFactory<
  BraintreeCreditCardPaymentStrategy
> = (paymentIntegrationService) => {
  const braintreeHostWindow: BraintreeHostWindow = window;
  const braintreeSDKVersionManager = new BraintreeSDKVersionManager(paymentIntegrationService);
  const braintreeIntegrationService = new BraintreeIntegrationService(
    new BraintreeScriptLoader(
      getScriptLoader(),
      braintreeHostWindow,
      braintreeSDKVersionManager,
    ),
    braintreeHostWindow,
  );
  const braintreeScriptLoader = new BraintreeScriptLoader(
    getScriptLoader(),
    braintreeHostWindow,
    braintreeSDKVersionManager,
  );

  const braintreeHostedForm = new BraintreeHostedForm(braintreeScriptLoader);

  return new BraintreeCreditCardPaymentStrategy(
    paymentIntegrationService,
    braintreeIntegrationService,
    braintreeHostedForm,
  );
};

export default toResolvableModule(createBraintreeCreditCardPaymentStrategy, [
  { id: 'braintree' },
]);
