import { HostedInputValidateErrorDataMap } from './hosted-input-validate-error-data';

export default interface HostedInputValidateResults {
    errors: HostedInputValidateErrorDataMap;
    isValid: boolean;
}
