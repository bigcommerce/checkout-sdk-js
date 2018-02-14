declare namespace OffAmazonPayments {
    class Button {
        constructor(container: string, merchantId: string, options: ButtonOptions);
    }

    interface ButtonOptions {
        type: string;
        color: string;
        size: string;
        useAmazonAddressBook: boolean;
        authorization?: () => void;
        onError?: (error: ButtonError) => void;
    }

    interface ButtonError extends Error {
        getErrorCode(): string;
    }
}
