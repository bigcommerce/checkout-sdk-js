import {
    PaymentStrategyFactory,
    toResolvableModule,
} from "@bigcommerce/checkout-sdk/payment-integration-api";
import { createFormPoster } from "@bigcommerce/form-poster";
import { createRequestSender } from "@bigcommerce/request-sender";
import { createScriptLoader } from "@bigcommerce/script-loader";
import { createCheckoutStore } from "packages/core/src/checkout";

import { BrowserStorage } from "packages/core/src/common/storage";
import { HostedFormFactory } from "packages/core/src/hosted-form";
import { createSpamProtection, PaymentHumanVerificationHandler } from "packages/core/src/spam-protection";

import { createSubStrategyRegistry } from "./create-ppsdk-sub-strategy-registry";
import { PaymentResumer } from "./ppsdk-payment-resumer";
import { PPSDKStrategy } from "./ppsdk-strategy";
import { createStepHandler } from "./step-handler";

const createPPSDKStrategy: PaymentStrategyFactory<
    PPSDKStrategy
> = (paymentIntegrationService) => {
    const { getHost } = paymentIntegrationService.getState();
    const requestSender = createRequestSender({ host: getHost() });
    const store = createCheckoutStore();

    const formPoster = createFormPoster();
    const paymentHumanVerificationHandler = new PaymentHumanVerificationHandler(createSpamProtection(createScriptLoader()));
    const stepHandler = createStepHandler(formPoster, paymentHumanVerificationHandler);
    const hostedFormFactory = new HostedFormFactory(store);
    return new PPSDKStrategy(
        paymentIntegrationService,
        createSubStrategyRegistry(paymentIntegrationService, requestSender, stepHandler, hostedFormFactory),
        new PaymentResumer(requestSender, stepHandler),
        new BrowserStorage('PPSDK')
    );
};

export default toResolvableModule(createPPSDKStrategy, [
    { id: "PAYMENT_TYPE_SDK" },
]);
