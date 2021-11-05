import PaymentMethod from '../../payment-method';

export enum ActionTypes {
    FORM_POST = 'FormPost',
    WAIT_FOR_CUSTOMER = 'WaitForCustomer',
}

interface FormPost {
    type: ActionTypes.FORM_POST;
    formPost: {
        formPostUrl: string;
        formFields: [{
            fieldName: string;
            fieldValue: string;
        }];
    };
}

interface WaitForCustomer {
    type: ActionTypes.WAIT_FOR_CUSTOMER;
}

export interface OpyPaymentMethod extends PaymentMethod {
    initializationData: {
        nextAction: FormPost | WaitForCustomer;
    };
}

export function isOpyPaymentMethod(paymentMethod: PaymentMethod): paymentMethod is OpyPaymentMethod {
    return !!paymentMethod.initializationData?.nextAction;
}
