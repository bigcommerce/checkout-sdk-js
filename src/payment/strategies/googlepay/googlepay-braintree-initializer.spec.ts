import {
    createRequestSender,
    RequestSender
} from '@bigcommerce/request-sender';
import { createScriptLoader } from '@bigcommerce/script-loader';

import BraintreeScriptLoader from '../braintree/braintree-script-loader';
import BraintreeSDKCreator from '../braintree/braintree-sdk-creator';

import GooglePayBraintreeInitializer from './googlepay-braintree-initializer';

describe('GooglePayBraintreeInitializer', () => {
    let braintreeSDKCreator: BraintreeSDKCreator;
    let requestSender: RequestSender;

    beforeEach(() => {
        const braintreeScriptLoader = new BraintreeScriptLoader(createScriptLoader());
        braintreeSDKCreator = new BraintreeSDKCreator(braintreeScriptLoader);
        braintreeSDKCreator.initialize = jest.fn();

        requestSender = createRequestSender();
    });

    it('creates an instance of GooglePayBraintreeInitializer', () => {
        const googlePayBraintreeInitializer = new GooglePayBraintreeInitializer(braintreeSDKCreator);
        expect(googlePayBraintreeInitializer).toBeInstanceOf(GooglePayBraintreeInitializer);
    });
});
