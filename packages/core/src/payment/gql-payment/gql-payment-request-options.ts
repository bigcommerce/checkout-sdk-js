import { RequestOptions } from '../../common/http-request';

export default interface GqlPaymentRequestOptions extends RequestOptions {
    body: { entityId: string };
}
