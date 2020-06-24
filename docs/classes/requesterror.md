[@bigcommerce/checkout-sdk](../README.md) › [RequestError](requesterror.md)

# Class: RequestError ‹**TBody**›

Throw this error if we are unable to make a request to the server. It wraps
any server response into a JS error object.

## Type parameters

▪ **TBody**

## Hierarchy

  ↳ [StandardError](standarderror.md)

  ↳ **RequestError**

## Implements

* [CustomError](../interfaces/customerror.md)

## Index

### Constructors

* [constructor](requesterror.md#constructor)

### Properties

* [body](requesterror.md#body)
* [errors](requesterror.md#errors)
* [headers](requesterror.md#headers)
* [message](requesterror.md#message)
* [name](requesterror.md#name)
* [stack](requesterror.md#optional-stack)
* [status](requesterror.md#status)
* [type](requesterror.md#type)

## Constructors

###  constructor

\+ **new RequestError**(`response?`: Response‹TBody | object›, `__namedParameters?`: object): *[RequestError](requesterror.md)*

*Overrides [StandardError](standarderror.md).[constructor](standarderror.md#constructor)*

**Parameters:**

▪`Optional`  **response**: *Response‹TBody | object›*

▪`Optional`  **__namedParameters**: *object*

Name | Type |
------ | ------ |
`errors` | undefined &#124; object[] |
`message` | undefined &#124; string |

**Returns:** *[RequestError](requesterror.md)*

## Properties

###  body

• **body**: *TBody | object*

___

###  errors

• **errors**: *Array‹object›*

___

###  headers

• **headers**: *object*

#### Type declaration:

* \[ **key**: *string*\]: any

___

###  message

• **message**: *string*

*Implementation of [CustomError](../interfaces/customerror.md).[message](../interfaces/customerror.md#message)*

*Inherited from [AmazonPayWidgetError](../interfaces/amazonpaywidgeterror.md).[message](../interfaces/amazonpaywidgeterror.md#message)*

___

###  name

• **name**: *string*

*Implementation of [CustomError](../interfaces/customerror.md).[name](../interfaces/customerror.md#name)*

*Inherited from [RequestError](requesterror.md).[name](requesterror.md#name)*

*Overrides [AmazonPayWidgetError](../interfaces/amazonpaywidgeterror.md).[name](../interfaces/amazonpaywidgeterror.md#name)*

___

### `Optional` stack

• **stack**? : *undefined | string*

*Implementation of [CustomError](../interfaces/customerror.md).[stack](../interfaces/customerror.md#optional-stack)*

*Inherited from [AmazonPayWidgetError](../interfaces/amazonpaywidgeterror.md).[stack](../interfaces/amazonpaywidgeterror.md#optional-stack)*

___

###  status

• **status**: *number*

___

###  type

• **type**: *string*

*Implementation of [CustomError](../interfaces/customerror.md).[type](../interfaces/customerror.md#type)*

*Inherited from [RequestError](requesterror.md).[type](requesterror.md#type)*
