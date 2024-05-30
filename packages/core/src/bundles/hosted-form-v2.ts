import { HostedFormFactory, HostedFormService } from '@bigcommerce/checkout-sdk/hosted-form-v2';

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

export {
    initializeHostedInput,
    notifyInitializeError,
} from '@bigcommerce/checkout-sdk/hosted-form-v2';
