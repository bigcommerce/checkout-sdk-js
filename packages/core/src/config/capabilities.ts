// This is an exact copy of packages/payment-integration-api/src/config/capabilities.ts
// Duplication is needed for interface export
// Please update both files if you want to make changes to the Capabilities interface
export interface Capabilities {
    userJourney: {
        quoteCheckout: boolean;
        invoiceCheckout: boolean;
        disableEditCart: boolean;
    };
    customer: {
        inlineSignIn: boolean;
        verifyPurchasability: boolean;
        superAdminCompanySelector: boolean;
        guestAccountCreation: boolean;
        b2bCompanySignupRedirect: boolean;
    };
    shipping: {
        restrictManualAddressEntry: boolean;
        companyAddressBook: boolean;
        prefillCompanyAddress: boolean;
        saveToCompanyAddressBook: boolean;
        hideSaveToAddressBookCheck: boolean;
        lockQuoteShipping: boolean;
        extraShippingFields: boolean;
        hideBillingSameAsShippingCheck: boolean;
    };
    billing: {
        restrictManualAddressEntry: boolean;
        extraBillingFields: boolean;
        companyAddressBook: boolean;
        billingSameAsShippingAdmin: boolean;
        lockQuoteBilling: boolean;
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
