[@bigcommerce/checkout-sdk](../README.md) / BraintreeFormOptions

# Interface: BraintreeFormOptions

## Table of contents

### Properties

- [fields](BraintreeFormOptions.md#fields)
- [styles](BraintreeFormOptions.md#styles)

### Methods

- [onBlur](BraintreeFormOptions.md#onblur)
- [onCardTypeChange](BraintreeFormOptions.md#oncardtypechange)
- [onEnter](BraintreeFormOptions.md#onenter)
- [onFocus](BraintreeFormOptions.md#onfocus)
- [onValidate](BraintreeFormOptions.md#onvalidate)

## Properties

### fields

• **fields**: [`BraintreeFormFieldsMap`](BraintreeFormFieldsMap.md) \| [`BraintreeStoredCardFieldsMap`](BraintreeStoredCardFieldsMap.md)

___

### styles

• `Optional` **styles**: [`BraintreeFormFieldStylesMap`](BraintreeFormFieldStylesMap.md)

## Methods

### onBlur

▸ `Optional` **onBlur**(`data`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `data` | [`BraintreeFormFieldKeyboardEventData`](BraintreeFormFieldKeyboardEventData.md) |

#### Returns

`void`

___

### onCardTypeChange

▸ `Optional` **onCardTypeChange**(`data`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `data` | [`BraintreeFormFieldCardTypeChangeEventData`](BraintreeFormFieldCardTypeChangeEventData.md) |

#### Returns

`void`

___

### onEnter

▸ `Optional` **onEnter**(`data`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `data` | [`BraintreeFormFieldKeyboardEventData`](BraintreeFormFieldKeyboardEventData.md) |

#### Returns

`void`

___

### onFocus

▸ `Optional` **onFocus**(`data`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `data` | [`BraintreeFormFieldKeyboardEventData`](BraintreeFormFieldKeyboardEventData.md) |

#### Returns

`void`

___

### onValidate

▸ `Optional` **onValidate**(`data`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `data` | [`BraintreeFormFieldValidateEventData`](BraintreeFormFieldValidateEventData.md) |

#### Returns

`void`
