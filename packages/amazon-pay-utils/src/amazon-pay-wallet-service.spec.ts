import { PaymentMethodClientUnavailableError } from '@bigcommerce/checkout-sdk/payment-integration-api';

import { AmazonPayV2ButtonColor } from './amazon-pay-v2';
import AmazonPayV2ScriptLoader from './amazon-pay-v2-script-loader';
import AmazonPayWalletService from './amazon-pay-wallet-service';

describe('AmazonPayWalletService', () => {
    let service: AmazonPayWalletService;
    let scriptLoader: jest.Mocked<AmazonPayV2ScriptLoader>;

    const signedConfig = {
        payloadJSON: '{"webCheckoutDetails":{}}',
        signature: 'signature',
        publicKeyId: 'SANDBOX-PUBLIC-KEY',
    };

    const amazonPaySdk = { Pay: {} } as never;

    const paymentMethodWithConfig = {
        initializationData: { createCheckoutSessionConfig: signedConfig },
    } as never;

    beforeEach(() => {
        scriptLoader = {
            load: jest.fn().mockResolvedValue(amazonPaySdk),
        } as unknown as jest.Mocked<AmazonPayV2ScriptLoader>;

        service = new AmazonPayWalletService(scriptLoader);
    });

    it('throws before the SDK is loaded', () => {
        expect(() => service.getAmazonPaySdkOrThrow()).toThrow(PaymentMethodClientUnavailableError);
    });

    it('loads and caches the Amazon Pay SDK', async () => {
        const sdk = await service.loadAmazonPaySdk({} as never);

        expect(sdk).toBe(amazonPaySdk);
        expect(service.getAmazonPaySdkOrThrow()).toBe(amazonPaySdk);
    });

    it('extracts the server-signed checkout session config from initializationData', () => {
        expect(service.getCheckoutSessionConfigOrThrow(paymentMethodWithConfig)).toEqual(
            signedConfig,
        );
    });

    it('throws when the signed checkout session config is missing', () => {
        const paymentMethod = { initializationData: {} } as never;

        expect(() => service.getCheckoutSessionConfigOrThrow(paymentMethod)).toThrow(
            'Missing Amazon Pay "createCheckoutSessionConfig".',
        );
    });

    it('validates button color and defaults to Gold', () => {
        expect(service.getValidButtonColor(AmazonPayV2ButtonColor.DarkGray)).toBe(
            AmazonPayV2ButtonColor.DarkGray,
        );
        expect(service.getValidButtonColor()).toBe(AmazonPayV2ButtonColor.Gold);
    });
});
