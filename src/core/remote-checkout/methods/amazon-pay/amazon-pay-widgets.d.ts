declare namespace Widgets {
    class AddressBook {
        constructor(options: AddressBookOptions);
        bind(container: string): void;
    }

    class Wallet {
        constructor(options: WalletOptions);
        bind(container: string): void;
    }

    interface AddressBookOptions {
        scope: string;
        sellerId: string;
        design: {
            designMode: string;
        };
        onAddressSelect: (billingAgreement: BillingAgreement) => void;
        onError: (error: WidgetError) => void;
        onOrderReferenceCreate: (orderReference: OrderReference) => void;
    }

    interface WalletOptions {
        scope: string;
        sellerId: string;
        design: {
            designMode: string;
        };
        onError: (error: WidgetError) => void;
        onPaymentSelect: (orderReference: OrderReference) => void;
    }

    interface BillingAgreement {
        getAmazonBillingAgreementId(): string;
    }

    interface OrderReference {
        getAmazonOrderReferenceId(): string;
    }

    interface WidgetError extends Error {
        getErrorCode(): string;
    }
}
