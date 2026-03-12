// This is an exact copy of packages/core/src/config/capabilities.ts
// Duplication is needed for interface export
// Please update both files if you want to make changes to the Capabilities interface
export interface Capabilities {
    userJourney: {
        disableEditCart: boolean;
        hasCompanyAddressBook: boolean;
        hasExtraAddressFields: boolean;
    };
    customer: {
        superAdminCompanySelector: boolean;
    };
    shipping: {
        restrictManualAddressEntry: boolean;
        prefillCompanyAddress: boolean;
        hideSaveToAddressBookCheck: boolean;
        hideBillingSameAsShippingCheck: boolean;
    };
    billing: {
        restrictManualAddressEntry: boolean;
        hideSaveToAddressBookCheck: boolean;
    };
    payment: {
        paymentMethodFiltering: boolean;
        b2bPaymentMethodFilter: boolean;
        poPaymentMethod: boolean;
        additionalPaymentNotes: boolean;
        excludeOfflineForInvoice: boolean;
        excludePPSDK: boolean;
    };
    orderConfirmation: {
        orderSummary: boolean;
        persistB2BMetadata: boolean;
        storeQuoteId: boolean;
        storeInvoiceReference: boolean;
        invoiceRedirect: boolean;
    };
}
