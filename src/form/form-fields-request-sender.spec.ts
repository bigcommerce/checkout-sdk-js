import { createRequestSender, createTimeout, Response } from '@bigcommerce/request-sender';

import { ContentType, INTERNAL_USE_ONLY } from '../common/http-request';
import { getResponse } from '../common/http-request/responses.mock';

import { FormFields } from './form-field';
import FormFieldsRequestSender from './form-fields-request-sender';
import { getFormFields } from './form.mock';

describe('FormFieldsRequestSender', () => {
    const requestSender = createRequestSender();
    let formFieldsRequestSender: FormFieldsRequestSender;

    beforeEach(() => {
        formFieldsRequestSender = new FormFieldsRequestSender(requestSender);
    });

    describe('#loadFormFields()', () => {
        let response: Response<FormFields>;

        beforeEach(() => {
            response = getResponse(getFormFields());

            jest.spyOn(requestSender, 'get')
                .mockReturnValue(Promise.resolve(response));
        });

        it('loads fields', async () => {
            const output = await formFieldsRequestSender.loadFields();

            expect(output).toEqual(response);
            expect(requestSender.get).toHaveBeenCalledWith('/api/storefront/form-fields', {
                headers: {
                    Accept: ContentType.JsonV1,
                    'X-API-INTERNAL': INTERNAL_USE_ONLY,
                },
            });
        });

        it('loads config with timeout', async () => {
            const options = { timeout: createTimeout() };
            const output = await formFieldsRequestSender.loadFields(options);

            expect(output).toEqual(response);
            expect(requestSender.get).toHaveBeenCalledWith('/api/storefront/form-fields', {
                ...options,
                headers: {
                    Accept: ContentType.JsonV1,
                    'X-API-INTERNAL': INTERNAL_USE_ONLY,
                },
            });
        });
    });
});
