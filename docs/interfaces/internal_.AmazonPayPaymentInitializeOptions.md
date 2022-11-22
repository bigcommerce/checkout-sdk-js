[@bigcommerce/checkout-sdk](../README.md) / [<internal\>](../modules/internal_.md) / AmazonPayPaymentInitializeOptions

# Interface: AmazonPayPaymentInitializeOptions

[<internal>](../modules/internal_.md).AmazonPayPaymentInitializeOptions

A set of options that are required to initialize the Amazon Pay payment
method.

When AmazonPay is initialized, a widget will be inserted into the DOM. The
widget has a list of payment options for the customer to choose from.

```html
<!-- This is where the widget will be inserted -->
<div id="container"></div>
```

```js
service.initializePayment({
    methodId: 'amazon',
    amazon: {
        container: 'container',
    },
});
```

## Table of contents

### Properties

- [container](internal_.AmazonPayPaymentInitializeOptions.md#container)

### Methods

- [onError](internal_.AmazonPayPaymentInitializeOptions.md#onerror)
- [onPaymentSelect](internal_.AmazonPayPaymentInitializeOptions.md#onpaymentselect)
- [onReady](internal_.AmazonPayPaymentInitializeOptions.md#onready)

## Properties

### container

• **container**: `string`

The ID of a container which the payment widget should insert into.

## Methods

### onError

▸ `Optional` **onError**(`error`): `void`

A callback that gets called if unable to initialize the widget or select
one of the payment options.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `error` | [`AmazonPayWidgetError`](internal_.AmazonPayWidgetError.md) \| [`StandardError`](../classes/internal_.StandardError.md) | The error object describing the failure. |

#### Returns

`void`

___

### onPaymentSelect

▸ `Optional` **onPaymentSelect**(`reference`): `void`

A callback that gets called when the customer selects one of the payment
options provided by the widget.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `reference` | [`AmazonPayOrderReference`](internal_.AmazonPayOrderReference.md) | The order reference provided by Amazon. |

#### Returns

`void`

___

### onReady

▸ `Optional` **onReady**(`reference`): `void`

A callback that gets called when the widget is loaded and ready to be
interacted with.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `reference` | [`AmazonPayOrderReference`](internal_.AmazonPayOrderReference.md) | The order reference provided by Amazon. |

#### Returns

`void`
