import { createRequestSender, createTimeout, RequestSender, Response } from '@bigcommerce/request-sender';

import { getResponse } from '../common/http-request/responses.mock';

import { getCountriesResponseBody } from './countries.mock';
import CountryRequestSender from './country-request-sender';

describe('CountryRequestSender', () => {
    let countryRequestSender: CountryRequestSender;
    let requestSender: RequestSender;

    beforeEach(() => {
        requestSender = createRequestSender();
        countryRequestSender = new CountryRequestSender(requestSender, { locale: 'en' });
    });

    describe('#loadCountries()', () => {
        let response: Response;

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
                },
            });
        });
    });
});
