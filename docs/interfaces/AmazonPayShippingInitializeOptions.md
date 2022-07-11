[@bigcommerce/checkout-sdk](../README.md) / AmazonPayShippingInitializeOptions

# Interface: AmazonPayShippingInitializeOptions

A set of options that are required to initialize the shipping step of
checkout in order to support Amazon Pay.

When Amazon Pay is initialized, a widget will be inserted into the DOM. The
widget has a list of shipping addresses for the customer to choose from.

## Table of contents

### Properties

- [container](AmazonPayShippingInitializeOptions.md#container)

### Methods

- [onAddressSelect](AmazonPayShippingInitializeOptions.md#onaddressselect)
- [onError](AmazonPayShippingInitializeOptions.md#onerror)
- [onReady](AmazonPayShippingInitializeOptions.md#onready)

## Properties

### container

• **container**: `string`

The ID of a container which the address widget should insert into.

## Methods

### onAddressSelect

▸ `Optional` **onAddressSelect**(`reference`): `void`

A callback that gets called when the customer selects an address option.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `reference` | [`AmazonPayOrderReference`](AmazonPayOrderReference.md) | The order reference provided by Amazon. |

#### Returns

`void`

___

### onError

▸ `Optional` **onError**(`error`): `void`

A callback that gets called if unable to initialize the widget or select
one of the address options provided by the widget.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `error` | [`AmazonPayWidgetError`](AmazonPayWidgetError.md) \| [`StandardError`](../classes/StandardError.md) | The error object describing the failure of the initialization. |

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
| `reference` | [`AmazonPayOrderReference`](AmazonPayOrderReference.md) | The order reference provided by Amazon. |

#### Returns

`void`
