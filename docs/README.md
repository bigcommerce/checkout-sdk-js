
# @bigcommerce/checkout-sdk

## Index

### Functions

* [createCheckoutButtonInitializer](#createcheckoutbuttoninitializer)
* [createCheckoutService](#createcheckoutservice)
* [createCurrencyService](#createcurrencyservice)
* [createLanguageService](#createlanguageservice)

---

## Type aliases

<a id="consignmentsrequestbody"></a>

###  ConsignmentsRequestBody

**ΤConsignmentsRequestBody**: *[ConsignmentCreateRequestBody](interfaces/consignmentcreaterequestbody.md)[]*

___
<a id="orderpayments"></a>

###  OrderPayments

**ΤOrderPayments**: *`Array`< [GatewayOrderPayment](interfaces/gatewayorderpayment.md) &#124; [GiftCertificateOrderPayment](interfaces/giftcertificateorderpayment.md)>*

___

## Functions

<a id="createcheckoutbuttoninitializer"></a>

###  createCheckoutButtonInitializer

▸ **createCheckoutButtonInitializer**(options?: *[CheckoutButtonInitializerOptions](interfaces/checkoutbuttoninitializeroptions.md)*): [CheckoutButtonInitializer](classes/checkoutbuttoninitializer.md)

Creates an instance of `CheckoutButtonInitializer`.

```js
const initializer = createCheckoutButtonInitializer();

initializer.initializeButton({
    methodId: 'braintreepaypal',
    braintreepaypal: {
        container: '#checkoutButton',
    },
});
```

Please note that `CheckoutButtonInitializer` is currently in an early stage of development. Therefore the API is unstable and not ready for public consumption.
*__alpha__*: 

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

Creates an instance of `CheckoutService`.

```js
const service = createCheckoutService();

service.subscribe(state => {
    console.log(state);
});

service.loadCheckout();
```

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

Creates an instance of `CurrencyService`.

```js
const { data } = checkoutService.getState();
const config = data.getConfig();
const checkout = data.getCheckout();
const currencyService = createCurrencyService(config);

currencyService.toStoreCurrency(checkout.grandTotal);
currencyService.toCustomerCurrency(checkout.grandTotal);
```

Please note that `CurrencyService` is currently in an early stage of development. Therefore the API is unstable and not ready for public consumption.
*__alpha__*: 

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| config | [StoreConfig](interfaces/storeconfig.md) |  The config object containing the currency configuration |

**Returns:** [CurrencyService](classes/currencyservice.md)
an instance of `CurrencyService`.

___
<a id="createlanguageservice"></a>

###  createLanguageService

▸ **createLanguageService**(config?: *`Partial`<[LanguageConfig](interfaces/languageconfig.md)>*): [LanguageService](classes/languageservice.md)

Creates an instance of `LanguageService`.

```js
const language = {{{langJson 'optimized_checkout'}}}; // `langJson` is a Handlebars helper provided by BigCommerce's Stencil template engine.
const service = createLanguageService(language);

console.log(service.translate('address.city_label'));
```

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| `Optional` config | `Partial`<[LanguageConfig](interfaces/languageconfig.md)> |  A configuration object. |

**Returns:** [LanguageService](classes/languageservice.md)
An instance of `LanguageService`.

___

