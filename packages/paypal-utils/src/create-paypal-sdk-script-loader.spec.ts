import createPaypalSdkScriptLoader from './create-paypal-sdk-script-loader';
import PaypalSdkScriptLoader from './paypal-sdk-script-loader';

describe('createPaypalSdkScriptLoader', () => {
    it('instantiates Paypal SDK Script Loader', () => {
        const paypalSdkScriptLoaderInstance = createPaypalSdkScriptLoader();

        expect(paypalSdkScriptLoaderInstance).toBeInstanceOf(PaypalSdkScriptLoader);
    });
});
