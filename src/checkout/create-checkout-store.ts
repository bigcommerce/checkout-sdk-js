import { createDataStore, Action, DataStore } from '@bigcommerce/data-store';

import { cartReducer } from '../cart';
import { CheckoutSelectors } from '../checkout';
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

import { CheckoutStoreOptions } from './checkout-store';
import CheckoutStoreState from './checkout-store-state';
import createActionTransformer from './create-action-transformer';
import createCheckoutSelectors from './create-checkout-selectors';
import createInternalCheckoutSelectors from './create-internal-checkout-selectors';

/**
 * @todo Convert this file into TypeScript properly
 */
export default function createCheckoutStore(
    initialState: Partial<CheckoutStoreState> = {},
    options?: CheckoutStoreOptions
): DataStore<CheckoutStoreState, Action, CheckoutSelectors> {
    const actionTransformer = createActionTransformer(createRequestErrorFactory());
    const stateTransformer = (state: CheckoutStoreState) => createCheckoutSelectors(createInternalCheckoutSelectors(state), options);

    return createDataStore(
        createCheckoutReducers(),
        initialState,
        { actionTransformer, stateTransformer, ...options }
    );
}

/**
 * @private
 * @return {CheckoutReducers}
 */
function createCheckoutReducers(): any {
    return {
        cart: cartReducer,
        config: configReducer,
        countries: countryReducer,
        coupons: couponReducer,
        customer: customerReducer,
        customerStrategy: customerStrategyReducer,
        giftCertificates: giftCertificateReducer,
        instruments: instrumentReducer,
        order: orderReducer,
        payment: paymentReducer,
        paymentMethods: paymentMethodReducer,
        paymentStrategy: paymentStrategyReducer,
        quote: quoteReducer,
        remoteCheckout: remoteCheckoutReducer,
        shippingCountries: shippingCountryReducer,
        shippingOptions: shippingOptionReducer,
        shippingStrategy: shippingStrategyReducer,
    };
}
