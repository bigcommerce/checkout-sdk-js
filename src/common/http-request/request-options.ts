import { Timeout } from '@bigcommerce/request-sender';

/**
 * A set of options for configuring an asynchronous request.
 */
export default interface RequestOptions {
    /**
     * Provide this option if you want to cancel or time out the request. If the
     * timeout object completes before the request, the request will be
     * cancelled.
     */
    timeout?: Timeout;
}
