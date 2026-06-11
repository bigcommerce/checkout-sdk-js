// This is an exact copy of packages/core/src/config/capabilities.ts
// Duplication is needed for interface export
// Please update both files if you want to make changes to the Capabilities interface

export enum B2BPaymentMethodFilterType {
    Standard = 'standard',
    Invoice = 'invoice',
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
        hasAddressLabel: boolean;
        quoteConfig: {
            id: number;
        } | null;
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
            field: {
                label: string;
                required: boolean;
            } | null;
            creditLimitCheck: {
                creditLimit: number;
                currency: string;
            } | null;
        } | null;
        additionalField: {
            label: string;
            required: boolean;
        } | null;
        hideCheckPaymentMethod: boolean;
    };
    orderConfirmation: {
        persistB2BMetadata: boolean;
        invoiceRedirect: boolean;
        cannotCreatePersonalAccount: boolean;
    };
}
