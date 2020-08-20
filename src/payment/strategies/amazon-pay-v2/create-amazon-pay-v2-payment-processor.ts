import { getScriptLoader } from '@bigcommerce/script-loader';

import AmazonPayV2PaymentProcessor from './amazon-pay-v2-payment-processor';
import AmazonPayV2ScriptLoader from './amazon-pay-v2-script-loader';

export default function createAmazonPayV2PaymentProcessor(): AmazonPayV2PaymentProcessor {
    return new AmazonPayV2PaymentProcessor(
        new AmazonPayV2ScriptLoader(getScriptLoader())
    );
}
