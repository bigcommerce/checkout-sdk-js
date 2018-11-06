import { ErrorResponseBody } from '../../common/error';

export default interface CouponErrorResponseBody extends ErrorResponseBody {
    code?: string;
}
