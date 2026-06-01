[**@bigcommerce/checkout-sdk**](../README.md)

***

[@bigcommerce/checkout-sdk](../README.md) / embedCheckout

# Function: embedCheckout()

> **embedCheckout**(`options`): `Promise`\<[`EmbeddedCheckout`](../classes/EmbeddedCheckout.md)\>

Embed the checkout form in an iframe.

## Parameters

### options

[`EmbeddedCheckoutOptions`](../interfaces/EmbeddedCheckoutOptions.md)

Options for embedding the checkout form.

## Returns

`Promise`\<[`EmbeddedCheckout`](../classes/EmbeddedCheckout.md)\>

A promise that resolves to an instance of `EmbeddedCheckout`.

## Remarks

Once the iframe is embedded, it will automatically resize according to the
size of the checkout form. It will also notify the parent window when certain
events have occurred. i.e.: when the form is loaded and ready to be used.

```js
embedCheckout({
    url: 'https://checkout/url',
    containerId: 'container-id',
});
```
