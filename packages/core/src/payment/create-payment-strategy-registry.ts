import { createFormPoster } from '@bigcommerce/form-poster';
import { RequestSender } from '@bigcommerce/request-sender';
import { createScriptLoader, getScriptLoader } from '@bigcommerce/script-loader';

import { CheckoutRequestSender, CheckoutStore, CheckoutValidator } from '../checkout';
import { BrowserStorage } from '../common/storage';
import { HostedFormFactory } from '../hosted-form';
import { OrderActionCreator, OrderRequestSender } from '../order';
import { createSpamProtection, PaymentHumanVerificationHandler } from '../spam-protection';

import PaymentActionCreator from './payment-action-creator';
import PaymentMethodActionCreator from './payment-method-action-creator';
import PaymentMethodRequestSender from './payment-method-request-sender';
import PaymentRequestSender from './payment-request-sender';
import PaymentRequestTransformer from './payment-request-transformer';
import PaymentStrategyRegistry from './payment-strategy-registry';
import PaymentStrategyType from './payment-strategy-type';
import { CBAMPGSPaymentStrategy, CBAMPGSScriptLoader } from './strategies/cba-mpgs';
import { ConvergePaymentStrategy } from './strategies/converge';
import { MasterpassPaymentStrategy, MasterpassScriptLoader } from './strategies/masterpass';
import { PaypalExpressPaymentStrategy, PaypalScriptLoader } from './strategies/paypal';
import {
    createStepHandler,
    createSubStrategyRegistry,
    PaymentResumer,
    PPSDKStrategy,
} from './strategies/ppsdk';
import { WepayPaymentStrategy, WepayRiskClient } from './strategies/wepay';

export default function createPaymentStrategyRegistry(
    store: CheckoutStore,
    paymentClient: any,
    requestSender: RequestSender,
    locale: string,
) {
    const registry = new PaymentStrategyRegistry({
        defaultToken: PaymentStrategyType.CREDIT_CARD,
    });

    const scriptLoader = getScriptLoader();
    const paymentRequestTransformer = new PaymentRequestTransformer();
    const paymentRequestSender = new PaymentRequestSender(paymentClient);
    const checkoutRequestSender = new CheckoutRequestSender(requestSender);
    const checkoutValidator = new CheckoutValidator(checkoutRequestSender);
    const orderActionCreator = new OrderActionCreator(
        new OrderRequestSender(requestSender),
        checkoutValidator,
    );
    const paymentHumanVerificationHandler = new PaymentHumanVerificationHandler(
        createSpamProtection(createScriptLoader()),
    );
    const paymentActionCreator = new PaymentActionCreator(
        paymentRequestSender,
        orderActionCreator,
        paymentRequestTransformer,
        paymentHumanVerificationHandler,
    );
    const paymentMethodActionCreator = new PaymentMethodActionCreator(
        new PaymentMethodRequestSender(requestSender),
    );
    const formPoster = createFormPoster();
    const stepHandler = createStepHandler(formPoster, paymentHumanVerificationHandler);
    const hostedFormFactory = new HostedFormFactory(store);

    registry.register(
        PaymentStrategyType.CBA_MPGS,
        () =>
            new CBAMPGSPaymentStrategy(
                store,
                orderActionCreator,
                paymentActionCreator,
                hostedFormFactory,
                paymentMethodActionCreator,
                new CBAMPGSScriptLoader(scriptLoader),
                locale,
            ),
    );

    registry.register(
        PaymentStrategyType.CONVERGE,
        () =>
            new ConvergePaymentStrategy(
                store,
                orderActionCreator,
                paymentActionCreator,
                hostedFormFactory,
                formPoster,
            ),
    );

    registry.register(
        PaymentStrategyType.MASTERPASS,
        () =>
            new MasterpassPaymentStrategy(
                store,
                orderActionCreator,
                paymentActionCreator,
                new MasterpassScriptLoader(scriptLoader),
                locale,
            ),
    );

    registry.register(
        PaymentStrategyType.PAYPAL_EXPRESS,
        () =>
            new PaypalExpressPaymentStrategy(
                store,
                orderActionCreator,
                new PaypalScriptLoader(scriptLoader),
            ),
    );

    registry.register(
        PaymentStrategyType.PAYPAL_EXPRESS_CREDIT,
        () =>
            new PaypalExpressPaymentStrategy(
                store,
                orderActionCreator,
                new PaypalScriptLoader(scriptLoader),
            ),
    );

    registry.register(
        PaymentStrategyType.PPSDK,
        () =>
            new PPSDKStrategy(
                store,
                orderActionCreator,
                createSubStrategyRegistry(
                    store,
                    orderActionCreator,
                    requestSender,
                    stepHandler,
                    hostedFormFactory,
                ),
                new PaymentResumer(requestSender, stepHandler),
                new BrowserStorage('PPSDK'),
            ),
    );

    registry.register(
        PaymentStrategyType.WE_PAY,
        () =>
            new WepayPaymentStrategy(
                store,
                orderActionCreator,
                paymentActionCreator,
                hostedFormFactory,
                new WepayRiskClient(scriptLoader),
            ),
    );

    return registry;
}
