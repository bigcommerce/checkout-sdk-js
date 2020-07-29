[@bigcommerce/checkout-sdk](../README.md) › [BraintreeFormOptions](braintreeformoptions.md)

# Interface: BraintreeFormOptions

## Hierarchy

* **BraintreeFormOptions**

## Index

### Properties

* [fields](braintreeformoptions.md#fields)
* [styles](braintreeformoptions.md#optional-styles)

### Methods

* [onBlur](braintreeformoptions.md#optional-onblur)
* [onCardTypeChange](braintreeformoptions.md#optional-oncardtypechange)
* [onEnter](braintreeformoptions.md#optional-onenter)
* [onFocus](braintreeformoptions.md#optional-onfocus)
* [onValidate](braintreeformoptions.md#optional-onvalidate)

## Properties

###  fields

• **fields**: *[BraintreeFormFieldsMap](braintreeformfieldsmap.md) | [BraintreeStoredCardFieldsMap](braintreestoredcardfieldsmap.md)*

___

### `Optional` styles

• **styles**? : *[BraintreeFormFieldStylesMap](braintreeformfieldstylesmap.md)*

## Methods

### `Optional` onBlur

▸ **onBlur**(`data`: [BraintreeFormFieldBlurEventData](../README.md#braintreeformfieldblureventdata)): *void*

**Parameters:**

Name | Type |
------ | ------ |
`data` | [BraintreeFormFieldBlurEventData](../README.md#braintreeformfieldblureventdata) |

**Returns:** *void*

___

### `Optional` onCardTypeChange

▸ **onCardTypeChange**(`data`: [BraintreeFormFieldCardTypeChangeEventData](braintreeformfieldcardtypechangeeventdata.md)): *void*

**Parameters:**

Name | Type |
------ | ------ |
`data` | [BraintreeFormFieldCardTypeChangeEventData](braintreeformfieldcardtypechangeeventdata.md) |

**Returns:** *void*

___

### `Optional` onEnter

▸ **onEnter**(`data`: [BraintreeFormFieldEnterEventData](../README.md#braintreeformfieldentereventdata)): *void*

**Parameters:**

Name | Type |
------ | ------ |
`data` | [BraintreeFormFieldEnterEventData](../README.md#braintreeformfieldentereventdata) |

**Returns:** *void*

___

### `Optional` onFocus

▸ **onFocus**(`data`: [BraintreeFormFieldFocusEventData](../README.md#braintreeformfieldfocuseventdata)): *void*

**Parameters:**

Name | Type |
------ | ------ |
`data` | [BraintreeFormFieldFocusEventData](../README.md#braintreeformfieldfocuseventdata) |

**Returns:** *void*

___

### `Optional` onValidate

▸ **onValidate**(`data`: [BraintreeFormFieldValidateEventData](braintreeformfieldvalidateeventdata.md)): *void*

**Parameters:**

Name | Type |
------ | ------ |
`data` | [BraintreeFormFieldValidateEventData](braintreeformfieldvalidateeventdata.md) |

**Returns:** *void*
