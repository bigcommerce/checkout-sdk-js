[@bigcommerce/checkout-sdk](../README.md) / LegacyHostedFormOptions

# Interface: LegacyHostedFormOptions

## Table of contents

### Properties

- [fields](LegacyHostedFormOptions.md#fields)
- [styles](LegacyHostedFormOptions.md#styles)

### Methods

- [onBlur](LegacyHostedFormOptions.md#onblur)
- [onCardTypeChange](LegacyHostedFormOptions.md#oncardtypechange)
- [onEnter](LegacyHostedFormOptions.md#onenter)
- [onFocus](LegacyHostedFormOptions.md#onfocus)
- [onValidate](LegacyHostedFormOptions.md#onvalidate)

## Properties

### fields

• **fields**: [`HostedFieldOptionsMap`](../README.md#hostedfieldoptionsmap)

___

### styles

• `Optional` **styles**: [`HostedFieldStylesMap`](HostedFieldStylesMap.md)

## Methods

### onBlur

▸ **onBlur**(`data`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `data` | `Object` |
| `data.errors?` | `Partial`\<`Record`\<[`HostedFormErrorDataKeys`](../README.md#hostedformerrordatakeys), [`HostedFormErrorData`](HostedFormErrorData.md)\>\> |
| `data.fieldType` | [`HostedFieldType`](../enums/HostedFieldType.md) |

#### Returns

`void`

___

### onCardTypeChange

▸ **onCardTypeChange**(`data`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `data` | `Object` |
| `data.cardType?` | `string` |

#### Returns

`void`

___

### onEnter

▸ **onEnter**(`data`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `data` | `Object` |
| `data.fieldType` | [`HostedFieldType`](../enums/HostedFieldType.md) |

#### Returns

`void`

___

### onFocus

▸ **onFocus**(`data`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `data` | `Object` |
| `data.fieldType` | [`HostedFieldType`](../enums/HostedFieldType.md) |

#### Returns

`void`

___

### onValidate

▸ **onValidate**(`data`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `data` | [`HostedInputValidateResults`](HostedInputValidateResults.md) |

#### Returns

`void`
