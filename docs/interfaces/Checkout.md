[**@bigcommerce/checkout-sdk**](../README.md)

***

[@bigcommerce/checkout-sdk](../README.md) / Checkout

# Interface: Checkout

## Properties

### balanceDue

> **balanceDue**: `number`

***

### billingAddress?

> `optional` **billingAddress?**: [`BillingAddress`](BillingAddress.md)

***

### cart

> **cart**: [`Cart`](Cart.md)

***

### channelId

> **channelId**: `number`

***

### comparisonShippingCost

> **comparisonShippingCost**: `number`

***

### consignments

> **consignments**: [`Consignment`](Consignment.md)[]

***

### coupons

> **coupons**: [`Coupon`](Coupon.md)[]

***

### createdTime

> **createdTime**: `string`

***

### customer

> **customer**: [`Customer`](Customer.md)

***

### customerMessage

> **customerMessage**: `string`

***

### discounts

> **discounts**: [`Discount`](Discount.md)[]

***

### displayDiscountTotal

> **displayDiscountTotal**: `number`

***

### fees

> **fees**: [`Fee`](Fee.md)[]

***

### giftCertificates

> **giftCertificates**: [`GiftCertificate`](GiftCertificate.md)[]

***

### giftWrappingCostTotal

> **giftWrappingCostTotal**: `number`

***

### grandTotal

> **grandTotal**: `number`

***

### handlingCostTotal

> **handlingCostTotal**: `number`

***

### hasOrderLevelAutoDiscountMaxLimitReached?

> `optional` **hasOrderLevelAutoDiscountMaxLimitReached?**: `boolean`

***

### id

> **id**: `string`

***

### isStoreCreditApplied

> **isStoreCreditApplied**: `boolean`

***

### manualDiscountTotal

> **manualDiscountTotal**: `number`

***

### orderBasedAutoDiscountTotal

> **orderBasedAutoDiscountTotal**: `number`

***

### orderId?

> `optional` **orderId?**: `number`

***

### outstandingBalance

> **outstandingBalance**: `number`

***

### payments?

> `optional` **payments?**: [`CheckoutPayment`](CheckoutPayment.md)[]

***

### promotions?

> `optional` **promotions?**: [`Promotion`](Promotion.md)[]

***

### shippingCostBeforeDiscount

> **shippingCostBeforeDiscount**: `number`

***

### shippingCostTotal

> **shippingCostTotal**: `number`

***

### shouldExecuteSpamCheck

> **shouldExecuteSpamCheck**: `boolean`

Whether the current checkout must execute spam protection
before placing the order.

Note: You need to enable Google ReCAPTCHA bot protection in your Checkout Settings.

***

### subtotal

> **subtotal**: `number`

***

### taxes

> **taxes**: [`Tax`](Tax.md)[]

***

### taxTotal

> **taxTotal**: `number`

***

### totalDiscount

> **totalDiscount**: `number`

***

### updatedTime

> **updatedTime**: `string`

***

### version

> **version**: `number`
