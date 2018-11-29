[@bigcommerce/checkout-sdk](../README.md) > [BraintreePaypalButtonInitializeOptions](../interfaces/braintreepaypalbuttoninitializeoptions.md)

# BraintreePaypalButtonInitializeOptions

## Hierarchy

**BraintreePaypalButtonInitializeOptions**

## Index

### Properties

* [allowCredit](braintreepaypalbuttoninitializeoptions.md#allowcredit)
* [style](braintreepaypalbuttoninitializeoptions.md#style)

### Methods

* [onAuthorizeError](braintreepaypalbuttoninitializeoptions.md#onauthorizeerror)
* [onPaymentError](braintreepaypalbuttoninitializeoptions.md#onpaymenterror)

---

## Properties

<a id="allowcredit"></a>

### `<Optional>` allowCredit

**● allowCredit**: * `undefined` &#124; `false` &#124; `true`
*

Whether or not to show a credit button.

___
<a id="style"></a>

### `<Optional>` style

**● style**: *`Pick`<[PaypalButtonStyleOptions](paypalbuttonstyleoptions.md),  "layout" &#124; "size" &#124; "color" &#124; "label" &#124; "shape" &#124; "tagline" &#124; "fundingicons">*

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

