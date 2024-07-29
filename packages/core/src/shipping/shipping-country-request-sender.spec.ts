import {
    createRequestSender,
    createTimeout,
    RequestSender,
    Response,
} from '@bigcommerce/request-sender';

import { SDK_VERSION_HEADERS } from '../common/http-request';
import { getResponse } from '../common/http-request/responses.mock';
import { CountryResponseBody } from '../geography';

import { getShippingCountriesResponseBody } from './shipping-countries.mock';
import ShippingCountryRequestSender from './shipping-country-request-sender';

describe('ShippingCountryRequestSender', () => {
    let shippingCountryRequestSender: ShippingCountryRequestSender;
    let requestSender: RequestSender;

    beforeEach(() => {
        requestSender = createRequestSender();
        shippingCountryRequestSender = new ShippingCountryRequestSender(requestSender, {
            locale: 'en',
        });
    });

    describe('#loadCountries()', () => {
        let response: Response<CountryResponseBody>;

        beforeEach(() => {
            response = getResponse(getShippingCountriesResponseBody());

            jest.spyOn(requestSender, 'get').mockResolvedValue(response);
        });

        it('loads shipping countries', async () => {
            const output = await shippingCountryRequestSender.loadCountries(1);

            expect(output).toEqual(response);
            expect(requestSender.get).toHaveBeenCalledWith(
                '/internalapi/v1/shipping/countries?channel_id=1',
                {
                    headers: {
                        'Accept-Language': 'en',
                        ...SDK_VERSION_HEADERS,
                    },
                },
            );
        });

        it('loads shipping countries with timeout', async () => {
            const options = { timeout: createTimeout() };
            const output = await shippingCountryRequestSender.loadCountries(2, options);

            expect(output).toEqual(response);
            expect(requestSender.get).toHaveBeenCalledWith(
                '/internalapi/v1/shipping/countries?channel_id=2',
                {
                    ...options,
                    headers: {
                        'Accept-Language': 'en',
                        ...SDK_VERSION_HEADERS,
                    },
                },
            );
        });
    });
});
