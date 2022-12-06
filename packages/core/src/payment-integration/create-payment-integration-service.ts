import { PaymentIntegrationService } from "@bigcommerce/checkout-sdk/payment-integration-api";
import { createRequestSender } from "@bigcommerce/request-sender";
import { createScriptLoader } from "@bigcommerce/script-loader";

import {
    BillingAddressActionCreator,
    BillingAddressRequestSender,
} from "../billing";
import {
    CheckoutActionCreator,
    CheckoutRequestSender,
    CheckoutStore,
    CheckoutValidator,
} from "../checkout";
import { ConfigActionCreator, ConfigRequestSender } from "../config";
import { FormFieldsActionCreator, FormFieldsRequestSender } from "../form";
import { HostedFormFactory } from "../hosted-form";
import { OrderActionCreator, OrderRequestSender } from "../order";
import {
    createPaymentClient,
    PaymentActionCreator,
    PaymentMethodActionCreator,
    PaymentMethodRequestSender,
    PaymentRequestSender,
    PaymentRequestTransformer,
} from "../payment";
import {
    ConsignmentActionCreator,
    ConsignmentRequestSender,
} from "../shipping";
import {
    PaymentHumanVerificationHandler,
    createSpamProtection,
} from "../spam-protection";
import {
    SubscriptionsActionCreator,
    SubscriptionsRequestSender,
} from "../subscription";
import createPaymentIntegrationSelectors from "./create-payment-integration-selectors";
import DefaultPaymentIntegrationService from "./default-payment-integration-service";
import PaymentIntegrationStoreProjectionFactory from "./payment-integration-store-projection-factory";

export default function createPaymentIntegrationService(
    store: CheckoutStore
): PaymentIntegrationService {
    const {
        config: { getHost },
    } = store.getState();

    const requestSender = createRequestSender({ host: getHost() });

    const storeProjectionFactory = new PaymentIntegrationStoreProjectionFactory(
        createPaymentIntegrationSelectors
    );

    const checkoutActionCreator = new CheckoutActionCreator(
        new CheckoutRequestSender(requestSender),
        new ConfigActionCreator(new ConfigRequestSender(requestSender)),
        new FormFieldsActionCreator(new FormFieldsRequestSender(requestSender))
    );

    const hostedFormFactory = new HostedFormFactory(store);

    const orderActionCreator = new OrderActionCreator(
        new OrderRequestSender(requestSender),
        new CheckoutValidator(new CheckoutRequestSender(requestSender))
    );

    const billingAddressActionCreator = new BillingAddressActionCreator(
        new BillingAddressRequestSender(requestSender),
        new SubscriptionsActionCreator(
            new SubscriptionsRequestSender(requestSender)
        )
    );

    const consignmentActionCreator = new ConsignmentActionCreator(
        new ConsignmentRequestSender(requestSender),
        new CheckoutRequestSender(requestSender)
    );

    const paymentMethodActionCreator = new PaymentMethodActionCreator(
        new PaymentMethodRequestSender(requestSender)
    );

    const paymentActionCreator = new PaymentActionCreator(
        new PaymentRequestSender(createPaymentClient(store)),
        orderActionCreator,
        new PaymentRequestTransformer(),
        new PaymentHumanVerificationHandler(
            createSpamProtection(createScriptLoader())
        )
    );

    return new DefaultPaymentIntegrationService(
        store,
        storeProjectionFactory,
        checkoutActionCreator,
        hostedFormFactory,
        orderActionCreator,
        billingAddressActionCreator,
        consignmentActionCreator,
        paymentMethodActionCreator,
        paymentActionCreator,
        requestSender
    );
}
