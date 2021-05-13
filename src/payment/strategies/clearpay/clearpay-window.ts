import ClearpaySdk from './clearpay-sdk';

export default interface ClearpayWindow extends Window {
    AfterPay?: ClearpaySdk;
}
