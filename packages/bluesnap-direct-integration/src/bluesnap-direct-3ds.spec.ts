import { createScriptLoader } from '@bigcommerce/script-loader';

import { PaymentMethodFailedError } from '@bigcommerce/checkout-sdk/payment-integration-api';

import BlueSnapDirect3ds from './bluesnap-direct-3ds';
import BlueSnapDirectScriptLoader from './bluesnap-direct-script-loader';
import getBlueSnapDirectSdkMock, {
    previouslyUsedCardDataMock,
    threeDSdata,
} from './mocks/bluesnap-direct-sdk.mock';
import { BlueSnapDirectSdk } from './types';

describe('BlueSnapDirectHostedForm', () => {
    let sdkMocks: ReturnType<typeof getBlueSnapDirectSdkMock>;
    let blueSnapDirectSdkMock: BlueSnapDirectSdk;
    let scriptLoader: BlueSnapDirectScriptLoader;
    let threeDSChallange: BlueSnapDirect3ds;

    beforeEach(() => {
        sdkMocks = getBlueSnapDirectSdkMock();
        blueSnapDirectSdkMock = sdkMocks.sdk;
        scriptLoader = new BlueSnapDirectScriptLoader(createScriptLoader());
        jest.spyOn(scriptLoader, 'load').mockResolvedValue(blueSnapDirectSdkMock);

        threeDSChallange = new BlueSnapDirect3ds();
    });

    describe('#initialize3ds', () => {
        it('should create hosted payment fields with 3DS enabled', async () => {
            threeDSChallange.initialize(blueSnapDirectSdkMock);
            await threeDSChallange.initialize3ds('pfToken', previouslyUsedCardDataMock);

            expect(blueSnapDirectSdkMock.threeDsPaymentsSetup).toHaveBeenCalledWith(
                'pfToken',
                expect.anything(),
            );
            expect(blueSnapDirectSdkMock.threeDsPaymentsSubmitData).toHaveBeenCalledWith(
                previouslyUsedCardDataMock,
            );
        });

        it('should resolves with threeDSecureReferenceId value', async () => {
            threeDSChallange.initialize(blueSnapDirectSdkMock);

            const result = await threeDSChallange.initialize3ds(
                'pfToken',
                previouslyUsedCardDataMock,
            );

            expect(result).toBe(threeDSdata.threeDSecure.threeDSecureReferenceId);
        });

        it('should throw an error if response code different from "1"', async () => {
            sdkMocks = getBlueSnapDirectSdkMock('0');
            blueSnapDirectSdkMock = sdkMocks.sdk;
            jest.spyOn(scriptLoader, 'load').mockResolvedValue(blueSnapDirectSdkMock);

            threeDSChallange = new BlueSnapDirect3ds();
            threeDSChallange.initialize(blueSnapDirectSdkMock);

            await expect(
                threeDSChallange.initialize3ds('pfToken', previouslyUsedCardDataMock),
            ).rejects.toThrow(PaymentMethodFailedError);
        });
    });
});
