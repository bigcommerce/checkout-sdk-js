[@bigcommerce/checkout-sdk](../README.md) / HostedFormOptions

# Interface: HostedFormOptions

## Table of contents

### Properties

- [fields](HostedFormOptions.md#fields)
- [styles](HostedFormOptions.md#styles)

### Methods

- [onBlur](HostedFormOptions.md#onblur)
- [onCardTypeChange](HostedFormOptions.md#oncardtypechange)
- [onEnter](HostedFormOptions.md#onenter)
- [onFocus](HostedFormOptions.md#onfocus)
- [onValidate](HostedFormOptions.md#onvalidate)

## Properties

### fields

• **fields**: [`HostedFieldOptionsMap`](../README.md#hostedfieldoptionsmap)

___

### styles

• `Optional` **styles**: [`HostedFieldStylesMap`](HostedFieldStylesMap.md)

## Methods

### onBlur

▸ `Optional` **onBlur**(`data`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `data` | `Object` |
| `data.errors?` | `Partial`<`Record`<[`BraintreeFormErrorDataKeys`](../README.md#braintreeformerrordatakeys), [`HostedFormErrorData`](HostedFormErrorData.md)\>\> |
| `data.fieldType` | [`HostedFieldType`](../enums/HostedFieldType.md) |

#### Returns

`void`

___

### onCardTypeChange

▸ `Optional` **onCardTypeChange**(`data`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `data` | `Object` |
| `data.cardType?` | `string` |

#### Returns

`void`

___

### onEnter

▸ `Optional` **onEnter**(`data`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `data` | `Object` |
| `data.fieldType` | [`HostedFieldType`](../enums/HostedFieldType.md) |

#### Returns

`void`

___

### onFocus

▸ `Optional` **onFocus**(`data`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `data` | `Object` |
| `data.fieldType` | [`HostedFieldType`](../enums/HostedFieldType.md) |

#### Returns

`void`

___

### onValidate

▸ `Optional` **onValidate**(`data`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `data` | [`HostedInputValidateResults`](HostedInputValidateResults.md) |

#### Returns

`void`
