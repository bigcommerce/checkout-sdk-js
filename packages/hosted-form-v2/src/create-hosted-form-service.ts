import HostedFormFactory from './hosted-form-factory';
import HostedFormService from './hosted-form-service';

/**
 * Creates an instance of `HostedFormService`.
 *
 *
 * @param host - Host url string parameter.
 * @returns An instance of `HostedFormService`.
 */
export function createHostedFormService(host: string) {
    return new HostedFormService(host, new HostedFormFactory());
}
