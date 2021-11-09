import { FormPoster } from '@bigcommerce/form-poster';
import { get, isObject, isString, isUndefined, noop } from 'lodash';

import { PaymentMethodCancelledError } from '../../../../../errors';
import { PaymentsAPIResponse } from '../../../ppsdk-payments-api-response';

import { RedirectionState } from './RedirectionState';

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
    const redirectionState = new RedirectionState();

    if (redirectionState.isRedirecting()) {
        redirectionState.setRedirecting(false);

        return Promise.reject(new PaymentMethodCancelledError());
    }

    redirectionState.setRedirecting(true);

    if (formFields) {
        formPoster.postForm(url, formFields);
    } else {
        window.location.assign(url);
    }

    return new Promise(noop);
};
