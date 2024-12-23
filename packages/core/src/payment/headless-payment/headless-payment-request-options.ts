import { RequestOptions } from '../../common/http-request';

export default interface HeadlessPaymentRequestOptions extends RequestOptions {
    body?: { query: string };
    headers: { Authorization: string; [key: string]: string };
}
