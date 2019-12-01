import HostedFieldType from '../hosted-field-type';

import HostedInputValidateErrorData from './hosted-input-validate-error-data';

export default interface HostedInputValidateResults {
    errors: HostedInputValidateErrorDataMap;
    isValid: boolean;
}

export interface HostedInputValidateErrorDataMap {
    [HostedFieldType.CardCode]?: HostedInputValidateErrorData[];
    [HostedFieldType.CardExpiry]: HostedInputValidateErrorData[];
    [HostedFieldType.CardName]: HostedInputValidateErrorData[];
    [HostedFieldType.CardNumber]: HostedInputValidateErrorData[];
}
