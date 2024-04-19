[@bigcommerce/checkout-sdk](../README.md) / RequestError

# Class: RequestError<TBody\>

Throw this error if we are unable to make a request to the server. It wraps
any server response into a JS error object.

## Type parameters

| Name | Type |
| :------ | :------ |
| `TBody` | `any` |

## Hierarchy

- [`StandardError`](StandardError.md)

  ↳ **`RequestError`**

## Table of contents

### Constructors

- [constructor](RequestError.md#constructor)

### Properties

- [body](RequestError.md#body)
- [errors](RequestError.md#errors)
- [headers](RequestError.md#headers)
- [name](RequestError.md#name)
- [status](RequestError.md#status)
- [type](RequestError.md#type)

## Constructors

### constructor

• **new RequestError**<`TBody`\>(`response?`, `__namedParameters?`)

#### Type parameters

| Name | Type |
| :------ | :------ |
| `TBody` | `any` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `response?` | `default`<{} \| `TBody`\> |
| `__namedParameters?` | `Object` |
| `__namedParameters.errors?` | { `code`: `string` ; `message?`: `string`  }[] |
| `__namedParameters.message?` | `string` |

#### Overrides

[StandardError](StandardError.md).[constructor](StandardError.md#constructor)

## Properties

### body

• **body**: {} \| `TBody`

___

### errors

• **errors**: { `code`: `string` ; `message?`: `string`  }[]

___

### headers

• **headers**: `Object`

#### Index signature

▪ [key: `string`]: `any`

___

### name

• **name**: `string`

#### Inherited from

[StandardError](StandardError.md).[name](StandardError.md#name)

___

### status

• **status**: `number`

___

### type

• **type**: `string`

#### Inherited from

[StandardError](StandardError.md).[type](StandardError.md#type)
