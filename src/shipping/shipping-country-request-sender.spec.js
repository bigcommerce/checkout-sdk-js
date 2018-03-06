import { createTimeout } from '@bigcommerce/request-sender';
import { getShippingCountriesResponseBody } from './shipping-countries.mock';
import { getResponse } from '../common/http-request/responses.mock';
import ShippingCountryRequestSender from './shipping-country-request-sender';

describe('ShippingCountryRequestSender', () => {
    let shippingCountryRequestSender;
    let requestSender;

    beforeEach(() => {
        requestSender = {
            get: jest.fn(() => Promise.resolve()),
        };

        shippingCountryRequestSender = new ShippingCountryRequestSender(requestSender, { locale: 'en' });
    });

    describe('#loadCountries()', () => {
        let response;

        beforeEach(() => {
            response = getResponse(getShippingCountriesResponseBody());

            requestSender.get.mockReturnValue(Promise.resolve(response));
        });

        it('loads shipping countries', async () => {
            const output = await shippingCountryRequestSender.loadCountries();

            expect(output).toEqual(response);
            expect(requestSender.get).toHaveBeenCalledWith('/internalapi/v1/shipping/countries', {
                headers: {
                    'Accept-Language': 'en',
                },
            });
        });

        it('loads shipping countries with timeout', async () => {
            const options = { timeout: createTimeout() };
            const output = await shippingCountryRequestSender.loadCountries(options);

            expect(output).toEqual(response);
            expect(requestSender.get).toHaveBeenCalledWith('/internalapi/v1/shipping/countries', {
                ...options,
                headers: {
                    'Accept-Language': 'en',
                },
            });
        });
    });
});
