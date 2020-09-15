[@bigcommerce/checkout-sdk](../README.md) › [BraintreeError](braintreeerror.md)

# Interface: BraintreeError

## Hierarchy

* [Error](amazonpaywidgeterror.md#error)

  ↳ **BraintreeError**

## Index

### Properties

* [Error](braintreeerror.md#error)
* [code](braintreeerror.md#code)
* [message](braintreeerror.md#message)
* [name](braintreeerror.md#name)
* [stack](braintreeerror.md#optional-stack)
* [type](braintreeerror.md#type)

## Properties

###  Error

• **Error**: *ErrorConstructor*

___

###  code

• **code**: *string*

___

###  message

• **message**: *string*

*Overrides [AmazonPayWidgetError](amazonpaywidgeterror.md).[message](amazonpaywidgeterror.md#message)*

___

###  name

• **name**: *string*

*Inherited from [AmazonPayWidgetError](amazonpaywidgeterror.md).[name](amazonpaywidgeterror.md#name)*

___

### `Optional` stack

• **stack**? : *undefined | string*

*Inherited from [AmazonPayWidgetError](amazonpaywidgeterror.md).[stack](amazonpaywidgeterror.md#optional-stack)*

*Overrides [AmazonPayWidgetError](amazonpaywidgeterror.md).[stack](amazonpaywidgeterror.md#optional-stack)*

___

###  type

• **type**: *"CUSTOMER" | "MERCHANT" | "NETWORK" | "INTERNAL" | "UNKNOWN"*
