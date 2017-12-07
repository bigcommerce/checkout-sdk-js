import { createFormPoster } from 'form-poster';
import {
    CreditCardPaymentStrategy,
    LegacyPaymentStrategy,
    OfflinePaymentStrategy,
    OffsitePaymentStrategy,
    PaypalExpressPaymentStrategy,
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

    registry.addStrategy('creditcard', new CreditCardPaymentStrategy(store, placeOrderService));
    registry.addStrategy('legacy', new LegacyPaymentStrategy(store, placeOrderService));
    registry.addStrategy('offline', new OfflinePaymentStrategy(store, placeOrderService));
    registry.addStrategy('offsite', new OffsitePaymentStrategy(store, placeOrderService));
    registry.addStrategy('paypalexpress', new PaypalExpressPaymentStrategy(store, placeOrderService, scriptLoader));
    registry.addStrategy('paypalexpresscredit', new PaypalExpressPaymentStrategy(store, placeOrderService, scriptLoader));
    registry.addStrategy('sagepay', new SagePayPaymentStrategy(store, placeOrderService, createFormPoster()));

    return registry;
}
