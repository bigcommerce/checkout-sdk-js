import createPayPalSdkScriptLoader from './create-paypal-sdk-script-loader';
import PayPalSdkScriptLoader from './paypal-sdk-script-loader';

describe('createPayPalSdkScriptLoader', () => {
    it('instantiates Paypal SDK Script Loader', () => {
        const paypalSdkScriptLoaderInstance = createPayPalSdkScriptLoader();

        expect(paypalSdkScriptLoaderInstance).toBeInstanceOf(PayPalSdkScriptLoader);
    });
});
