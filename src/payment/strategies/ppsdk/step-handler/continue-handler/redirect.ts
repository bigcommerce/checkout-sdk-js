import { FormPoster } from '@bigcommerce/form-poster';
import { get, isObject, isString, isUndefined, noop } from 'lodash';

import { PaymentsAPIResponse } from '../../ppsdk-payments-api-response';

interface Parameters {
    url: string;
    formFields?: Record<string, string | number | boolean>;
}

export interface Redirect {
    type: 'continue';
    code: 'redirect';
    parameters: Parameters;
}

const isParameters = (x: unknown): x is Parameters => {
    const formFields = get(x, 'formFields');

    return (
        isString(get(x, 'url')) &&
        (isUndefined(formFields) || isObject(formFields))
    );
};

export const isRedirect = (body: PaymentsAPIResponse['body']): body is Redirect => (
    get(body, 'type') === 'continue' &&
    get(body, 'code') === 'redirect' &&
    isParameters(get(body, 'parameters'))
);

export const handleRedirect = ({ url, formFields }: Parameters, formPoster: FormPoster): Promise<never> => {
    if (formFields) {
        formPoster.postForm(url, formFields);
    } else {
        window.location.assign(url);
    }

    return new Promise(noop);
};
