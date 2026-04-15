import { createRequestSender, RequestSender } from '@bigcommerce/request-sender';

import ExperimentAwareRequestSender, { ExperimentConfig } from './experiment-aware-request-sender';
import { getResponse } from './responses.mock';

describe('ExperimentAwareRequestSender', () => {
    const EXPERIMENT_FLAG = 'CHECKOUT-9950.update_sf_checkout_url_for_subfolder';
    const url = '/api/storefront/checkouts/123/billing-address';
    const absoluteUrl = 'https://other-domain.com/api/storefront/checkouts/123/billing-address';
    const options = { body: { foo: 'bar' } };
    const response = getResponse({});

    let requestSender: RequestSender;
    let config: ExperimentConfig;
    let sender: ExperimentAwareRequestSender;

    beforeEach(() => {
        requestSender = createRequestSender();

        jest.spyOn(requestSender, 'sendRequest').mockResolvedValue(response);
        jest.spyOn(requestSender, 'get').mockResolvedValue(response);
        jest.spyOn(requestSender, 'post').mockResolvedValue(response);
        jest.spyOn(requestSender, 'put').mockResolvedValue(response);
        jest.spyOn(requestSender, 'patch').mockResolvedValue(response);
        jest.spyOn(requestSender, 'delete').mockResolvedValue(response);

        config = {
            getBasePath: jest.fn().mockReturnValue('https://store.example.com/en'),
            getFeatures: jest.fn().mockReturnValue({ [EXPERIMENT_FLAG]: true }),
        };

        sender = new ExperimentAwareRequestSender(requestSender, config);
    });

    describe('passthrough methods (no URL prefixing)', () => {
        it('forwards sendRequest without prefixing', async () => {
            await sender.sendRequest(url, options);

            expect(requestSender.sendRequest).toHaveBeenCalledWith(url, options);
        });

        it('forwards get without prefixing', async () => {
            await sender.get(url, options);

            expect(requestSender.get).toHaveBeenCalledWith(url, options);
        });
    });

    describe('mutating methods with experiment enabled and basePath set', () => {
        it('prefixes url for post', async () => {
            await sender.post(url, options);

            expect(requestSender.post).toHaveBeenCalledWith(
                'https://store.example.com/en/api/storefront/checkouts/123/billing-address',
                options,
            );
        });

        it('prefixes url for put', async () => {
            await sender.put(url, options);

            expect(requestSender.put).toHaveBeenCalledWith(
                'https://store.example.com/en/api/storefront/checkouts/123/billing-address',
                options,
            );
        });

        it('prefixes url for patch', async () => {
            await sender.patch(url, options);

            expect(requestSender.patch).toHaveBeenCalledWith(
                'https://store.example.com/en/api/storefront/checkouts/123/billing-address',
                options,
            );
        });

        it('prefixes url for delete', async () => {
            await sender.delete(url, options);

            expect(requestSender.delete).toHaveBeenCalledWith(
                'https://store.example.com/en/api/storefront/checkouts/123/billing-address',
                options,
            );
        });
    });

    describe('_prefixed guard conditions', () => {
        it('does not prefix when experiment flag is disabled', async () => {
            (config.getFeatures as jest.Mock).mockReturnValue({ [EXPERIMENT_FLAG]: false });

            await sender.post(url, options);

            expect(requestSender.post).toHaveBeenCalledWith(url, options);
        });

        it('does not prefix when features are empty (config not loaded yet)', async () => {
            (config.getFeatures as jest.Mock).mockReturnValue({});

            await sender.post(url, options);

            expect(requestSender.post).toHaveBeenCalledWith(url, options);
        });

        it('does not prefix when basePath is undefined', async () => {
            (config.getBasePath as jest.Mock).mockReturnValue(undefined);

            await sender.post(url, options);

            expect(requestSender.post).toHaveBeenCalledWith(url, options);
        });

        it('does not prefix when basePath ends with /checkout', async () => {
            (config.getBasePath as jest.Mock).mockReturnValue('https://store.example.com/checkout');

            await sender.post(url, options);

            expect(requestSender.post).toHaveBeenCalledWith(url, options);
        });

        it('does not prefix when url is absolute', async () => {
            await sender.post(absoluteUrl, options);

            expect(requestSender.post).toHaveBeenCalledWith(absoluteUrl, options);
        });
    });
});
