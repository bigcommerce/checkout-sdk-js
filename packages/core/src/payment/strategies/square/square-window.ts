import { SquarePaymentFormConstructor } from './square-form';

export default interface SquareWindow extends Window {
    SqPaymentForm: SquarePaymentFormConstructor;
}
