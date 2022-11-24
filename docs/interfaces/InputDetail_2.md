[@bigcommerce/checkout-sdk](../README.md) / InputDetail_2

# Interface: InputDetail\_2

## Table of contents

### Properties

- [configuration](InputDetail_2.md#configuration)
- [details](InputDetail_2.md#details)
- [itemSearchUrl](InputDetail_2.md#itemsearchurl)
- [items](InputDetail_2.md#items)
- [key](InputDetail_2.md#key)
- [optional](InputDetail_2.md#optional)
- [type](InputDetail_2.md#type)
- [value](InputDetail_2.md#value)

## Properties

### configuration

• `Optional` **configuration**: `object`

Configuration parameters for the required input.

___

### details

• `Optional` **details**: [`SubInputDetail_2`](SubInputDetail_2.md)[]

Input details can also be provided recursively.

___

### itemSearchUrl

• `Optional` **itemSearchUrl**: `string`

In case of a select, the URL from which to query the items.

___

### items

• `Optional` **items**: [`Item_3`](Item_3.md)[]

In case of a select, the items to choose from.

___

### key

• `Optional` **key**: `string`

The value to provide in the result.

___

### optional

• `Optional` **optional**: `boolean`

True if this input value is optional.

___

### type

• `Optional` **type**: `string`

The type of the required input.

___

### value

• `Optional` **value**: `string`

The value can be pre-filled, if available.
