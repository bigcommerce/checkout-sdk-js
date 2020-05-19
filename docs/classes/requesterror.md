[@bigcommerce/checkout-sdk](../README.md) > [RequestError](../classes/requesterror.md)

# RequestError

## Type parameters

#### TBody 
## Hierarchy

↳  [StandardError](standarderror.md)

**↳ RequestError**

## Implements

* [CustomError](../interfaces/customerror.md)

## Index

### Properties

* [body](requesterror.md#body)
* [errors](requesterror.md#errors)
* [headers](requesterror.md#headers)
* [message](requesterror.md#message)
* [name](requesterror.md#name)
* [stack](requesterror.md#stack)
* [status](requesterror.md#status)
* [type](requesterror.md#type)

---

## Constructors

<a id="constructor"></a>

###  constructor

⊕ **new RequestError**(response?: *`Response`< `TBody` &#124; `__type`>*, __namedParameters?: *`object`*): [RequestError](requesterror.md)

**Parameters:**

| Param | Type |
| ------ | ------ |
| `Optional` response | `Response`< `TBody` &#124; `__type`> |
| `Optional` __namedParameters | `object` |

**Returns:** [RequestError](requesterror.md)

___

## Properties

<a id="body"></a>

###  body

**● body**: * `TBody` &#124; `__type`
*

___
<a id="errors"></a>

###  errors

**● errors**: *`Array`<`object`>*

___
<a id="headers"></a>

###  headers

**● headers**: *`object`*

#### Type declaration

[key: `string`]: `any`

___
<a id="message"></a>

###  message

**● message**: *`string`*

___
<a id="name"></a>

###  name

**● name**: *`string`*

___
<a id="stack"></a>

### `<Optional>` stack

**● stack**: * `undefined` &#124; `string`
*

___
<a id="status"></a>

###  status

**● status**: *`number`*

___
<a id="type"></a>

###  type

**● type**: *`string`*

___

