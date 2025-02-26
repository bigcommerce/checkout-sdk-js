import { RequestOptions } from '../../common/http-request';

export default interface HeadlessPaymentRequestOptions extends RequestOptions {
    body: { entityId: string };
}
