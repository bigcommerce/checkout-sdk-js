[**@bigcommerce/checkout-sdk**](../README.md)

***

[@bigcommerce/checkout-sdk](../README.md) / Cart

# Interface: Cart

## Properties

### baseAmount

> **baseAmount**: `number`

***

### cartAmount

> **cartAmount**: `number`

***

### companyId

> **companyId**: `number` \| `null`

***

### companyName

> **companyName**: `string` \| `null`

***

### coupons

> **coupons**: [`Coupon`](Coupon.md)[]

This is an array of all applied coupons.

***

### createdTime

> **createdTime**: `string`

***

### currency

> **currency**: [`Currency`](Currency.md)

***

### customerId

> **customerId**: `number`

***

### discountAmount

> **discountAmount**: `number`

This is the total amount of discount applied on line_items.

***

### discounts

> **discounts**: [`Discount`](Discount.md)[]

This is the total amount of discount applied on cart including coupons and line_items discounts.

***

### email

> **email**: `string`

***

### id

> **id**: `string`

***

### isTaxIncluded

> **isTaxIncluded**: `boolean`

***

### lineItems

> **lineItems**: [`LineItemMap`](LineItemMap.md)

***

### locale

> **locale**: `string`

***

### source?

> `optional` **source?**: `CartSource`

***

### updatedTime

> **updatedTime**: `string`
