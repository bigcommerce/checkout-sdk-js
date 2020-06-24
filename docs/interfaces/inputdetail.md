[@bigcommerce/checkout-sdk](../README.md) › [InputDetail](inputdetail.md)

# Interface: InputDetail

## Hierarchy

* **InputDetail**

## Index

### Properties

* [configuration](inputdetail.md#optional-configuration)
* [details](inputdetail.md#optional-details)
* [itemSearchUrl](inputdetail.md#optional-itemsearchurl)
* [items](inputdetail.md#optional-items)
* [key](inputdetail.md#optional-key)
* [optional](inputdetail.md#optional-optional)
* [type](inputdetail.md#optional-type)
* [value](inputdetail.md#optional-value)

## Properties

### `Optional` configuration

• **configuration**? : *undefined | object*

Configuration parameters for the required input.

___

### `Optional` details

• **details**? : *[SubInputDetail](subinputdetail.md)[]*

Input details can also be provided recursively.

___

### `Optional` itemSearchUrl

• **itemSearchUrl**? : *undefined | string*

In case of a select, the URL from which to query the items.

___

### `Optional` items

• **items**? : *[Item](item.md)[]*

In case of a select, the items to choose from.

___

### `Optional` key

• **key**? : *undefined | string*

The value to provide in the result.

___

### `Optional` optional

• **optional**? : *undefined | false | true*

True if this input value is optional.

___

### `Optional` type

• **type**? : *undefined | string*

The type of the required input.

___

### `Optional` value

• **value**? : *undefined | string*

The value can be pre-filled, if available.
