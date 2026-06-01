[**@bigcommerce/checkout-sdk**](../README.md)

***

[@bigcommerce/checkout-sdk](../README.md) / createEmbeddedCheckoutMessenger

# Function: createEmbeddedCheckoutMessenger()

> **createEmbeddedCheckoutMessenger**(`options`): [`EmbeddedCheckoutMessenger`](../interfaces/EmbeddedCheckoutMessenger.md)

**`Alpha`**

Create an instance of `EmbeddedCheckoutMessenger`.

## Parameters

### options

[`EmbeddedCheckoutMessengerOptions`](../interfaces/EmbeddedCheckoutMessengerOptions.md)

Options for creating `EmbeddedCheckoutMessenger`

## Returns

[`EmbeddedCheckoutMessenger`](../interfaces/EmbeddedCheckoutMessenger.md)

- An instance of `EmbeddedCheckoutMessenger`

## Remarks

The object is responsible for posting messages to the parent window from the
iframe when certain events have occurred. For example, when the checkout
form is first loaded, you should notify the parent window about it.

The iframe can only be embedded in domains that are allowed by the store.

```ts
const messenger = createEmbeddedCheckoutMessenger({
    parentOrigin: 'https://some/website',
});

messenger.postFrameLoaded();
```

Please note that this feature is currently in an early stage of development.
Therefore the API is unstable and not ready for public consumption.
