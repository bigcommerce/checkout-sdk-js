[@bigcommerce/checkout-sdk](../README.md) › [BraintreePaypalButtonInitializeOptions](braintreepaypalbuttoninitializeoptions.md)

# Interface: BraintreePaypalButtonInitializeOptions

## Hierarchy

* **BraintreePaypalButtonInitializeOptions**

## Index

### Properties

* [allowCredit](braintreepaypalbuttoninitializeoptions.md#optional-allowcredit)
* [shippingAddress](braintreepaypalbuttoninitializeoptions.md#optional-shippingaddress)
* [style](braintreepaypalbuttoninitializeoptions.md#optional-style)

### Methods

* [onAuthorizeError](braintreepaypalbuttoninitializeoptions.md#optional-onauthorizeerror)
* [onPaymentError](braintreepaypalbuttoninitializeoptions.md#optional-onpaymenterror)

## Properties

### `Optional` allowCredit

• **allowCredit**? : *undefined | false | true*

Whether or not to show a credit button.

___

### `Optional` shippingAddress

• **shippingAddress**? : *[Address](address.md) | null*

Address to be used for shipping.
If not provided, it will use the first saved address from the active customer.

___

### `Optional` style

• **style**? : *Pick‹[PaypalButtonStyleOptions](paypalbuttonstyleoptions.md), "layout" | "size" | "color" | "label" | "shape" | "tagline" | "fundingicons"›*

A set of styling options for the checkout button.

## Methods

### `Optional` onAuthorizeError

▸ **onAuthorizeError**(`error`: [BraintreeError](braintreeerror.md) | [StandardError](../classes/standarderror.md)): *void*

A callback that gets called if unable to authorize and tokenize payment.

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`error` | [BraintreeError](braintreeerror.md) &#124; [StandardError](../classes/standarderror.md) | The error object describing the failure.  |

**Returns:** *void*

___

### `Optional` onPaymentError

▸ **onPaymentError**(`error`: [BraintreeError](braintreeerror.md) | [StandardError](../classes/standarderror.md)): *void*

A callback that gets called if unable to submit payment.

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`error` | [BraintreeError](braintreeerror.md) &#124; [StandardError](../classes/standarderror.md) | The error object describing the failure.  |

**Returns:** *void*
