[@bigcommerce/checkout-sdk](../README.md) / KlarnaPaymentInitializeOptions

# Interface: KlarnaPaymentInitializeOptions

A set of options that are required to initialize the Klarna payment method.

When Klarna is initialized, a widget will be inserted into the DOM. The
widget has a list of payment options for the customer to choose from.

```html
<!-- This is where the widget will be inserted -->
<div id="container"></div>
```

```js
service.initializePayment({
    methodId: 'klarna',
    klarna: {
        container: 'container'
    },
});
```

An additional event callback can be registered.

```js
service.initializePayment({
    methodId: 'klarnav2',
    klarnav2: {
        container: 'container',
        onLoad(response) {
            console.log(response);
        },
    },
});
```

## Table of contents

### Properties

- [container](KlarnaPaymentInitializeOptions.md#container)

### Methods

- [onLoad](KlarnaPaymentInitializeOptions.md#onload)

## Properties

### container

• **container**: `string`

The ID of a container which the payment widget should insert into.

## Methods

### onLoad

▸ `Optional` **onLoad**(`response`): `void`

A callback that gets called when the widget is loaded and ready to be
interacted with.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `response` | [`KlarnaLoadResponse`](KlarnaLoadResponse.md) | The result of the initialization. It indicates whether or not the widget is loaded successfully. |

#### Returns

`void`
