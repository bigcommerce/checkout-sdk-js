import { Payment } from '../payment';

export default interface OrderRequestBody {
    payment?: Payment;
    useStoreCredit?: boolean;
    customerMessage?: string;
}
