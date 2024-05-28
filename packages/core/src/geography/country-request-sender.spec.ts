import {
    createRequestSender,
    createTimeout,
    RequestSender,
    Response,
} from '@bigcommerce/request-sender';

import { SDK_VERSION_HEADERS } from '../common/http-request';
import { getResponse } from '../common/http-request/responses.mock';

import { getCountriesResponseBody } from './countries.mock';
import CountryRequestSender from './country-request-sender';
import { CountryResponseBody } from './country-responses';

describe('CountryRequestSender', () => {
    let countryRequestSender: CountryRequestSender;
    let requestSender: RequestSender;

    beforeEach(() => {
        requestSender = createRequestSender();
        countryRequestSender = new CountryRequestSender(requestSender, { locale: 'en' });
    });

    describe('#loadCountries()', () => {
        let response: Response<CountryResponseBody>;

        beforeEach(() => {
            response = getResponse(getCountriesResponseBody());

            jest.spyOn(requestSender, 'get').mockReturnValue(Promise.resolve(response));
        });

        it('loads countries', async () => {
            const output = await countryRequestSender.loadCountries();

            expect(output).toEqual(response);
            expect(requestSender.get).toHaveBeenCalledWith('/internalapi/v1/store/countries', {
                headers: {
                    'Accept-Language': 'en',
                    ...SDK_VERSION_HEADERS,
                },
            });
        });

        it('loads countries with timeout', async () => {
            const options = { timeout: createTimeout() };
            const output = await countryRequestSender.loadCountries(options);

            expect(output).toEqual(response);
            expect(requestSender.get).toHaveBeenCalledWith('/internalapi/v1/store/countries', {
                ...options,
                headers: {
                    'Accept-Language': 'en',
                    ...SDK_VERSION_HEADERS,
                },
            });
        });
    });
});
