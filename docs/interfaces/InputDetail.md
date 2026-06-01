[**@bigcommerce/checkout-sdk**](../README.md)

***

[@bigcommerce/checkout-sdk](../README.md) / InputDetail

# Interface: InputDetail

## Properties

### configuration?

> `optional` **configuration?**: `object`

Configuration parameters for the required input.

***

### details?

> `optional` **details?**: [`SubInputDetail`](SubInputDetail.md)[]

Input details can also be provided recursively.

***

### items?

> `optional` **items?**: [`Item_2`](Item_2.md)[]

In case of a select, the items to choose from.

***

### itemSearchUrl?

> `optional` **itemSearchUrl?**: `string`

In case of a select, the URL from which to query the items.

***

### key?

> `optional` **key?**: `string`

The value to provide in the result.

***

### optional?

> `optional` **optional?**: `boolean`

True if this input value is optional.

***

### type?

> `optional` **type?**: `string`

The type of the required input.

***

### value?

> `optional` **value?**: `string`

The value can be pre-filled, if available.
