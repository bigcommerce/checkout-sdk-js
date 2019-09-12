[@bigcommerce/checkout-sdk](../README.md) > [InputDetail](../interfaces/inputdetail.md)

# InputDetail

## Hierarchy

**InputDetail**

## Index

### Properties

* [configuration](inputdetail.md#configuration)
* [details](inputdetail.md#details)
* [itemSearchUrl](inputdetail.md#itemsearchurl)
* [items](inputdetail.md#items)
* [key](inputdetail.md#key)
* [optional](inputdetail.md#optional)
* [type](inputdetail.md#type)
* [value](inputdetail.md#value)

---

## Properties

<a id="configuration"></a>

### `<Optional>` configuration

**● configuration**: * `undefined` &#124; `object`
*

Configuration parameters for the required input.

___
<a id="details"></a>

### `<Optional>` details

**● details**: *[SubInputDetail](subinputdetail.md)[]*

Input details can also be provided recursively.

___
<a id="itemsearchurl"></a>

### `<Optional>` itemSearchUrl

**● itemSearchUrl**: * `undefined` &#124; `string`
*

In case of a select, the URL from which to query the items.

___
<a id="items"></a>

### `<Optional>` items

**● items**: *[Item](item.md)[]*

In case of a select, the items to choose from.

___
<a id="key"></a>

### `<Optional>` key

**● key**: * `undefined` &#124; `string`
*

The value to provide in the result.

___
<a id="optional"></a>

### `<Optional>` optional

**● optional**: * `undefined` &#124; `false` &#124; `true`
*

True if this input value is optional.

___
<a id="type"></a>

### `<Optional>` type

**● type**: * `undefined` &#124; `string`
*

The type of the required input.

___
<a id="value"></a>

### `<Optional>` value

**● value**: * `undefined` &#124; `string`
*

The value can be pre-filled, if available.

___

