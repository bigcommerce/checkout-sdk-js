[@bigcommerce/checkout-sdk](../README.md) / [<internal\>](../modules/internal_.md) / InputDetail

# Interface: InputDetail

[<internal>](../modules/internal_.md).InputDetail

## Table of contents

### Properties

- [configuration](internal_.InputDetail.md#configuration)
- [details](internal_.InputDetail.md#details)
- [itemSearchUrl](internal_.InputDetail.md#itemsearchurl)
- [items](internal_.InputDetail.md#items)
- [key](internal_.InputDetail.md#key)
- [optional](internal_.InputDetail.md#optional)
- [type](internal_.InputDetail.md#type)
- [value](internal_.InputDetail.md#value)

## Properties

### configuration

• `Optional` **configuration**: `object`

Configuration parameters for the required input.

___

### details

• `Optional` **details**: [`SubInputDetail`](internal_.SubInputDetail.md)[]

Input details can also be provided recursively.

___

### itemSearchUrl

• `Optional` **itemSearchUrl**: `string`

In case of a select, the URL from which to query the items.

___

### items

• `Optional` **items**: [`Item_2`](internal_.Item_2.md)[]

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
