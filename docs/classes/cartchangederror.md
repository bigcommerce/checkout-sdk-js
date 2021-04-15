[@bigcommerce/checkout-sdk](../README.md) › [CartChangedError](cartchangederror.md)

# Class: CartChangedError

## Hierarchy

  ↳ [StandardError](standarderror.md)

  ↳ **CartChangedError**

## Implements

* [CustomError](../interfaces/customerror.md)

## Index

### Constructors

* [constructor](cartchangederror.md#constructor)

### Properties

* [data](cartchangederror.md#data)
* [message](cartchangederror.md#message)
* [name](cartchangederror.md#name)
* [stack](cartchangederror.md#optional-stack)
* [type](cartchangederror.md#type)

## Constructors

###  constructor

\+ **new CartChangedError**(`previous`: [ComparableCheckout](../README.md#comparablecheckout), `updated`: [ComparableCheckout](../README.md#comparablecheckout)): *[CartChangedError](cartchangederror.md)*

*Overrides [StandardError](standarderror.md).[constructor](standarderror.md#constructor)*

**Parameters:**

Name | Type |
------ | ------ |
`previous` | [ComparableCheckout](../README.md#comparablecheckout) |
`updated` | [ComparableCheckout](../README.md#comparablecheckout) |

**Returns:** *[CartChangedError](cartchangederror.md)*

## Properties

###  data

• **data**: *object*

**`alpha`** 
Please note that this option is currently in an early stage of
development. Therefore the API is unstable and not ready for public
consumption.

#### Type declaration:

* **previous**: *[ComparableCheckout](../README.md#comparablecheckout)*

* **updated**: *[ComparableCheckout](../README.md#comparablecheckout)*

___

###  message

• **message**: *string*

*Implementation of [CustomError](../interfaces/customerror.md).[message](../interfaces/customerror.md#message)*

*Inherited from [AmazonPayWidgetError](../interfaces/amazonpaywidgeterror.md).[message](../interfaces/amazonpaywidgeterror.md#message)*

___

###  name

• **name**: *string*

*Implementation of [CustomError](../interfaces/customerror.md).[name](../interfaces/customerror.md#name)*

*Inherited from [CartChangedError](cartchangederror.md).[name](cartchangederror.md#name)*

*Overrides [AmazonPayWidgetError](../interfaces/amazonpaywidgeterror.md).[name](../interfaces/amazonpaywidgeterror.md#name)*

___

### `Optional` stack

• **stack**? : *undefined | string*

*Implementation of [CustomError](../interfaces/customerror.md).[stack](../interfaces/customerror.md#optional-stack)*

*Inherited from [AmazonPayWidgetError](../interfaces/amazonpaywidgeterror.md).[stack](../interfaces/amazonpaywidgeterror.md#optional-stack)*

___

###  type

• **type**: *string*

*Implementation of [CustomError](../interfaces/customerror.md).[type](../interfaces/customerror.md#type)*

*Inherited from [CartChangedError](cartchangederror.md).[type](cartchangederror.md#type)*
