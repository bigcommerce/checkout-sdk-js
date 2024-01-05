import HostedFormVaultingFactory from './hosted-form-vaulting-factory';
import HostedFormVaultingService from './hosted-form-vaulting-service';

/**
 * Creates an instance of `HostedFormVaultingService`.
 *
 *
 * @param host - Host url string parameter.
 * @returns An instance of `HostedFormVaultingService`.
 */
export default function createHostedFormVaultingService(host: string) {
    return new HostedFormVaultingService(host, new HostedFormVaultingFactory());
}
