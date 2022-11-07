[@bigcommerce/checkout-sdk](../README.md) / Checkout

# Interface: Checkout

## Table of contents

### Properties

- [balanceDue](Checkout.md#balancedue)
- [billingAddress](Checkout.md#billingaddress)
- [cart](Checkout.md#cart)
- [channelId](Checkout.md#channelid)
- [consignments](Checkout.md#consignments)
- [coupons](Checkout.md#coupons)
- [createdTime](Checkout.md#createdtime)
- [customer](Checkout.md#customer)
- [customerMessage](Checkout.md#customermessage)
- [discounts](Checkout.md#discounts)
- [giftCertificates](Checkout.md#giftcertificates)
- [giftWrappingCostTotal](Checkout.md#giftwrappingcosttotal)
- [grandTotal](Checkout.md#grandtotal)
- [handlingCostTotal](Checkout.md#handlingcosttotal)
- [id](Checkout.md#id)
- [isStoreCreditApplied](Checkout.md#isstorecreditapplied)
- [orderId](Checkout.md#orderid)
- [outstandingBalance](Checkout.md#outstandingbalance)
- [payments](Checkout.md#payments)
- [promotions](Checkout.md#promotions)
- [shippingCostBeforeDiscount](Checkout.md#shippingcostbeforediscount)
- [shippingCostTotal](Checkout.md#shippingcosttotal)
- [shouldExecuteSpamCheck](Checkout.md#shouldexecutespamcheck)
- [subtotal](Checkout.md#subtotal)
- [taxTotal](Checkout.md#taxtotal)
- [taxes](Checkout.md#taxes)
- [updatedTime](Checkout.md#updatedtime)

## Properties

### balanceDue

• **balanceDue**: `number`

___

### billingAddress

• `Optional` **billingAddress**: [`BillingAddress`](BillingAddress.md)

___

### cart

• **cart**: [`Cart`](Cart.md)

___

### channelId

• **channelId**: `number`

___

### consignments

• **consignments**: [`Consignment`](Consignment.md)[]

___

### coupons

• **coupons**: [`Coupon`](Coupon.md)[]

___

### createdTime

• **createdTime**: `string`

___

### customer

• **customer**: [`Customer`](Customer.md)

___

### customerMessage

• **customerMessage**: `string`

___

### discounts

• **discounts**: [`Discount`](Discount.md)[]

___

### giftCertificates

• **giftCertificates**: [`GiftCertificate`](GiftCertificate.md)[]

___

### giftWrappingCostTotal

• **giftWrappingCostTotal**: `number`

___

### grandTotal

• **grandTotal**: `number`

___

### handlingCostTotal

• **handlingCostTotal**: `number`

___

### id

• **id**: `string`

___

### isStoreCreditApplied

• **isStoreCreditApplied**: `boolean`

___

### orderId

• `Optional` **orderId**: `number`

___

### outstandingBalance

• **outstandingBalance**: `number`

___

### payments

• `Optional` **payments**: [`CheckoutPayment`](CheckoutPayment.md)[]

___

### promotions

• `Optional` **promotions**: [`Promotion`](Promotion.md)[]

___

### shippingCostBeforeDiscount

• **shippingCostBeforeDiscount**: `number`

___

### shippingCostTotal

• **shippingCostTotal**: `number`

___

### shouldExecuteSpamCheck

• **shouldExecuteSpamCheck**: `boolean`

Whether the current checkout must execute spam protection
before placing the order.

Note: You need to enable Google ReCAPTCHA bot protection in your Checkout Settings.

___

### subtotal

• **subtotal**: `number`

___

### taxTotal

• **taxTotal**: `number`

___

### taxes

• **taxes**: [`Tax`](Tax.md)[]

___

### updatedTime

• **updatedTime**: `string`
