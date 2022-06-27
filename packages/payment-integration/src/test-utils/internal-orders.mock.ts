import { OrderRequestBody } from "../order";
import { OrderPaymentRequestBody } from "../order/order-request-body";
import { getPayment } from "./payments.mock";

export default function getOrderRequestBody(): OrderRequestBody {
    return {
        useStoreCredit: false,
        payment: getPayment() as OrderPaymentRequestBody,
    };
}
