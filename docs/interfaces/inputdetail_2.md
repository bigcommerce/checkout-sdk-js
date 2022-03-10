[@bigcommerce/checkout-sdk](../README.md) › [InputDetail_2](inputdetail_2.md)

# Interface: InputDetail_2

## Hierarchy

* **InputDetail_2**

## Index

### Properties

* [configuration](inputdetail_2.md#optional-configuration)
* [details](inputdetail_2.md#optional-details)
* [itemSearchUrl](inputdetail_2.md#optional-itemsearchurl)
* [items](inputdetail_2.md#optional-items)
* [key](inputdetail_2.md#optional-key)
* [optional](inputdetail_2.md#optional-optional)
* [type](inputdetail_2.md#optional-type)
* [value](inputdetail_2.md#optional-value)

## Properties

### `Optional` configuration

• **configuration**? : *undefined | object*

Configuration parameters for the required input.

___

### `Optional` details

• **details**? : *[SubInputDetail_2](subinputdetail_2.md)[]*

Input details can also be provided recursively.

___

### `Optional` itemSearchUrl

• **itemSearchUrl**? : *undefined | string*

In case of a select, the URL from which to query the items.

___

### `Optional` items

• **items**? : *[Item_2](item_2.md)[]*

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
