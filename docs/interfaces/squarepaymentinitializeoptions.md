[@bigcommerce/checkout-sdk](../README.md) > [SquarePaymentInitializeOptions](../interfaces/squarepaymentinitializeoptions.md)

# SquarePaymentInitializeOptions

A set of options that are required to initialize the Square payment method.

Once Square payment is initialized, credit card form fields, provided by the payment provider as iframes, will be inserted into the current page. These options provide a location and styling for each of the form fields.

## Hierarchy

**SquarePaymentInitializeOptions**

## Index

### Properties

* [cardNumber](squarepaymentinitializeoptions.md#cardnumber)
* [cvv](squarepaymentinitializeoptions.md#cvv)
* [expirationDate](squarepaymentinitializeoptions.md#expirationdate)
* [inputClass](squarepaymentinitializeoptions.md#inputclass)
* [inputStyles](squarepaymentinitializeoptions.md#inputstyles)
* [postalCode](squarepaymentinitializeoptions.md#postalcode)

---

## Properties

<a id="cardnumber"></a>

###  cardNumber

**● cardNumber**: *[SquareFormElement](squareformelement.md)*

The location to insert the credit card number form field.

___
<a id="cvv"></a>

###  cvv

**● cvv**: *[SquareFormElement](squareformelement.md)*

The location to insert the CVV form field.

___
<a id="expirationdate"></a>

###  expirationDate

**● expirationDate**: *[SquareFormElement](squareformelement.md)*

The location to insert the expiration date form field.

___
<a id="inputclass"></a>

### `<Optional>` inputClass

**● inputClass**: * `undefined` &#124; `string`
*

The CSS class to apply to all form fields.

___
<a id="inputstyles"></a>

### `<Optional>` inputStyles

**● inputStyles**: *`Array`<`object`>*

The set of CSS styles to apply to all form fields.

___
<a id="postalcode"></a>

###  postalCode

**● postalCode**: *[SquareFormElement](squareformelement.md)*

The location to insert the postal code form field.

___

