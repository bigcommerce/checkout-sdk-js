import { createFormPoster } from 'form-poster';
import {
    AfterpayPaymentStrategy,
    CreditCardPaymentStrategy,
    LegacyPaymentStrategy,
    OfflinePaymentStrategy,
    OffsitePaymentStrategy,
    PaypalExpressPaymentStrategy,
    PaypalProPaymentStrategy,
    SagePayPaymentStrategy,
} from './payment/strategies';
import { PaymentStrategyRegistry } from './payment';
import { createScriptLoader } from '../script-loader';
import { createAfterpayScriptLoader } from './remote-checkout/methods/afterpay';
import createPlaceOrderService from './create-place-order-service';
import createRemoteCheckoutService from './create-remote-checkout-service';

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

    registry.register('afterpay', (method) => new AfterpayPaymentStrategy(method, store, placeOrderService, remoteCheckoutService, afterpayScriptLoader));
    registry.register('creditcard', (method) => new CreditCardPaymentStrategy(method, store, placeOrderService));
    registry.register('legacy', (method) => new LegacyPaymentStrategy(method, store, placeOrderService));
    registry.register('offline', (method) => new OfflinePaymentStrategy(method, store, placeOrderService));
    registry.register('offsite', (method) => new OffsitePaymentStrategy(method, store, placeOrderService));
    registry.register('paypal', (method) => new PaypalProPaymentStrategy(method, store, placeOrderService));
    registry.register('paypalexpress', (method) => new PaypalExpressPaymentStrategy(method, store, placeOrderService, scriptLoader));
    registry.register('paypalexpresscredit', (method) => new PaypalExpressPaymentStrategy(method, store, placeOrderService, scriptLoader));
    registry.register('sagepay', (method) => new SagePayPaymentStrategy(method, store, placeOrderService, createFormPoster()));

    return registry;
}
