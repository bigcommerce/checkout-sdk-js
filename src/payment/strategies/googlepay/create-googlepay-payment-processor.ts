import { createRequestSender } from '@bigcommerce/request-sender';
import { getScriptLoader } from '@bigcommerce/script-loader';

import { BillingAddressActionCreator, BillingAddressRequestSender } from '../../../billing';
import { CheckoutRequestSender, CheckoutStore } from '../../../checkout';
import { ConsignmentActionCreator, ConsignmentRequestSender } from '../../../shipping';
import { SubscriptionsActionCreator, SubscriptionsRequestSender } from '../../../subscription';
import PaymentMethodActionCreator from '../../payment-method-action-creator';
import PaymentMethodRequestSender from '../../payment-method-request-sender';

import { GooglePayInitializer } from './googlepay';
import GooglePayPaymentProcessor from './googlepay-payment-processor';
import GooglePayScriptLoader from './googlepay-script-loader';

export default function createGooglePayPaymentProcessor(store: CheckoutStore, initializer: GooglePayInitializer): GooglePayPaymentProcessor {
    const requestSender = createRequestSender();
    const scriptLoader = getScriptLoader();

    return new GooglePayPaymentProcessor(
        store,
        new PaymentMethodActionCreator(
            new PaymentMethodRequestSender(requestSender)
        ),
        new GooglePayScriptLoader(scriptLoader),
        initializer,
        new BillingAddressActionCreator(
            new BillingAddressRequestSender(requestSender),
            new SubscriptionsActionCreator(
                new SubscriptionsRequestSender(requestSender)
            )
        ),
        new ConsignmentActionCreator(
            new ConsignmentRequestSender(requestSender),
            new CheckoutRequestSender(requestSender)
        ),
        requestSender
    );
}
