[**@bigcommerce/checkout-sdk**](../README.md)

***

[@bigcommerce/checkout-sdk](../README.md) / RequestError

# Class: RequestError\<TBody\>

Throw this error if we are unable to make a request to the server. It wraps
any server response into a JS error object.

## Extends

- [`StandardError`](StandardError.md)

## Type Parameters

### TBody

`TBody` = `any`

## Constructors

### Constructor

> **new RequestError**\<`TBody`\>(`response?`, `__namedParameters?`): `RequestError`\<`TBody`\>

#### Parameters

##### response?

`Response`\<`object` \| `TBody`\>

##### \_\_namedParameters?

###### errors?

`object`[]

###### message?

`string`

#### Returns

`RequestError`\<`TBody`\>

#### Overrides

[`StandardError`](StandardError.md).[`constructor`](StandardError.md#constructor)

## Properties

### body

> **body**: `object` \| `TBody`

***

### errors

> **errors**: `object`[]

#### code

> **code**: `string`

#### message?

> `optional` **message?**: `string`

***

### headers

> **headers**: `object`

#### Index Signature

\[`key`: `string`\]: `any`

***

### name

> **name**: `string`

#### Inherited from

[`StandardError`](StandardError.md).[`name`](StandardError.md#name)

***

### status

> **status**: `number`

***

### type

> **type**: `string`

#### Inherited from

[`StandardError`](StandardError.md).[`type`](StandardError.md#type)
