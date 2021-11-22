import { createAction } from "@bigcommerce/data-store";
import { createRequestSender, RequestSender } from "@bigcommerce/request-sender";
import { createScriptLoader } from "@bigcommerce/script-loader";
import { of } from "rxjs";
import { ApplePayPaymentStrategy } from ".";
import { PaymentMethodActionCreator, StorefrontPaymentRequestSender, PaymentActionCreator, createPaymentClient, PaymentMethodRequestSender, PaymentRequestSender, PaymentRequestTransformer, PaymentInitializeOptions } from "../..";
import { getCartState } from "../../../cart/carts.mock";
import { CheckoutRequestSender, CheckoutStore, CheckoutValidator, createCheckoutStore } from "../../../checkout";
import { getCheckoutState } from "../../../checkout/checkouts.mock";
import { getConfigState } from "../../../config/configs.mock";
import { getCustomerState } from "../../../customer/customers.mock";
import { OrderActionCreator, OrderActionType, OrderRequestBody, OrderRequestSender } from "../../../order";
import { OrderFinalizationNotRequiredError } from "../../../order/errors";
import { getOrderRequestBody } from "../../../order/internal-orders.mock";
import { createSpamProtection, PaymentHumanVerificationHandler } from "../../../spam-protection";
import { getPaymentMethodsState } from "../../payment-methods.mock";

describe('ApplePayPaymentStrategy', () => {
    let store: CheckoutStore;
    let requestSender: RequestSender;
    let paymentClient: OrderRequestSender;
    let orderActionCreator: OrderActionCreator;
    let paymentMethodActionCreator: PaymentMethodActionCreator;
    let paymentActionCreator: PaymentActionCreator;
    let strategy: ApplePayPaymentStrategy;

    beforeEach(() => {
        store = createCheckoutStore({
            checkout: getCheckoutState(),
            customer: getCustomerState(),
            config: getConfigState(),
            cart: getCartState(),
            paymentMethods: getPaymentMethodsState(),
        });

        requestSender = createRequestSender();
        paymentClient = createPaymentClient(store);

        orderActionCreator = new OrderActionCreator(
            paymentClient,
            new CheckoutValidator(new CheckoutRequestSender(requestSender))
        );

        paymentMethodActionCreator = new PaymentMethodActionCreator(
            new PaymentMethodRequestSender(requestSender)
        );

        paymentActionCreator = new PaymentActionCreator(
            new PaymentRequestSender(paymentClient),
            orderActionCreator,
            new PaymentRequestTransformer(),
            new PaymentHumanVerificationHandler(createSpamProtection(createScriptLoader()))
        );


        jest.spyOn(orderActionCreator, 'submitOrder')
            .mockReturnValue(of(createAction(OrderActionType.SubmitOrderRequested)));

        jest.spyOn(paymentMethodActionCreator, 'loadPaymentMethod')
            .mockResolvedValue(store.getState());

        strategy = new ApplePayPaymentStrategy(
            store,
            requestSender,
            orderActionCreator,
            paymentMethodActionCreator,
            paymentActionCreator
        );
    });

    describe('#initialize()', () => {
        it('initializes the strategy successfully', async () => {
            await expect(strategy.initialize()).resolves.toEqual(store.getState());
        });
    });

    describe('#execute()', () => {
        // Complete applepay mocks + tests here.
    });

    describe('#finalize()', () => {
        it('throws error to inform that order finalization is not required', async () => {
            await expect(strategy.finalize()).rejects.toThrow(OrderFinalizationNotRequiredError);
        });
    });

    describe('#deinitialize()', () => {
        it('deinitializes strategy', async () => {
            await expect(strategy.deinitialize()).resolves.toEqual(store.getState());
        });
    });
});
