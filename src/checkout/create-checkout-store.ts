import { createDataStore } from '@bigcommerce/data-store';

import { cartReducer } from '../cart';
import { createRequestErrorFactory } from '../common/error';
import { configReducer } from '../config';
import { couponReducer, giftCertificateReducer } from '../coupon';
import { customerReducer, customerStrategyReducer } from '../customer';
import { countryReducer } from '../geography';
import { orderReducer } from '../order';
import { paymentMethodReducer, paymentReducer, paymentStrategyReducer } from '../payment';
import { instrumentReducer } from '../payment/instrument';
import { quoteReducer } from '../quote';
import { remoteCheckoutReducer } from '../remote-checkout';
import { shippingCountryReducer, shippingOptionReducer, shippingStrategyReducer } from '../shipping';

import CheckoutStore, { CheckoutStoreOptions, CheckoutStoreReducers } from './checkout-store';
import CheckoutStoreState from './checkout-store-state';
import createActionTransformer from './create-action-transformer';
import createInternalCheckoutSelectors from './create-internal-checkout-selectors';

export default function createCheckoutStore(
    initialState: Partial<CheckoutStoreState> = {},
    options?: CheckoutStoreOptions
): CheckoutStore {
    const actionTransformer = createActionTransformer(createRequestErrorFactory());
    const stateTransformer = (state: CheckoutStoreState) => createInternalCheckoutSelectors(state);

    return createDataStore(
        createCheckoutReducers(),
        initialState,
        { actionTransformer, stateTransformer, ...options }
    );
}

function createCheckoutReducers(): CheckoutStoreReducers {
    return {
        cart: cartReducer,
        config: configReducer,
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
        quote: quoteReducer,
        remoteCheckout: remoteCheckoutReducer,
        shippingCountries: shippingCountryReducer,
        shippingOptions: shippingOptionReducer,
        shippingStrategies: shippingStrategyReducer,
    };
}
