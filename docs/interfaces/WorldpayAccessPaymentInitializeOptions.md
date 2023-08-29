[@bigcommerce/checkout-sdk](../README.md) / WorldpayAccessPaymentInitializeOptions

# Interface: WorldpayAccessPaymentInitializeOptions

## Table of contents

### Methods

- [onLoad](WorldpayAccessPaymentInitializeOptions.md#onload)

## Methods

### onLoad

▸ **onLoad**(`iframe`, `cancel`): `void`

A callback that gets called when the iframe is ready to be added to the
current page. It is responsible for determining where the iframe should
be inserted in the DOM.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `iframe` | `HTMLIFrameElement` | The iframe element containing the payment web page provided by the strategy. |
| `cancel` | () => `void` | A function, when called, will cancel the payment process and remove the iframe. |

#### Returns

`void`
