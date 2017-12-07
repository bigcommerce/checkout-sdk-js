import * as cookie from 'js-cookie';
import RequestFactory from './request-factory';
import RequestSender from './request-sender';
import PayloadTransformer from './payload-transformer';
import Timeout from './timeout';

/**
 * @return {RequestSender}
 */
export function createRequestSender() {
    return new RequestSender(
        new RequestFactory(),
        new PayloadTransformer(),
        cookie
    );
}

/**
 * @param {number} [delay]
 * @return {Timeout}
 */
export function createTimeout(delay) {
    return new Timeout(delay);
}
