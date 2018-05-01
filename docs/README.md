


#  @bigcommerce/checkout-sdk

## Index

### Classes

* [CheckoutClient](classes/checkoutclient.md)
* [CheckoutErrorSelector](classes/checkouterrorselector.md)
* [CheckoutSelector](classes/checkoutselector.md)
* [CheckoutService](classes/checkoutservice.md)
* [CheckoutStatusSelector](classes/checkoutstatusselector.md)
* [LanguageService](classes/languageservice.md)
* [StandardError](classes/standarderror.md)


### Interfaces

* [AmazonPayCustomerInitializeOptions](interfaces/amazonpaycustomerinitializeoptions.md)
* [AmazonPayOrderReference](interfaces/amazonpayorderreference.md)
* [AmazonPayPaymentInitializeOptions](interfaces/amazonpaypaymentinitializeoptions.md)
* [AmazonPayShippingInitializeOptions](interfaces/amazonpayshippinginitializeoptions.md)
* [AmazonPayWidgetError](interfaces/amazonpaywidgeterror.md)
* [BraintreePaymentInitializeOptions](interfaces/braintreepaymentinitializeoptions.md)
* [BraintreeThreeDSecureOptions](interfaces/braintreethreedsecureoptions.md)
* [CheckoutSelectors](interfaces/checkoutselectors.md)
* [CheckoutServiceOptions](interfaces/checkoutserviceoptions.md)
* [CreditCard](interfaces/creditcard.md)
* [CustomerCredentials](interfaces/customercredentials.md)
* [CustomerInitializeOptions](interfaces/customerinitializeoptions.md)
* [CustomerRequestOptions](interfaces/customerrequestoptions.md)
* [DiscountNotification](interfaces/discountnotification.md)
* [FormField](interfaces/formfield.md)
* [FormFields](interfaces/formfields.md)
* [InternalAddress](interfaces/internaladdress.md)
* [InternalCart](interfaces/internalcart.md)
* [InternalCoupon](interfaces/internalcoupon.md)
* [InternalCustomer](interfaces/internalcustomer.md)
* [InternalGiftCertificate](interfaces/internalgiftcertificate.md)
* [InternalIncompleteOrder](interfaces/internalincompleteorder.md)
* [InternalLineItem](interfaces/internallineitem.md)
* [InternalOrder](interfaces/internalorder.md)
* [InternalQuote](interfaces/internalquote.md)
* [InternalShippingOption](interfaces/internalshippingoption.md)
* [InternalShippingOptionList](interfaces/internalshippingoptionlist.md)
* [Item](interfaces/item.md)
* [KlarnaLoadResponse](interfaces/klarnaloadresponse.md)
* [KlarnaPaymentInitializeOptions](interfaces/klarnapaymentinitializeoptions.md)
* [LanguageConfig](interfaces/languageconfig.md)
* [LegacyCheckout](interfaces/legacycheckout.md)
* [LegacyConfig](interfaces/legacyconfig.md)
* [LegacyCurrency](interfaces/legacycurrency.md)
* [LegacyShopperCurrency](interfaces/legacyshoppercurrency.md)
* [LegacyStoreConfig](interfaces/legacystoreconfig.md)
* [Locales](interfaces/locales.md)
* [Options](interfaces/options.md)
* [OrderRequestBody](interfaces/orderrequestbody.md)
* [PasswordRequirements](interfaces/passwordrequirements.md)
* [Payment](interfaces/payment.md)
* [PaymentInitializeOptions](interfaces/paymentinitializeoptions.md)
* [PaymentMethod](interfaces/paymentmethod.md)
* [PaymentMethodConfig](interfaces/paymentmethodconfig.md)
* [PaymentRequestOptions](interfaces/paymentrequestoptions.md)
* [PlaceholderData](interfaces/placeholderdata.md)
* [RequestOptions](interfaces/requestoptions.md)
* [ShippingInitializeOptions](interfaces/shippinginitializeoptions.md)
* [ShippingRequestOptions](interfaces/shippingrequestoptions.md)
* [SquareFormElement](interfaces/squareformelement.md)
* [SquarePaymentInitializeOptions](interfaces/squarepaymentinitializeoptions.md)
* [TokenizedCreditCard](interfaces/tokenizedcreditcard.md)
* [Translations](interfaces/translations.md)
* [VaultedInstrument](interfaces/vaultedinstrument.md)
* [VerifyPayload](interfaces/verifypayload.md)


### Type aliases

* [PaymentInstrument](#paymentinstrument)


### Functions

* [createCheckoutClient](#createcheckoutclient)
* [createCheckoutService](#createcheckoutservice)
* [createLanguageService](#createlanguageservice)



---
# Type aliases
<a id="paymentinstrument"></a>

###  PaymentInstrument

**Τ PaymentInstrument**:  *[CreditCard](interfaces/creditcard.md)⎮[TokenizedCreditCard](interfaces/tokenizedcreditcard.md)⎮[VaultedInstrument](interfaces/vaultedinstrument.md)* 






___


# Functions
<a id="createcheckoutclient"></a>

###  createCheckoutClient

► **createCheckoutClient**(config?: *`undefined`⎮`object`*): [CheckoutClient](classes/checkoutclient.md)






**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| config | `undefined`⎮`object`   |  - |





**Returns:** [CheckoutClient](classes/checkoutclient.md)





___

<a id="createcheckoutservice"></a>

###  createCheckoutService

► **createCheckoutService**(options?: *[CheckoutServiceOptions](interfaces/checkoutserviceoptions.md)*): [CheckoutService](classes/checkoutservice.md)






**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| options | [CheckoutServiceOptions](interfaces/checkoutserviceoptions.md)   |  - |





**Returns:** [CheckoutService](classes/checkoutservice.md)





___

<a id="createlanguageservice"></a>

###  createLanguageService

► **createLanguageService**(config?: *`Partial`.<[LanguageConfig](interfaces/languageconfig.md)>*): [LanguageService](classes/languageservice.md)






**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| config | `Partial`.<[LanguageConfig](interfaces/languageconfig.md)>   |  - |





**Returns:** [LanguageService](classes/languageservice.md)





___


