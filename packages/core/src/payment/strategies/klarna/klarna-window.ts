import KlarnaCredit from './klarna-credit';

export default interface KlarnaWindow extends Window {
    Klarna: {
        Credit: KlarnaCredit;
    };
}
