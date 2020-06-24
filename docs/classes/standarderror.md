[@bigcommerce/checkout-sdk](../README.md) › [StandardError](standarderror.md)

# Class: StandardError

This error type should not be constructed directly. It is a base class for
all custom errors thrown in this library.

## Hierarchy

* [Error](../interfaces/amazonpaywidgeterror.md#error)

  ↳ **StandardError**

  ↳ [RequestError](requesterror.md)

## Implements

* [CustomError](../interfaces/customerror.md)

## Index

### Constructors

* [constructor](standarderror.md#constructor)

### Properties

* [message](standarderror.md#message)
* [name](standarderror.md#name)
* [stack](standarderror.md#optional-stack)
* [type](standarderror.md#type)
* [Error](standarderror.md#static-error)

## Constructors

###  constructor

\+ **new StandardError**(`message?`: undefined | string): *[StandardError](standarderror.md)*

**Parameters:**

Name | Type |
------ | ------ |
`message?` | undefined &#124; string |

**Returns:** *[StandardError](standarderror.md)*

## Properties

###  message

• **message**: *string*

*Implementation of [CustomError](../interfaces/customerror.md).[message](../interfaces/customerror.md#message)*

*Inherited from [AmazonPayWidgetError](../interfaces/amazonpaywidgeterror.md).[message](../interfaces/amazonpaywidgeterror.md#message)*

___

###  name

• **name**: *string*

*Implementation of [CustomError](../interfaces/customerror.md).[name](../interfaces/customerror.md#name)*

*Overrides [AmazonPayWidgetError](../interfaces/amazonpaywidgeterror.md).[name](../interfaces/amazonpaywidgeterror.md#name)*

___

### `Optional` stack

• **stack**? : *undefined | string*

*Implementation of [CustomError](../interfaces/customerror.md).[stack](../interfaces/customerror.md#optional-stack)*

*Inherited from [AmazonPayWidgetError](../interfaces/amazonpaywidgeterror.md).[stack](../interfaces/amazonpaywidgeterror.md#optional-stack)*

*Overrides [AmazonPayWidgetError](../interfaces/amazonpaywidgeterror.md).[stack](../interfaces/amazonpaywidgeterror.md#optional-stack)*

___

###  type

• **type**: *string*

*Implementation of [CustomError](../interfaces/customerror.md).[type](../interfaces/customerror.md#type)*

___

### `Static` Error

▪ **Error**: *ErrorConstructor*
