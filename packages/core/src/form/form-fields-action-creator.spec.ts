import { createRequestSender, RequestSender, Response } from '@bigcommerce/request-sender';
import { merge, of } from 'rxjs';
import { catchError, toArray } from 'rxjs/operators';

import { getErrorResponse, getResponse } from '../common/http-request/responses.mock';

import { FormFields } from './form-field';
import FormFieldsActionCreator from './form-fields-action-creator';
import { FormFieldsActionType } from './form-fields-actions';
import FormFieldsRequestSender from './form-fields-request-sender';
import { getFormFields } from './form.mock';

describe('FormFieldsActionCreator', () => {
    let requestSender: RequestSender;
    let formFieldsRequestSender: FormFieldsRequestSender;
    let formFieldsActionCreator: FormFieldsActionCreator;
    let errorResponse: Response<any>;
    let response: Response<FormFields>;

    beforeEach(() => {
        requestSender = createRequestSender();
        formFieldsRequestSender = new FormFieldsRequestSender(requestSender);
        formFieldsActionCreator = new FormFieldsActionCreator(formFieldsRequestSender);

        response = getResponse(getFormFields());
        errorResponse = getErrorResponse();

        jest.spyOn(formFieldsRequestSender, 'loadFields')
            .mockReturnValue(Promise.resolve(response));
    });

    describe('#loadConfig()', () => {
        it('emits actions if able to load config', async () => {
            const actions = await formFieldsActionCreator.loadFormFields()
                .pipe(toArray())
                .toPromise();

            expect(actions).toEqual([
                { type: FormFieldsActionType.LoadFormFieldsRequested },
                { type: FormFieldsActionType.LoadFormFieldsSucceeded, payload: response.body },
            ]);
        });

        it('emits error actions if unable to load config', async () => {
            jest.spyOn(formFieldsRequestSender, 'loadFields').mockReturnValue(Promise.reject(errorResponse));

            const errorHandler = jest.fn(action => of(action));
            const actions = await formFieldsActionCreator.loadFormFields()
                .pipe(
                    catchError(errorHandler),
                    toArray()
                )
                .toPromise();

            expect(errorHandler).toHaveBeenCalled();
            expect(actions).toEqual([
                { type: FormFieldsActionType.LoadFormFieldsRequested },
                { type: FormFieldsActionType.LoadFormFieldsFailed, payload: errorResponse, error: true },
            ]);
        });

        it('dispatches actions using cached responses if available', async () => {
            const actions = await merge(
                formFieldsActionCreator.loadFormFields({ useCache: true }),
                formFieldsActionCreator.loadFormFields({ useCache: true })
            )
                .pipe(toArray())
                .toPromise();

            expect(actions).toEqual([
                { type: FormFieldsActionType.LoadFormFieldsRequested },
                { type: FormFieldsActionType.LoadFormFieldsRequested },
                { type: FormFieldsActionType.LoadFormFieldsSucceeded, payload: response.body },
                { type: FormFieldsActionType.LoadFormFieldsSucceeded, payload: response.body },
            ]);

            expect(formFieldsRequestSender.loadFields).toHaveBeenCalledTimes(1);
        });
    });
});
