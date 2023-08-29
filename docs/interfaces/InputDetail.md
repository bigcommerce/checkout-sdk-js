[@bigcommerce/checkout-sdk](../README.md) / InputDetail

# Interface: InputDetail

## Table of contents

### Properties

- [configuration](InputDetail.md#configuration)
- [details](InputDetail.md#details)
- [itemSearchUrl](InputDetail.md#itemsearchurl)
- [items](InputDetail.md#items)
- [key](InputDetail.md#key)
- [optional](InputDetail.md#optional)
- [type](InputDetail.md#type)
- [value](InputDetail.md#value)

## Properties

### configuration

• `Optional` **configuration**: `object`

Configuration parameters for the required input.

___

### details

• `Optional` **details**: [`SubInputDetail`](SubInputDetail.md)[]

Input details can also be provided recursively.

___

### itemSearchUrl

• `Optional` **itemSearchUrl**: `string`

In case of a select, the URL from which to query the items.

___

### items

• `Optional` **items**: [`Item_2`](Item_2.md)[]

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
