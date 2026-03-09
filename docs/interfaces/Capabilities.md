[@bigcommerce/checkout-sdk](../README.md) / Capabilities

# Interface: Capabilities

## Table of contents

### Properties

- [billing](Capabilities.md#billing)
- [customer](Capabilities.md#customer)
- [orderConfirmation](Capabilities.md#orderconfirmation)
- [payment](Capabilities.md#payment)
- [shipping](Capabilities.md#shipping)
- [userJourney](Capabilities.md#userjourney)

## Properties

### billing

• **billing**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `billingSameAsShippingAdmin` | `boolean` |
| `companyAddressBook` | `boolean` |
| `extraBillingFields` | `boolean` |
| `lockQuoteBilling` | `boolean` |
| `manualAddressEntry` | `boolean` |

___

### customer

• **customer**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `b2bCompanySignupRedirect` | `boolean` |
| `guestAccountCreation` | `boolean` |
| `inlineSignIn` | `boolean` |
| `superAdminCompanySelector` | `boolean` |
| `verifyPurchasability` | `boolean` |

___

### orderConfirmation

• **orderConfirmation**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `invoiceRedirect` | `boolean` |
| `orderSummary` | `boolean` |
| `persistB2BMetadata` | `boolean` |
| `storeInvoiceReference` | `boolean` |
| `storeQuoteId` | `boolean` |

___

### payment

• **payment**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `additionalPaymentNotes` | `boolean` |
| `b2bPaymentMethodFilter` | `boolean` |
| `excludeOfflineForInvoice` | `boolean` |
| `excludePPSDK` | `boolean` |
| `paymentMethodFiltering` | `boolean` |
| `poPaymentMethod` | `boolean` |

___

### shipping

• **shipping**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `companyAddressBook` | `boolean` |
| `extraShippingFields` | `boolean` |
| `lockQuoteShipping` | `boolean` |
| `manualAddressEntry` | `boolean` |
| `prefillCompanyAddress` | `boolean` |
| `saveToCompanyAddressBook` | `boolean` |
| `saveToCustomerAddressBook` | `boolean` |

___

### userJourney

• **userJourney**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `disableEditCart` | `boolean` |
| `invoiceCheckout` | `boolean` |
| `quoteCheckout` | `boolean` |
