[@bigcommerce/checkout-sdk](../README.md) / [<internal\>](../modules/internal_.md) / KlarnaV2PaymentInitializeOptions

# Interface: KlarnaV2PaymentInitializeOptions

[<internal>](../modules/internal_.md).KlarnaV2PaymentInitializeOptions

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

- [container](internal_.KlarnaV2PaymentInitializeOptions.md#container)

### Methods

- [onLoad](internal_.KlarnaV2PaymentInitializeOptions.md#onload)

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
| `response` | [`KlarnaLoadResponse_2`](internal_.KlarnaLoadResponse_2.md) | The result of the initialization. It indicates whether or not the widget is loaded successfully. |

#### Returns

`void`
