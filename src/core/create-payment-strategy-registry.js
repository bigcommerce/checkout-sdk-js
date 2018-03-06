import { createFormPoster } from 'form-poster';
import { createScriptLoader } from '@bigcommerce/script-loader';
import {
    AfterpayPaymentStrategy,
    AmazonPayPaymentStrategy,
    CreditCardPaymentStrategy,
    KlarnaPaymentStrategy,
    LegacyPaymentStrategy,
    OfflinePaymentStrategy,
    OffsitePaymentStrategy,
    PaypalExpressPaymentStrategy,
    PaypalProPaymentStrategy,
    SagePayPaymentStrategy,
} from './payment/strategies';
import { AmazonPayScriptLoader } from './remote-checkout/methods/amazon-pay';
import { PaymentStrategyRegistry } from './payment';
import { createAfterpayScriptLoader } from './remote-checkout/methods/afterpay';
import createPlaceOrderService from './create-place-order-service';
import createRemoteCheckoutService from './create-remote-checkout-service';
import KlarnaScriptLoader from './remote-checkout/methods/klarna';

/**
 * Creates a Payment Strategy Registry and registers available payment strategies.
 * @param {DataStore} store
 * @param {CheckoutClient} client
 * @param {Client} paymentClient
 * @return {PaymentStrategyRegistry}
 */
export default function createPaymentStrategyRegistry(store, client, paymentClient) {
    const { checkout } = store.getState();
    const registry = new PaymentStrategyRegistry(checkout.getConfig());
    const placeOrderService = createPlaceOrderService(store, client, paymentClient);
    const remoteCheckoutService = createRemoteCheckoutService(store, client);
    const scriptLoader = createScriptLoader();
    const afterpayScriptLoader = createAfterpayScriptLoader();
    const klarnaScriptLoader = new KlarnaScriptLoader(scriptLoader);

    registry.register('afterpay', () =>
        new AfterpayPaymentStrategy(store, placeOrderService, remoteCheckoutService, afterpayScriptLoader)
    );

    registry.register('amazon', () =>
        new AmazonPayPaymentStrategy(
            store,
            placeOrderService,
            remoteCheckoutService,
            new AmazonPayScriptLoader(scriptLoader)
        )
    );

    registry.register('creditcard', () =>
        new CreditCardPaymentStrategy(store, placeOrderService)
    );

    registry.register('klarna', () =>
        new KlarnaPaymentStrategy(store, placeOrderService, remoteCheckoutService, klarnaScriptLoader)
    );

    registry.register('legacy', () =>
        new LegacyPaymentStrategy(store, placeOrderService)
    );

    registry.register('offline', () =>
        new OfflinePaymentStrategy(store, placeOrderService)
    );

    registry.register('offsite', () =>
        new OffsitePaymentStrategy(store, placeOrderService)
    );

    registry.register('paypal', () =>
        new PaypalProPaymentStrategy(store, placeOrderService)
    );

    registry.register('paypalexpress', () =>
        new PaypalExpressPaymentStrategy(store, placeOrderService, scriptLoader)
    );

    registry.register('paypalexpresscredit', () =>
        new PaypalExpressPaymentStrategy(store, placeOrderService, scriptLoader)
    );

    registry.register('sagepay', () =>
        new SagePayPaymentStrategy(store, placeOrderService, createFormPoster())
    );

    return registry;
}
