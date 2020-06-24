[@bigcommerce/checkout-sdk](../README.md) › [SquarePaymentInitializeOptions](squarepaymentinitializeoptions.md)

# Interface: SquarePaymentInitializeOptions

A set of options that are required to initialize the Square payment method.

Once Square payment is initialized, credit card form fields, provided by the
payment provider as iframes, will be inserted into the current page. These
options provide a location and styling for each of the form fields.

## Hierarchy

* **SquarePaymentInitializeOptions**

## Index

### Properties

* [cardNumber](squarepaymentinitializeoptions.md#cardnumber)
* [cvv](squarepaymentinitializeoptions.md#cvv)
* [expirationDate](squarepaymentinitializeoptions.md#expirationdate)
* [inputClass](squarepaymentinitializeoptions.md#optional-inputclass)
* [inputStyles](squarepaymentinitializeoptions.md#optional-inputstyles)
* [masterpass](squarepaymentinitializeoptions.md#optional-masterpass)
* [postalCode](squarepaymentinitializeoptions.md#postalcode)

### Methods

* [onError](squarepaymentinitializeoptions.md#optional-onerror)
* [onPaymentSelect](squarepaymentinitializeoptions.md#optional-onpaymentselect)

## Properties

###  cardNumber

• **cardNumber**: *[SquareFormElement](squareformelement.md)*

The location to insert the credit card number form field.

___

###  cvv

• **cvv**: *[SquareFormElement](squareformelement.md)*

The location to insert the CVV form field.

___

###  expirationDate

• **expirationDate**: *[SquareFormElement](squareformelement.md)*

The location to insert the expiration date form field.

___

### `Optional` inputClass

• **inputClass**? : *undefined | string*

The CSS class to apply to all form fields.

___

### `Optional` inputStyles

• **inputStyles**? : *Array‹object›*

The set of CSS styles to apply to all form fields.

___

### `Optional` masterpass

• **masterpass**? : *[SquareFormElement](squareformelement.md)*

Initialize Masterpass placeholder ID

___

###  postalCode

• **postalCode**: *[SquareFormElement](squareformelement.md)*

The location to insert the postal code form field.

## Methods

### `Optional` onError

▸ **onError**(`errors?`: [NonceGenerationError](noncegenerationerror.md)[]): *void*

A callback that gets called when an error occurs in the card nonce generation

**Parameters:**

Name | Type |
------ | ------ |
`errors?` | [NonceGenerationError](noncegenerationerror.md)[] |

**Returns:** *void*

___

### `Optional` onPaymentSelect

▸ **onPaymentSelect**(): *void*

A callback that gets called when the customer selects a payment option.

**Returns:** *void*
