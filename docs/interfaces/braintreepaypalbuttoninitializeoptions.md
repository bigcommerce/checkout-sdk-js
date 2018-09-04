[@bigcommerce/checkout-sdk](../README.md) > [BraintreePaypalButtonInitializeOptions](../interfaces/braintreepaypalbuttoninitializeoptions.md)

# BraintreePaypalButtonInitializeOptions

## Hierarchy

**BraintreePaypalButtonInitializeOptions**

## Index

### Properties

* [container](braintreepaypalbuttoninitializeoptions.md#container)
* [style](braintreepaypalbuttoninitializeoptions.md#style)

### Methods

* [onAuthorizeError](braintreepaypalbuttoninitializeoptions.md#onauthorizeerror)
* [onPaymentError](braintreepaypalbuttoninitializeoptions.md#onpaymenterror)

---

## Properties

<a id="container"></a>

###  container

**● container**: *`string`*

The ID of a container which the checkout button should be inserted.

___
<a id="style"></a>

### `<Optional>` style

**● style**: *`Pick`<[PaypalButtonStyleOptions](paypalbuttonstyleoptions.md),  "color" &#124; "shape" &#124; "size">*

A set of styling options for the checkout button.

___

## Methods

<a id="onauthorizeerror"></a>

### `<Optional>` onAuthorizeError

▸ **onAuthorizeError**(error: * [BraintreeError](braintreeerror.md) &#124; [StandardError](../classes/standarderror.md)*): `void`

A callback that gets called if unable to authorize and tokenize payment.

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| error |  [BraintreeError](braintreeerror.md) &#124; [StandardError](../classes/standarderror.md)|  The error object describing the failure. |

**Returns:** `void`

___
<a id="onpaymenterror"></a>

### `<Optional>` onPaymentError

▸ **onPaymentError**(error: * [BraintreeError](braintreeerror.md) &#124; [StandardError](../classes/standarderror.md)*): `void`

A callback that gets called if unable to submit payment.

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| error |  [BraintreeError](braintreeerror.md) &#124; [StandardError](../classes/standarderror.md)|  The error object describing the failure. |

**Returns:** `void`

___

