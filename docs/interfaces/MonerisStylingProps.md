[@bigcommerce/checkout-sdk](../README.md) / MonerisStylingProps

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

## Table of contents

### Properties

- [cssBody](MonerisStylingProps.md#cssbody)
- [cssInputLabel](MonerisStylingProps.md#cssinputlabel)
- [cssTextbox](MonerisStylingProps.md#csstextbox)
- [cssTextboxCVV](MonerisStylingProps.md#csstextboxcvv)
- [cssTextboxCardNumber](MonerisStylingProps.md#csstextboxcardnumber)
- [cssTextboxExpiryDate](MonerisStylingProps.md#csstextboxexpirydate)

## Properties

### cssBody

• `Optional` **cssBody**: `string`

Stringified CSS to apply to the body of the IFrame.

___

### cssInputLabel

• `Optional` **cssInputLabel**: `string`

Stringified CSS to apply to input labels

___

### cssTextbox

• `Optional` **cssTextbox**: `string`

Stringified CSS to apply to each of input fields.

___

### cssTextboxCVV

• `Optional` **cssTextboxCVV**: `string`

Stringified CSS to apply to the card's CVV field.

___

### cssTextboxCardNumber

• `Optional` **cssTextboxCardNumber**: `string`

Stringified CSS to apply to the card's number field.

___

### cssTextboxExpiryDate

• `Optional` **cssTextboxExpiryDate**: `string`

Stringified CSS to apply to the card's expiry field.
