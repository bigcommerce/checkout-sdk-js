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

#### cannotCreatePersonalAccount

> **cannotCreatePersonalAccount**: `boolean`

#### invoiceRedirect

> **invoiceRedirect**: `boolean`

#### persistB2BMetadata

> **persistB2BMetadata**: `boolean`

***

### payment

> **payment**: `object`

#### additionalField

> **additionalField**: \{ `label`: `string`; `required`: `boolean`; \} \| `null`

#### b2bPaymentMethodFilterType

> **b2bPaymentMethodFilterType**: [`B2BPaymentMethodFilterType`](../enumerations/B2BPaymentMethodFilterType.md) \| `null`

#### hideCheckPaymentMethod

> **hideCheckPaymentMethod**: `boolean`

#### invoicePaymentComment

> **invoicePaymentComment**: `boolean`

#### poConfig

> **poConfig**: \{ `creditLimitCheck`: \{ `creditLimit`: `number`; `currency`: `string`; \} \| `null`; `field`: \{ `label`: `string`; `required`: `boolean`; \} \| `null`; \} \| `null`

***

### shipping

> **shipping**: `object`

#### hideBillingSameAsShippingCheck

> **hideBillingSameAsShippingCheck**: `boolean`

#### hideSaveToAddressBookCheck

> **hideSaveToAddressBookCheck**: `boolean`

#### restrictManualAddressEntry

> **restrictManualAddressEntry**: `boolean`

***

### userJourney

> **userJourney**: `object`

#### disableCoupon

> **disableCoupon**: `boolean`

#### disableEditCart

> **disableEditCart**: `boolean`

#### disableGiftCertificate

> **disableGiftCertificate**: `boolean`

#### disableStoreCredit

> **disableStoreCredit**: `boolean`

#### hasAddressExtraFields

> **hasAddressExtraFields**: `boolean`

#### hasAddressLabel

> **hasAddressLabel**: `boolean`

#### hasCompanyAddressBook

> **hasCompanyAddressBook**: `boolean`

#### hasOrderExtraFields

> **hasOrderExtraFields**: `boolean`

#### quoteConfig

> **quoteConfig**: \{ `id`: `number`; \} \| `null`

#### requiresB2BToken

> **requiresB2BToken**: `boolean`
