@bigcommerce/checkout-sdk

# @bigcommerce/checkout-sdk

## Table of contents

### Modules

- [&lt;internal\&gt;](modules/internal_.md)

### Functions

- [createBodlService](README.md#createbodlservice)
- [createCheckoutService](README.md#createcheckoutservice)
- [createCurrencyService](README.md#createcurrencyservice)
- [createLanguageService](README.md#createlanguageservice)
- [createStepTracker](README.md#createsteptracker)
- [embedCheckout](README.md#embedcheckout)

## Functions

### createBodlService

▸ **createBodlService**(`subscribe`): [`BodlService`](interfaces/internal_.BodlService.md)

Creates an instance of BodlService.

**`remarks`** ```js
const bodlService = BodlService();
bodlService.checkoutBegin();
```

#### Parameters

| Name | Type |
| :------ | :------ |
| `subscribe` | (`subscriber`: (`state`: [`CheckoutSelectors`](interfaces/internal_.CheckoutSelectors.md)) => `void`) => `void` |

#### Returns

[`BodlService`](interfaces/internal_.BodlService.md)

an instance of `BodlService`.

___

### createCheckoutService

▸ **createCheckoutService**(`options?`): [`CheckoutService`](classes/internal_.CheckoutService.md)

Creates an instance of `CheckoutService`.

**`remarks`** ```js
const service = createCheckoutService();

service.subscribe(state => {
    console.log(state);
});

service.loadCheckout();
```

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `options?` | [`CheckoutServiceOptions`](interfaces/internal_.CheckoutServiceOptions.md) | A set of construction options. |

#### Returns

[`CheckoutService`](classes/internal_.CheckoutService.md)

an instance of `CheckoutService`.

___

### createCurrencyService

▸ **createCurrencyService**(`config`): [`CurrencyService`](classes/internal_.CurrencyService.md)

Creates an instance of `CurrencyService`.

**`remarks`** ```js
const { data } = checkoutService.getState();
const config = data.getConfig();
const checkout = data.getCheckout();
const currencyService = createCurrencyService(config);

currencyService.toStoreCurrency(checkout.grandTotal);
currencyService.toCustomerCurrency(checkout.grandTotal);
```

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `config` | [`StoreConfig`](interfaces/internal_.StoreConfig.md) | The config object containing the currency configuration |

#### Returns

[`CurrencyService`](classes/internal_.CurrencyService.md)

an instance of `CurrencyService`.

___

### createLanguageService

▸ **createLanguageService**(`config?`): [`LanguageService`](classes/internal_.LanguageService.md)

Creates an instance of `LanguageService`.

**`remarks`** ```js
const language = {{{langJson 'optimized_checkout'}}}; // `langJson` is a Handlebars helper provided by BigCommerce's Stencil template engine.
const service = createLanguageService(language);

console.log(service.translate('address.city_label'));
```

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `config?` | `Partial`<[`LanguageConfig`](interfaces/internal_.LanguageConfig.md)\> | A configuration object. |

#### Returns

[`LanguageService`](classes/internal_.LanguageService.md)

An instance of `LanguageService`.

___

### createStepTracker

▸ **createStepTracker**(`checkoutService`, `stepTrackerConfig?`): [`StepTracker`](interfaces/internal_.StepTracker.md)

Creates an instance of `StepTracker`.

**`remarks`** ```js
const checkoutService = createCheckoutService();
await checkoutService.loadCheckout();
const stepTracker = createStepTracker(checkoutService);

stepTracker.trackCheckoutStarted();
```

#### Parameters

| Name | Type |
| :------ | :------ |
| `checkoutService` | [`CheckoutService`](classes/internal_.CheckoutService.md) |
| `stepTrackerConfig?` | [`StepTrackerConfig`](interfaces/internal_.StepTrackerConfig.md) |

#### Returns

[`StepTracker`](interfaces/internal_.StepTracker.md)

an instance of `StepTracker`.

___

### embedCheckout

▸ **embedCheckout**(`options`): `Promise`<[`EmbeddedCheckout`](classes/internal_.EmbeddedCheckout.md)\>

Embed the checkout form in an iframe.

**`remarks`** Once the iframe is embedded, it will automatically resize according to the
size of the checkout form. It will also notify the parent window when certain
events have occurred. i.e.: when the form is loaded and ready to be used.

```js
embedCheckout({
    url: 'https://checkout/url',
    containerId: 'container-id',
});
```

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `options` | [`EmbeddedCheckoutOptions`](interfaces/internal_.EmbeddedCheckoutOptions.md) | Options for embedding the checkout form. |

#### Returns

`Promise`<[`EmbeddedCheckout`](classes/internal_.EmbeddedCheckout.md)\>

A promise that resolves to an instance of `EmbeddedCheckout`.
