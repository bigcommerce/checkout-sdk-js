import { combineReducers, Action, Reducer } from '@bigcommerce/data-store';

import { billingAddressReducer } from '../billing';
import { cartReducer } from '../cart';
import { checkoutButtonReducer } from '../checkout-buttons';
import { configReducer } from '../config';
import { couponReducer, giftCertificateReducer } from '../coupon';
import { customerReducer, customerStrategyReducer } from '../customer';
import { countryReducer } from '../geography';
import { orderReducer } from '../order';
import { paymentMethodReducer, paymentReducer, paymentStrategyReducer } from '../payment';
import { instrumentReducer } from '../payment/instrument';
import { remoteCheckoutReducer } from '../remote-checkout';
import { consignmentReducer, shippingCountryReducer, shippingStrategyReducer } from '../shipping';
import { storeCreditReducer } from '../store-credit';
import { subscriptionsReducer } from '../subscription';

import checkoutReducer from './checkout-reducer';
import CheckoutStoreState from './checkout-store-state';

export default function createCheckoutStoreReducer(): Reducer<CheckoutStoreState, Action> {
    return combineReducers({
        billingAddress: billingAddressReducer,
        cart: cartReducer,
        checkout: checkoutReducer,
        checkoutButton: checkoutButtonReducer,
        config: configReducer,
        consignments: consignmentReducer,
        countries: countryReducer,
        coupons: couponReducer,
        customer: customerReducer,
        customerStrategies: customerStrategyReducer,
        giftCertificates: giftCertificateReducer,
        instruments: instrumentReducer,
        order: orderReducer,
        payment: paymentReducer,
        paymentMethods: paymentMethodReducer,
        paymentStrategies: paymentStrategyReducer,
        remoteCheckout: remoteCheckoutReducer,
        shippingCountries: shippingCountryReducer,
        shippingStrategies: shippingStrategyReducer,
        subscriptions: subscriptionsReducer,
        storeCredit: storeCreditReducer,
    });
}
