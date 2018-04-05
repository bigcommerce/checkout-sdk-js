declare namespace Square {
    interface PaymentFormConstructor {
        new(options: FormOptions): PaymentForm;
    }

    type FormFactory = (options: FormOptions) => PaymentForm;

    class PaymentForm {
        build(): void;
        requestCardNonce(): void;
        setPostalCode(postalCode: string): void;
    }

    interface HostWindow extends Window {
        SqPaymentForm: PaymentFormConstructor;
    }

    interface FormOptions {
        applicationId: string;
        env: string;
        locationId: string;
        inputClass?: string;
        inputStyles?: string[];
        callbacks?: FormCallbacks;
        cardNumber: FormElement;
        cvv: FormElement;
        expirationDate: FormElement;
        postalCode: FormElement;
    }

    interface FormElement {
        elementId: string;
    }

    interface FormCallbacks {
        paymentFormLoaded?: (form: Square.PaymentForm) => void;
        unsupportedBrowserDetected?: () => void;
        cardNonceResponseReceived?: (errors: any, nonce: string) => void;
    }
}
