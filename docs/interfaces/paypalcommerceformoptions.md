[@bigcommerce/checkout-sdk](../README.md) › [PaypalCommerceFormOptions](paypalcommerceformoptions.md)

# Interface: PaypalCommerceFormOptions

## Hierarchy

* **PaypalCommerceFormOptions**

## Index

### Properties

* [fields](paypalcommerceformoptions.md#fields)
* [styles](paypalcommerceformoptions.md#optional-styles)

### Methods

* [onBlur](paypalcommerceformoptions.md#optional-onblur)
* [onCardTypeChange](paypalcommerceformoptions.md#optional-oncardtypechange)
* [onEnter](paypalcommerceformoptions.md#optional-onenter)
* [onFocus](paypalcommerceformoptions.md#optional-onfocus)
* [onValidate](paypalcommerceformoptions.md#optional-onvalidate)

## Properties

###  fields

• **fields**: *[PaypalCommerceFormFieldsMap](paypalcommerceformfieldsmap.md) | [PaypalCommerceStoredCardFieldsMap](paypalcommercestoredcardfieldsmap.md)*

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

### `Optional` styles

• **styles**? : *[PaypalCommerceFormFieldStylesMap](paypalcommerceformfieldstylesmap.md)*

Styles for inputs. Change the width, height and other styling.

```js
 default: { color: '#000' },
 error: { color: '#f00' },
 focus: { color: '#0f0' }
```

## Methods

### `Optional` onBlur

▸ **onBlur**(`data`: [PaypalCommerceFormFieldBlurEventData](../README.md#paypalcommerceformfieldblureventdata)): *void*

A callback that gets called when a field loses focus.

**Parameters:**

Name | Type |
------ | ------ |
`data` | [PaypalCommerceFormFieldBlurEventData](../README.md#paypalcommerceformfieldblureventdata) |

**Returns:** *void*

___

### `Optional` onCardTypeChange

▸ **onCardTypeChange**(`data`: [PaypalCommerceFormFieldCardTypeChangeEventData](paypalcommerceformfieldcardtypechangeeventdata.md)): *void*

A callback that gets called when activity within
the number field has changed such that the possible
card type has changed.

**Parameters:**

Name | Type |
------ | ------ |
`data` | [PaypalCommerceFormFieldCardTypeChangeEventData](paypalcommerceformfieldcardtypechangeeventdata.md) |

**Returns:** *void*

___

### `Optional` onEnter

▸ **onEnter**(`data`: [PaypalCommerceFormFieldEnterEventData](../README.md#paypalcommerceformfieldentereventdata)): *void*

A callback that gets called when the user requests submission
of an input field, by pressing the Enter or Return key
on their keyboard, or mobile equivalent.

**Parameters:**

Name | Type |
------ | ------ |
`data` | [PaypalCommerceFormFieldEnterEventData](../README.md#paypalcommerceformfieldentereventdata) |

**Returns:** *void*

___

### `Optional` onFocus

▸ **onFocus**(`data`: [PaypalCommerceFormFieldFocusEventData](../README.md#paypalcommerceformfieldfocuseventdata)): *void*

A callback that gets called when a field gains focus.

**Parameters:**

Name | Type |
------ | ------ |
`data` | [PaypalCommerceFormFieldFocusEventData](../README.md#paypalcommerceformfieldfocuseventdata) |

**Returns:** *void*

___

### `Optional` onValidate

▸ **onValidate**(`data`: [PaypalCommerceFormFieldValidateEventData](paypalcommerceformfieldvalidateeventdata.md)): *void*

A callback that gets called when the validity of a field has changed.

**Parameters:**

Name | Type |
------ | ------ |
`data` | [PaypalCommerceFormFieldValidateEventData](paypalcommerceformfieldvalidateeventdata.md) |

**Returns:** *void*
