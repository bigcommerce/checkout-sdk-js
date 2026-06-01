[**@bigcommerce/checkout-sdk**](../README.md)

***

[@bigcommerce/checkout-sdk](../README.md) / Capabilities

# Interface: Capabilities

## Properties

### billing

> **billing**: `object`

#### hideSaveToAddressBookCheck

> **hideSaveToAddressBookCheck**: `boolean`

#### restrictManualAddressEntry

> **restrictManualAddressEntry**: `boolean`

***

### customer

> **customer**: `object`

#### superAdminCompanySelector

> **superAdminCompanySelector**: `boolean`

***

### orderConfirmation

> **orderConfirmation**: `object`

#### invoiceRedirect

> **invoiceRedirect**: `boolean`

#### orderSummary

> **orderSummary**: `boolean`

#### persistB2BMetadata

> **persistB2BMetadata**: `boolean`

#### storeInvoiceReference

> **storeInvoiceReference**: `boolean`

#### storeQuoteId

> **storeQuoteId**: `boolean`

***

### payment

> **payment**: `object`

#### additionalField

> **additionalField**: \{ `label`: `string`; `required`: `boolean`; \} \| `null`

#### additionalPaymentNotes

> **additionalPaymentNotes**: `boolean`

#### b2bPaymentMethodFilterType

> **b2bPaymentMethodFilterType**: [`B2BPaymentMethodFilterType`](../enumerations/B2BPaymentMethodFilterType.md) \| `null`

#### excludeOfflineForInvoice

> **excludeOfflineForInvoice**: `boolean`

#### excludePPSDK

> **excludePPSDK**: `boolean`

#### paymentMethodFiltering

> **paymentMethodFiltering**: `boolean`

#### poConfig

> **poConfig**: \{ `creditLimit`: `number`; `currency`: `string`; `label`: `string`; `required`: `boolean`; \} \| `null`

#### poPaymentMethod

> **poPaymentMethod**: `boolean`

***

### shipping

> **shipping**: `object`

#### hideBillingSameAsShippingCheck

> **hideBillingSameAsShippingCheck**: `boolean`

#### hideSaveToAddressBookCheck

> **hideSaveToAddressBookCheck**: `boolean`

#### prefillCompanyAddress

> **prefillCompanyAddress**: `boolean`

#### restrictManualAddressEntry

> **restrictManualAddressEntry**: `boolean`

***

### userJourney

> **userJourney**: `object`

#### disableEditCart

> **disableEditCart**: `boolean`

#### disableStoreCredit

> **disableStoreCredit**: `boolean`

#### hasAddressExtraFields

> **hasAddressExtraFields**: `boolean`

#### hasCompanyAddressBook

> **hasCompanyAddressBook**: `boolean`

#### hasOrderExtraFields

> **hasOrderExtraFields**: `boolean`

#### requiresB2BToken

> **requiresB2BToken**: `boolean`
