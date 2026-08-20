import HostedFormFactory from './hosted-form-factory';
import StoredCardHostedFormService from './stored-card-hosted-form-service';

/**
 * Creates an instance of `StoredCardHostedFormService`.
 *
 *
 * @param host - Payments origin. Used for postMessage validation: the hosted-fields route
 * redirects to the payment provider, so this is the iframe's actual document origin.
 * @param storefrontHost - Origin serving the hosted-fields route, used only to build the iframe
 * src. Only needed by headless storefronts, where that route is not on the page's own origin.
 * Omit it to keep the relative-URL behaviour that resolves same-origin on a standard storefront.
 * @returns An instance of `StoredCardHostedFormService`.
 */
export default function createStoredCardHostedFormService(host: string, storefrontHost = '') {
    return new StoredCardHostedFormService(host, new HostedFormFactory(), storefrontHost);
}
