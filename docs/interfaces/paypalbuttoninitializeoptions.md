[@bigcommerce/checkout-sdk](../README.md) › [PaypalButtonInitializeOptions](paypalbuttoninitializeoptions.md)

# Interface: PaypalButtonInitializeOptions

## Hierarchy

* **PaypalButtonInitializeOptions**

## Index

### Properties

* [allowCredit](paypalbuttoninitializeoptions.md#optional-allowcredit)
* [clientId](paypalbuttoninitializeoptions.md#clientid)
* [style](paypalbuttoninitializeoptions.md#optional-style)

### Methods

* [onAuthorizeError](paypalbuttoninitializeoptions.md#optional-onauthorizeerror)
* [onPaymentError](paypalbuttoninitializeoptions.md#optional-onpaymenterror)

## Properties

### `Optional` allowCredit

• **allowCredit**? : *undefined | false | true*

Whether or not to show a credit button.

___

###  clientId

• **clientId**: *string*

The Client ID of the Paypal App

___

### `Optional` style

• **style**? : *Pick‹[PaypalButtonStyleOptions](paypalbuttonstyleoptions.md), "layout" | "size" | "color" | "label" | "shape" | "tagline" | "fundingicons"›*

A set of styling options for the checkout button.

## Methods

### `Optional` onAuthorizeError

▸ **onAuthorizeError**(`error`: [StandardError](../classes/standarderror.md)): *void*

A callback that gets called if unable to authorize and tokenize payment.

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`error` | [StandardError](../classes/standarderror.md) | The error object describing the failure.  |

**Returns:** *void*

___

### `Optional` onPaymentError

▸ **onPaymentError**(`error`: [StandardError](../classes/standarderror.md)): *void*

A callback that gets called if unable to submit payment.

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`error` | [StandardError](../classes/standarderror.md) | The error object describing the failure.  |

**Returns:** *void*
