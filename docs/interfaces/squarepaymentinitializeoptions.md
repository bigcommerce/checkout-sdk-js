[@bigcommerce/checkout-sdk](../README.md) > [SquarePaymentInitializeOptions](../interfaces/squarepaymentinitializeoptions.md)

# SquarePaymentInitializeOptions

## Hierarchy

**SquarePaymentInitializeOptions**

## Index

### Properties

* [cardNumber](squarepaymentinitializeoptions.md#cardnumber)
* [cvv](squarepaymentinitializeoptions.md#cvv)
* [expirationDate](squarepaymentinitializeoptions.md#expirationdate)
* [inputClass](squarepaymentinitializeoptions.md#inputclass)
* [inputStyles](squarepaymentinitializeoptions.md#inputstyles)
* [masterpass](squarepaymentinitializeoptions.md#masterpass)
* [postalCode](squarepaymentinitializeoptions.md#postalcode)

### Methods

* [onError](squarepaymentinitializeoptions.md#onerror)
* [onPaymentSelect](squarepaymentinitializeoptions.md#onpaymentselect)

---

## Properties

<a id="cardnumber"></a>

###  cardNumber

**● cardNumber**: *[SquareFormElement](squareformelement.md)*

___
<a id="cvv"></a>

###  cvv

**● cvv**: *[SquareFormElement](squareformelement.md)*

___
<a id="expirationdate"></a>

###  expirationDate

**● expirationDate**: *[SquareFormElement](squareformelement.md)*

___
<a id="inputclass"></a>

### `<Optional>` inputClass

**● inputClass**: * `undefined` &#124; `string`
*

___
<a id="inputstyles"></a>

### `<Optional>` inputStyles

**● inputStyles**: *`Array`<`object`>*

___
<a id="masterpass"></a>

### `<Optional>` masterpass

**● masterpass**: *[SquareFormElement](squareformelement.md)*

___
<a id="postalcode"></a>

###  postalCode

**● postalCode**: *[SquareFormElement](squareformelement.md)*

___

## Methods

<a id="onerror"></a>

### `<Optional>` onError

▸ **onError**(errors?: *[NonceGenerationError](noncegenerationerror.md)[]*): `void`

**Parameters:**

| Param | Type |
| ------ | ------ |
| `Optional` errors | [NonceGenerationError](noncegenerationerror.md)[] |

**Returns:** `void`

___
<a id="onpaymentselect"></a>

### `<Optional>` onPaymentSelect

▸ **onPaymentSelect**(): `void`

**Returns:** `void`

___

