import { flatMap, map, values } from 'lodash';

import { StandardError } from '../../common/error/errors';
import { HostedInputValidateErrorDataMap } from '../iframe-content';

export default class InvalidHostedFormValueError extends StandardError {
    constructor(
        public errors: HostedInputValidateErrorDataMap
    ) {
        super([
            'Unable to proceed due to invalid user input values',
            ...flatMap(values(errors), fieldErrors => map(fieldErrors, ({ message }) => message)),
        ].join('. '));

        this.name = 'InvalidHostedFormValueError';
        this.type = 'invalid_hosted_form_value';
    }
}
