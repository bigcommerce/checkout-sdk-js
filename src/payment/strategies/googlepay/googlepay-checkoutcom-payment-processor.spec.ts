import { RequestError } from '../../../common/error/errors';

import { GooglePayCheckoutcomPaymentProcessor } from './index';

describe('GooglePayCheckoutcomPaymentProcessor', () => {
    let processor: GooglePayCheckoutcomPaymentProcessor;

    beforeEach(() => {
        jest.spyOn(window.location, 'replace')
            .mockResolvedValue(undefined);

        processor = new GooglePayCheckoutcomPaymentProcessor();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('redirects the customer to the proper url', async () => {
        const err: RequestError = new RequestError({
            body: {
                errors: [{ code: 'three_d_secure_required' }],
                three_ds_result: {
                    acs_url: 'https://acs/url',
                },
            },
            headers: {},
            status: 400,
            statusText: 'ThreeDSecure is required.',
        });

        processor.processAdditionalAction(err);

        await new Promise(resolve => process.nextTick(resolve));

        expect(window.location.replace).toHaveBeenCalledWith(err.body.three_ds_result.acs_url);
    });

    it('does not redirect the customer if threeDSecure is not required', async () => {
        await expect(processor.processAdditionalAction(new Error())).rejects.toThrow(Error);

        expect(window.location.replace).not.toHaveBeenCalled();
    });
});
