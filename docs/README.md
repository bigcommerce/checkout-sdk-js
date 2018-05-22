
#  @bigcommerce/checkout-sdk

## Index

### Classes

* [CheckoutService](classes/checkoutservice.md)
* [CheckoutStoreErrorSelector](classes/checkoutstoreerrorselector.md)
* [CheckoutStoreSelector](classes/checkoutstoreselector.md)
* [CheckoutStoreStatusSelector](classes/checkoutstorestatusselector.md)
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
* [BraintreeVerifyPayload](interfaces/braintreeverifypayload.md)
* [BraintreeVisaCheckoutCustomerInitializeOptions](interfaces/braintreevisacheckoutcustomerinitializeoptions.md)
* [BraintreeVisaCheckoutPaymentInitializeOptions](interfaces/braintreevisacheckoutpaymentinitializeoptions.md)
* [CheckoutSelectors](interfaces/checkoutselectors.md)
* [CheckoutServiceOptions](interfaces/checkoutserviceoptions.md)
* [CheckoutSettings](interfaces/checkoutsettings.md)
* [Country](interfaces/country.md)
* [CreditCardInstrument](interfaces/creditcardinstrument.md)
* [Currency](interfaces/currency.md)
* [CustomerCredentials](interfaces/customercredentials.md)
* [CustomerInitializeOptions](interfaces/customerinitializeoptions.md)
* [CustomerRequestOptions](interfaces/customerrequestoptions.md)
* [DiscountNotification](interfaces/discountnotification.md)
* [FormField](interfaces/formfield.md)
* [FormFieldItem](interfaces/formfielditem.md)
* [FormFieldOptions](interfaces/formfieldoptions.md)
* [FormFields](interfaces/formfields.md)
* [Instrument](interfaces/instrument.md)
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
* [KlarnaLoadResponse](interfaces/klarnaloadresponse.md)
* [KlarnaPaymentInitializeOptions](interfaces/klarnapaymentinitializeoptions.md)
* [LanguageConfig](interfaces/languageconfig.md)
* [Locales](interfaces/locales.md)
* [OrderPaymentRequestBody](interfaces/orderpaymentrequestbody.md)
* [OrderRequestBody](interfaces/orderrequestbody.md)
* [PasswordRequirements](interfaces/passwordrequirements.md)
* [PaymentInitializeOptions](interfaces/paymentinitializeoptions.md)
* [PaymentMethod](interfaces/paymentmethod.md)
* [PaymentMethodConfig](interfaces/paymentmethodconfig.md)
* [PaymentRequestOptions](interfaces/paymentrequestoptions.md)
* [PaymentSettings](interfaces/paymentsettings.md)
* [Region](interfaces/region.md)
* [RequestOptions](interfaces/requestoptions.md)
* [ShippingInitializeOptions](interfaces/shippinginitializeoptions.md)
* [ShippingRequestOptions](interfaces/shippingrequestoptions.md)
* [ShopperConfig](interfaces/shopperconfig.md)
* [ShopperCurrency](interfaces/shoppercurrency.md)
* [SquareFormElement](interfaces/squareformelement.md)
* [SquarePaymentInitializeOptions](interfaces/squarepaymentinitializeoptions.md)
* [StoreConfig](interfaces/storeconfig.md)
* [StoreLinks](interfaces/storelinks.md)
* [StoreProfile](interfaces/storeprofile.md)
* [TranslationData](interfaces/translationdata.md)
* [Translations](interfaces/translations.md)
* [VaultedInstrument](interfaces/vaultedinstrument.md)

### Functions

* [createCheckoutService](#createcheckoutservice)
* [createLanguageService](#createlanguageservice)

---

## Functions

<a id="createcheckoutservice"></a>

###  createCheckoutService

▸ **createCheckoutService**(options?: *[CheckoutServiceOptions](interfaces/checkoutserviceoptions.md)*): [CheckoutService](classes/checkoutservice.md)

**Parameters:**

| Param | Type |
| ------ | ------ |
| `Optional` options | [CheckoutServiceOptions](interfaces/checkoutserviceoptions.md) | 

**Returns:** [CheckoutService](classes/checkoutservice.md)

___
<a id="createlanguageservice"></a>

###  createLanguageService

▸ **createLanguageService**(config?: *`Partial`<[LanguageConfig](interfaces/languageconfig.md)>*): [LanguageService](classes/languageservice.md)

**Parameters:**

| Param | Type |
| ------ | ------ |
| `Optional` config | `Partial`<[LanguageConfig](interfaces/languageconfig.md)> | 

**Returns:** [LanguageService](classes/languageservice.md)

___

