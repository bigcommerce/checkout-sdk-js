import { createAction } from '@bigcommerce/data-store';
import { concat, defer, of, Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { cachableAction, ActionOptions } from '../common/data-store';
import { throwErrorAction } from '../common/error';
import { RequestOptions } from '../common/http-request';

import { FormFieldsActionType, LoadFormFieldsAction } from './form-fields-actions';
import FormFieldsRequestSender from './form-fields-request-sender';

export default class FormFieldsActionCreator {
    constructor(
        private _formFieldsRequestSender: FormFieldsRequestSender
    ) {}

    @cachableAction
    loadFormFields(options?: RequestOptions & ActionOptions): Observable<LoadFormFieldsAction> {
        return concat(
            of(createAction(FormFieldsActionType.LoadFormFieldsRequested)),
            defer(async () => {
                const { body } = await this._formFieldsRequestSender.loadFields(options);

                return createAction(FormFieldsActionType.LoadFormFieldsSucceeded, body);
            })
        ).pipe(
            catchError(response => throwErrorAction(FormFieldsActionType.LoadFormFieldsFailed, response))
        );
    }
}
