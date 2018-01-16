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

    registry.register('creditcard', () => new CreditCardPaymentStrategy(store, placeOrderService));
    registry.register('legacy', () => new LegacyPaymentStrategy(store, placeOrderService));
    registry.register('offline', () => new OfflinePaymentStrategy(store, placeOrderService));
    registry.register('offsite', () => new OffsitePaymentStrategy(store, placeOrderService));
    registry.register('paypal', () => new PaypalProPaymentStrategy(store, placeOrderService));
    registry.register('paypalexpress', () => new PaypalExpressPaymentStrategy(store, placeOrderService, scriptLoader));
    registry.register('paypalexpresscredit', () => new PaypalExpressPaymentStrategy(store, placeOrderService, scriptLoader));
    registry.register('sagepay', () => new SagePayPaymentStrategy(store, placeOrderService, createFormPoster()));

    return registry;
}
