
# @bigcommerce/checkout-sdk

## Index

### Functions

* [createCheckoutButtonInitializer](#createcheckoutbuttoninitializer)
* [createCheckoutService](#createcheckoutservice)
* [createCurrencyService](#createcurrencyservice)
* [createEmbeddedCheckoutMessenger](#createembeddedcheckoutmessenger)
* [createLanguageService](#createlanguageservice)
* [createStepTracker](#createsteptracker)
* [embedCheckout](#embedcheckout)

---

## Type aliases

<a id="addresskey"></a>

###  AddressKey

**ΤAddressKey**: *`keyof Address`*

___
<a id="adyencomponentstate"></a>

###  AdyenComponentState

**ΤAdyenComponentState**: * [CardState](interfaces/cardstate.md) &#124; [WechatState](interfaces/wechatstate.md)
*

___
<a id="analyticsteptype"></a>

###  AnalyticStepType

**ΤAnalyticStepType**: * "customer" &#124; "shipping" &#124; "billing" &#124; "payment"
*

___
<a id="checkoutincludeparam"></a>

###  CheckoutIncludeParam

**ΤCheckoutIncludeParam**: *`object`*

#### Type declaration

___
<a id="consignmentsrequestbody"></a>

###  ConsignmentsRequestBody

**ΤConsignmentsRequestBody**: *[ConsignmentCreateRequestBody](interfaces/consignmentcreaterequestbody.md)[]*

___
<a id="flashmessagetype"></a>

###  FlashMessageType

**ΤFlashMessageType**: * "error" &#124; "info" &#124; "warning" &#124; "success"
*

___
<a id="formfieldfieldtype"></a>

###  FormFieldFieldType

**ΤFormFieldFieldType**: * "checkbox" &#124; "date" &#124; "text" &#124; "dropdown" &#124; "radio" &#124; "multiline"
*

___
<a id="formfieldtype"></a>

###  FormFieldType

**ΤFormFieldType**: * "array" &#124; "date" &#124; "integer" &#124; "string"
*

___
<a id="guestcredentials"></a>

###  GuestCredentials

**ΤGuestCredentials**: * `Partial`<[Subscriptions](interfaces/subscriptions.md)> & `object`
*

___
<a id="hostedcreditcardinstrument"></a>

###  HostedCreditCardInstrument

**ΤHostedCreditCardInstrument**: *[Omit](#omit)<[CreditCardInstrument](interfaces/creditcardinstrument.md),  "ccExpiry" &#124; "ccName" &#124; "ccNumber" &#124; "ccCvv">*

___
<a id="hostedfieldblureventdata"></a>

###  HostedFieldBlurEventData

**ΤHostedFieldBlurEventData**: *`object`*

#### Type declaration

 fieldType: [HostedFieldType](enums/hostedfieldtype.md)

___
<a id="hostedfieldcardtypechangeeventdata"></a>

###  HostedFieldCardTypeChangeEventData

**ΤHostedFieldCardTypeChangeEventData**: *`object`*

#### Type declaration

`Optional`  cardType:  `undefined` &#124; `string`

___
<a id="hostedfieldentereventdata"></a>

###  HostedFieldEnterEventData

**ΤHostedFieldEnterEventData**: *`object`*

#### Type declaration

 fieldType: [HostedFieldType](enums/hostedfieldtype.md)

___
<a id="hostedfieldfocuseventdata"></a>

###  HostedFieldFocusEventData

**ΤHostedFieldFocusEventData**: *`object`*

#### Type declaration

 fieldType: [HostedFieldType](enums/hostedfieldtype.md)

___
<a id="hostedfieldoptionsmap"></a>

###  HostedFieldOptionsMap

**ΤHostedFieldOptionsMap**: * [HostedCardFieldOptionsMap](interfaces/hostedcardfieldoptionsmap.md) &#124; [HostedStoredCardFieldOptionsMap](interfaces/hostedstoredcardfieldoptionsmap.md)
*

___
<a id="hostedfieldstyles"></a>

###  HostedFieldStyles

**ΤHostedFieldStyles**: *[HostedInputStyles](#hostedinputstyles)*

___
<a id="hostedfieldvalidateeventdata"></a>

###  HostedFieldValidateEventData

**ΤHostedFieldValidateEventData**: *[HostedInputValidateResults](interfaces/hostedinputvalidateresults.md)*

___
<a id="hostedinputstyles"></a>

###  HostedInputStyles

**ΤHostedInputStyles**: *`Partial`<`Pick`<`CSSStyleDeclaration`,  "color" &#124; "fontFamily" &#124; "fontSize" &#124; "fontWeight">>*

___
<a id="hostedvaultedinstrument"></a>

###  HostedVaultedInstrument

**ΤHostedVaultedInstrument**: *[Omit](#omit)<[VaultedInstrument](interfaces/vaultedinstrument.md),  "ccNumber" &#124; "ccCvv">*

___
<a id="instrument"></a>

###  Instrument

**ΤInstrument**: *[CardInstrument](interfaces/cardinstrument.md)*

___
<a id="omit"></a>

###  Omit

**ΤOmit**: *`Pick`<`T`, `Exclude`<`keyof T`, `K`>>*

___
<a id="orderpayments"></a>

###  OrderPayments

**ΤOrderPayments**: *`Array`< [GatewayOrderPayment](interfaces/gatewayorderpayment.md) &#124; [GiftCertificateOrderPayment](interfaces/giftcertificateorderpayment.md)>*

___
<a id="paymentinstrument"></a>

###  PaymentInstrument

**ΤPaymentInstrument**: * [CardInstrument](interfaces/cardinstrument.md) &#124; [AccountInstrument](interfaces/accountinstrument.md)
*

___

## Functions

<a id="createcheckoutbuttoninitializer"></a>

###  createCheckoutButtonInitializer

▸ **createCheckoutButtonInitializer**(options?: *[CheckoutButtonInitializerOptions](interfaces/checkoutbuttoninitializeroptions.md)*): [CheckoutButtonInitializer](classes/checkoutbuttoninitializer.md)

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| `Optional` options | [CheckoutButtonInitializerOptions](interfaces/checkoutbuttoninitializeroptions.md) |  A set of construction options. |

**Returns:** [CheckoutButtonInitializer](classes/checkoutbuttoninitializer.md)
an instance of `CheckoutButtonInitializer`.

___
<a id="createcheckoutservice"></a>

###  createCheckoutService

▸ **createCheckoutService**(options?: *[CheckoutServiceOptions](interfaces/checkoutserviceoptions.md)*): [CheckoutService](classes/checkoutservice.md)

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| `Optional` options | [CheckoutServiceOptions](interfaces/checkoutserviceoptions.md) |  A set of construction options. |

**Returns:** [CheckoutService](classes/checkoutservice.md)
an instance of `CheckoutService`.

___
<a id="createcurrencyservice"></a>

###  createCurrencyService

▸ **createCurrencyService**(config: *[StoreConfig](interfaces/storeconfig.md)*): [CurrencyService](classes/currencyservice.md)

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| config | [StoreConfig](interfaces/storeconfig.md) |  The config object containing the currency configuration |

**Returns:** [CurrencyService](classes/currencyservice.md)
an instance of `CurrencyService`.

___
<a id="createembeddedcheckoutmessenger"></a>

###  createEmbeddedCheckoutMessenger

▸ **createEmbeddedCheckoutMessenger**(options: *[EmbeddedCheckoutMessengerOptions](interfaces/embeddedcheckoutmessengeroptions.md)*): [EmbeddedCheckoutMessenger](interfaces/embeddedcheckoutmessenger.md)

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| options | [EmbeddedCheckoutMessengerOptions](interfaces/embeddedcheckoutmessengeroptions.md) |  Options for creating \`EmbeddedCheckoutMessenger\` |

**Returns:** [EmbeddedCheckoutMessenger](interfaces/embeddedcheckoutmessenger.md)
- An instance of `EmbeddedCheckoutMessenger`

___
<a id="createlanguageservice"></a>

###  createLanguageService

▸ **createLanguageService**(config?: *`Partial`<[LanguageConfig](interfaces/languageconfig.md)>*): [LanguageService](classes/languageservice.md)

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| `Optional` config | `Partial`<[LanguageConfig](interfaces/languageconfig.md)> |  A configuration object. |

**Returns:** [LanguageService](classes/languageservice.md)
An instance of `LanguageService`.

___
<a id="createsteptracker"></a>

###  createStepTracker

▸ **createStepTracker**(checkoutService: *[CheckoutService](classes/checkoutservice.md)*, stepTrackerConfig?: *[StepTrackerConfig](interfaces/steptrackerconfig.md)*): [StepTracker](interfaces/steptracker.md)

**Parameters:**

| Param | Type |
| ------ | ------ |
| checkoutService | [CheckoutService](classes/checkoutservice.md) |
| `Optional` stepTrackerConfig | [StepTrackerConfig](interfaces/steptrackerconfig.md) |

**Returns:** [StepTracker](interfaces/steptracker.md)
an instance of `StepTracker`.

___
<a id="embedcheckout"></a>

###  embedCheckout

▸ **embedCheckout**(options: *[EmbeddedCheckoutOptions](interfaces/embeddedcheckoutoptions.md)*): `Promise`<[EmbeddedCheckout](classes/embeddedcheckout.md)>

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| options | [EmbeddedCheckoutOptions](interfaces/embeddedcheckoutoptions.md) |  Options for embedding the checkout form. |

**Returns:** `Promise`<[EmbeddedCheckout](classes/embeddedcheckout.md)>
A promise that resolves to an instance of `EmbeddedCheckout`.

___

