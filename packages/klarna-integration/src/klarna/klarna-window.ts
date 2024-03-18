/* eslint-disable @typescript-eslint/naming-convention */
import KlarnaCredit from './klarna-credit';

export default interface KlarnaWindow extends Window {
    Klarna?: {
        Credit: KlarnaCredit;
    };
}
