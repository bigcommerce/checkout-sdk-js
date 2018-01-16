import { createFormPoster } from 'form-poster';
import {
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

/**
 * @param {DataStore} store
 * @param {PlaceOrderService} placeOrderService
 * @return {PaymentStrategyRegistry}
 */
export default function createPaymentStrategyRegistry(store, placeOrderService) {
    const { checkout } = store.getState();
    const registry = new PaymentStrategyRegistry(checkout.getConfig());
    const scriptLoader = createScriptLoader();

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
