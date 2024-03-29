/* eslint-disable @typescript-eslint/naming-convention */
import KlarnaPayments from './klarna-payments';

export default interface KlarnaV2Window extends Window {
    Klarna?: {
        Payments: KlarnaPayments;
    };
}
