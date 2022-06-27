[@bigcommerce/checkout-sdk](../README.md) › [BraintreePaypalButtonInitializeOptions](braintreepaypalbuttoninitializeoptions.md)

# Interface: BraintreePaypalButtonInitializeOptions

## Hierarchy

* **BraintreePaypalButtonInitializeOptions**

## Index

### Properties

* [messagingContainerId](braintreepaypalbuttoninitializeoptions.md#optional-messagingcontainerid)
* [shippingAddress](braintreepaypalbuttoninitializeoptions.md#optional-shippingaddress)
* [style](braintreepaypalbuttoninitializeoptions.md#optional-style)

### Methods

* [onAuthorizeError](braintreepaypalbuttoninitializeoptions.md#optional-onauthorizeerror)
* [onError](braintreepaypalbuttoninitializeoptions.md#optional-onerror)
* [onPaymentError](braintreepaypalbuttoninitializeoptions.md#optional-onpaymenterror)

## Properties

### `Optional` messagingContainerId

• **messagingContainerId**? : *undefined | string*

The ID of a container which the messaging should be inserted.

___

### `Optional` shippingAddress

• **shippingAddress**? : *[Address](address.md) | null*

Address to be used for shipping.
If not provided, it will use the first saved address from the active customer.

___

### `Optional` style

• **style**? : *Pick‹[PaypalButtonStyleOptions](paypalbuttonstyleoptions.md), "layout" | "size" | "color" | "label" | "shape" | "tagline" | "fundingicons" | "height"›*

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

### `Optional` onError

▸ **onError**(`error`: [BraintreeError](braintreeerror.md) | [StandardError](../classes/standarderror.md)): *void*

A callback that gets called on any error instead of submit payment or authorization errors.

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
