[@bigcommerce/checkout-sdk](../README.md) / PaypalCommerceFormOptions

# Interface: PaypalCommerceFormOptions

## Table of contents

### Properties

- [fields](PaypalCommerceFormOptions.md#fields)
- [styles](PaypalCommerceFormOptions.md#styles)

### Methods

- [onBlur](PaypalCommerceFormOptions.md#onblur)
- [onCardTypeChange](PaypalCommerceFormOptions.md#oncardtypechange)
- [onEnter](PaypalCommerceFormOptions.md#onenter)
- [onFocus](PaypalCommerceFormOptions.md#onfocus)
- [onValidate](PaypalCommerceFormOptions.md#onvalidate)

## Properties

### fields

• **fields**: [`PaypalCommerceFormFieldsMap`](PaypalCommerceFormFieldsMap.md) \| [`PaypalCommerceStoredCardFieldsMap`](PaypalCommerceStoredCardFieldsMap.md)

Containers for fields can be to present in one set of values

```js
{ cardNumber: { containerId: 'card-number' },
  cardName: { containerId: 'card-name' },
  cardExpiry: { containerId: 'card-expiry' },
  cardCode: { containerId: 'card-code' }, }
```

  Or in another set of values.

```js
{ cardCodeVerification: { containerId: 'card-number' },
  cardNumberVerification: { containerId: 'card-name' }, }
```

___

### styles

• `Optional` **styles**: [`PaypalCommerceFormFieldStylesMap`](PaypalCommerceFormFieldStylesMap.md)

Styles for inputs. Change the width, height and other styling.

```js
 default: { color: '#000' },
 error: { color: '#f00' },
 focus: { color: '#0f0' }
```

## Methods

### onBlur

▸ `Optional` **onBlur**(`data`): `void`

A callback that gets called when a field loses focus.

#### Parameters

| Name | Type |
| :------ | :------ |
| `data` | [`PaypalCommerceFormFieldKeyboardEventData`](PaypalCommerceFormFieldKeyboardEventData.md) |

#### Returns

`void`

___

### onCardTypeChange

▸ `Optional` **onCardTypeChange**(`data`): `void`

A callback that gets called when activity within
the number field has changed such that the possible
card type has changed.

#### Parameters

| Name | Type |
| :------ | :------ |
| `data` | [`PaypalCommerceFormFieldCardTypeChangeEventData`](PaypalCommerceFormFieldCardTypeChangeEventData.md) |

#### Returns

`void`

___

### onEnter

▸ `Optional` **onEnter**(`data`): `void`

A callback that gets called when the user requests submission
of an input field, by pressing the Enter or Return key
on their keyboard, or mobile equivalent.

#### Parameters

| Name | Type |
| :------ | :------ |
| `data` | [`PaypalCommerceFormFieldKeyboardEventData`](PaypalCommerceFormFieldKeyboardEventData.md) |

#### Returns

`void`

___

### onFocus

▸ `Optional` **onFocus**(`data`): `void`

A callback that gets called when a field gains focus.

#### Parameters

| Name | Type |
| :------ | :------ |
| `data` | [`PaypalCommerceFormFieldKeyboardEventData`](PaypalCommerceFormFieldKeyboardEventData.md) |

#### Returns

`void`

___

### onValidate

▸ `Optional` **onValidate**(`data`): `void`

A callback that gets called when the validity of a field has changed.

#### Parameters

| Name | Type |
| :------ | :------ |
| `data` | [`PaypalCommerceFormFieldValidateEventData`](PaypalCommerceFormFieldValidateEventData.md) |

#### Returns

`void`
