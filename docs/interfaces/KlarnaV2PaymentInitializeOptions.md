[@bigcommerce/checkout-sdk](../README.md) / KlarnaV2PaymentInitializeOptions

# Interface: KlarnaV2PaymentInitializeOptions

A set of options that are required to initialize the KlarnaV2 payment method.

When KlarnaV2 is initialized, a list of payment options will be displayed for the customer to choose from.
Each one with its own widget.

```html
<!-- This is where the widget will be inserted -->
<div id="container"></div>
```

```js
service.initializePayment({
    methodId: 'klarnav2',
    klarnav2: {
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

- [container](KlarnaV2PaymentInitializeOptions.md#container)

### Methods

- [onLoad](KlarnaV2PaymentInitializeOptions.md#onload)

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
| `response` | [`KlarnaLoadResponse_2`](KlarnaLoadResponse_2.md) | The result of the initialization. It indicates whether or not the widget is loaded successfully. |

#### Returns

`void`
