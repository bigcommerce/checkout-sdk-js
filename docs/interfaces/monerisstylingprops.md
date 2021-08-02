[@bigcommerce/checkout-sdk](../README.md) › [MonerisStylingProps](monerisstylingprops.md)

# Interface: MonerisStylingProps

A set of stringified CSS to apply to Moneris' IFrame fields.
CSS attributes should be converted to string.
Please note that ClassNames are not supported.

IE:
```js
{
     cssBody: 'background:white;';
     cssTextbox: 'border-width:2px;';
     cssTextboxCardNumber: 'width:140px;';
     cssTextboxExpiryDate: 'width:40px;';
     cssTextboxCVV: 'width:40px;';
}
```

When using several attributes use semicolon to separate each one.
IE: 'background:white;width:40px;'

## Hierarchy

* **MonerisStylingProps**

## Index

### Properties

* [cssBody](monerisstylingprops.md#optional-cssbody)
* [cssTextbox](monerisstylingprops.md#optional-csstextbox)
* [cssTextboxCVV](monerisstylingprops.md#optional-csstextboxcvv)
* [cssTextboxCardNumber](monerisstylingprops.md#optional-csstextboxcardnumber)
* [cssTextboxExpiryDate](monerisstylingprops.md#optional-csstextboxexpirydate)

## Properties

### `Optional` cssBody

• **cssBody**? : *undefined | string*

Stringified CSS to apply to the body of the IFrame.

___

### `Optional` cssTextbox

• **cssTextbox**? : *undefined | string*

Stringified CSS to apply to each of input fields.

___

### `Optional` cssTextboxCVV

• **cssTextboxCVV**? : *undefined | string*

Stringified CSS to apply to the card's CVV field.

___

### `Optional` cssTextboxCardNumber

• **cssTextboxCardNumber**? : *undefined | string*

Stringified CSS to apply to the card's number field.

___

### `Optional` cssTextboxExpiryDate

• **cssTextboxExpiryDate**? : *undefined | string*

Stringified CSS to apply to the card's expiry field.
