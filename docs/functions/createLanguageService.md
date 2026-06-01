[**@bigcommerce/checkout-sdk**](../README.md)

***

[@bigcommerce/checkout-sdk](../README.md) / createLanguageService

# Function: createLanguageService()

> **createLanguageService**(`config?`): [`LanguageService`](../classes/LanguageService.md)

Creates an instance of `LanguageService`.

## Parameters

### config?

`Partial`\<[`LanguageConfig`](../interfaces/LanguageConfig.md)\>

A configuration object.

## Returns

[`LanguageService`](../classes/LanguageService.md)

An instance of `LanguageService`.

## Remarks

```js
const language = {{{langJson 'optimized_checkout'}}}; // `langJson` is a Handlebars helper provided by BigCommerce's Stencil template engine.
const service = createLanguageService(language);

console.log(service.translate('address.city_label'));
```
