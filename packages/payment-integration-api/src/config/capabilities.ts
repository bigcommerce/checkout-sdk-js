// This is an exact copy of packages/core/src/config/capabilities.ts
// Duplication is needed for interface export
// Please update both files if you want to make changes to the Capabilities interface

export enum B2BPaymentMethodFilterType {
    Standard = 'STANDARD',
    Invoice = 'INVOICE',
}

export interface Capabilities {
    userJourney: {
        disableCoupon: boolean;
        disableEditCart: boolean;
        disableGiftCertificate: boolean;
        disableStoreCredit: boolean;
        hasCompanyAddressBook: boolean;
        hasAddressExtraFields: boolean;
        hasOrderExtraFields: boolean;
        requiresB2BToken: boolean;
    };
    customer: {
        superAdminCompanySelector: boolean;
    };
    shipping: {
        restrictManualAddressEntry: boolean;
        hideSaveToAddressBookCheck: boolean;
        hideBillingSameAsShippingCheck: boolean;
    };
    billing: {
        restrictManualAddressEntry: boolean;
        hideSaveToAddressBookCheck: boolean;
    };
    payment: {
        b2bPaymentMethodFilterType: B2BPaymentMethodFilterType | null;
        invoicePaymentComment: boolean;
        poConfig: {
            label: string;
            required: boolean;
            creditLimit: number;
            currency: string;
        } | null;
        additionalField: {
            label: string;
            required: boolean;
        } | null;
    };
    orderConfirmation: {
        persistB2BMetadata: boolean;
        invoiceRedirect: boolean;
        canCreatePersonalAccount: boolean;
    };
}
