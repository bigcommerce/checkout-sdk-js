import { RequestOptions } from '@bigcommerce/request-sender';

/**
 * The set of options for configuring any requests related to spam protection.
 */
export interface SpamProtectionOptions extends RequestOptions {
    /**
     * The container ID where the spam protection should be rendered.
     */
    containerId: string;
}
