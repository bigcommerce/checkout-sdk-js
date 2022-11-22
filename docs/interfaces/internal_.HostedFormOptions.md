[@bigcommerce/checkout-sdk](../README.md) / [<internal\>](../modules/internal_.md) / HostedFormOptions

# Interface: HostedFormOptions

[<internal>](../modules/internal_.md).HostedFormOptions

## Table of contents

### Properties

- [fields](internal_.HostedFormOptions.md#fields)
- [styles](internal_.HostedFormOptions.md#styles)

### Methods

- [onBlur](internal_.HostedFormOptions.md#onblur)
- [onCardTypeChange](internal_.HostedFormOptions.md#oncardtypechange)
- [onEnter](internal_.HostedFormOptions.md#onenter)
- [onFocus](internal_.HostedFormOptions.md#onfocus)
- [onValidate](internal_.HostedFormOptions.md#onvalidate)

## Properties

### fields

• **fields**: [`HostedFieldOptionsMap`](../modules/internal_.md#hostedfieldoptionsmap)

___

### styles

• `Optional` **styles**: [`HostedFieldStylesMap`](internal_.HostedFieldStylesMap.md)

## Methods

### onBlur

▸ `Optional` **onBlur**(`data`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `data` | `Object` |
| `data.fieldType` | [`HostedFieldType`](../enums/internal_.HostedFieldType.md) |

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
| `data.fieldType` | [`HostedFieldType`](../enums/internal_.HostedFieldType.md) |

#### Returns

`void`

___

### onFocus

▸ `Optional` **onFocus**(`data`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `data` | `Object` |
| `data.fieldType` | [`HostedFieldType`](../enums/internal_.HostedFieldType.md) |

#### Returns

`void`

___

### onValidate

▸ `Optional` **onValidate**(`data`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `data` | [`HostedInputValidateResults`](internal_.HostedInputValidateResults.md) |

#### Returns

`void`
