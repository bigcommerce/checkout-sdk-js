[@bigcommerce/checkout-sdk](../README.md) / [<internal\>](../modules/internal_.md) / RequestError

# Class: RequestError<TBody\>

[<internal>](../modules/internal_.md).RequestError

Throw this error if we are unable to make a request to the server. It wraps
any server response into a JS error object.

## Type parameters

| Name | Type |
| :------ | :------ |
| `TBody` | `any` |

## Hierarchy

- [`StandardError`](internal_.StandardError.md)

  ↳ **`RequestError`**

## Table of contents

### Constructors

- [constructor](internal_.RequestError.md#constructor)

### Properties

- [body](internal_.RequestError.md#body)
- [errors](internal_.RequestError.md#errors)
- [headers](internal_.RequestError.md#headers)
- [name](internal_.RequestError.md#name)
- [status](internal_.RequestError.md#status)
- [type](internal_.RequestError.md#type)

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

[StandardError](internal_.StandardError.md).[constructor](internal_.StandardError.md#constructor)

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

[StandardError](internal_.StandardError.md).[name](internal_.StandardError.md#name)

___

### status

• **status**: `number`

___

### type

• **type**: `string`

#### Inherited from

[StandardError](internal_.StandardError.md).[type](internal_.StandardError.md#type)
