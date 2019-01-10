
# @bigcommerce/checkout-sdk

## Index

### Functions

* [createCheckoutButtonInitializer](#createcheckoutbuttoninitializer)
* [createCheckoutService](#createcheckoutservice)
* [createCurrencyService](#createcurrencyservice)
* [createEmbeddedCheckoutMessenger](#createembeddedcheckoutmessenger)
* [createLanguageService](#createlanguageservice)
* [embedCheckout](#embedcheckout)

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

*__alpha__*: Please note that `CheckoutButtonInitializer` is currently in an early stage of development. Therefore the API is unstable and not ready for public consumption.

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

*__alpha__*: Please note that `CurrencyService` is currently in an early stage of development. Therefore the API is unstable and not ready for public consumption.

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

Create an instance of `EmbeddedCheckoutMessenger`.

The object is responsible for posting messages to the parent window from the iframe when certain events have occurred. For example, when the checkout form is first loaded, you should notify the parent window about it.

The iframe can only be embedded in domains that are allowed by the store.

```ts
const messenger = createEmbeddedCheckoutMessenger({
    parentOrigin: 'https://some/website',
});

messenger.postFrameLoaded();
```

*__alpha__*: Please note that this feature is currently in an early stage of development. Therefore the API is unstable and not ready for public consumption.

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
<a id="embedcheckout"></a>

###  embedCheckout

▸ **embedCheckout**(options: *[EmbeddedCheckoutOptions](interfaces/embeddedcheckoutoptions.md)*): `Promise`<[EmbeddedCheckout](classes/embeddedcheckout.md)>

Embed the checkout form in an iframe.

Once the iframe is embedded, it will automatically resize according to the size of the checkout form. It will also notify the parent window when certain events have occurred. i.e.: when the form is loaded and ready to be used.

```js
embedCheckout({
    url: 'https://checkout/url',
    containerId: 'container-id',
});
```

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| options | [EmbeddedCheckoutOptions](interfaces/embeddedcheckoutoptions.md) |  Options for embedding the checkout form. |

**Returns:** `Promise`<[EmbeddedCheckout](classes/embeddedcheckout.md)>
A promise that resolves to an instance of `EmbeddedCheckout`.

___

