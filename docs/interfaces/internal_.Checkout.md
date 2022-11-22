[@bigcommerce/checkout-sdk](../README.md) / [<internal\>](../modules/internal_.md) / Checkout

# Interface: Checkout

[<internal>](../modules/internal_.md).Checkout

## Table of contents

### Properties

- [balanceDue](internal_.Checkout.md#balancedue)
- [billingAddress](internal_.Checkout.md#billingaddress)
- [cart](internal_.Checkout.md#cart)
- [channelId](internal_.Checkout.md#channelid)
- [consignments](internal_.Checkout.md#consignments)
- [coupons](internal_.Checkout.md#coupons)
- [createdTime](internal_.Checkout.md#createdtime)
- [customer](internal_.Checkout.md#customer)
- [customerMessage](internal_.Checkout.md#customermessage)
- [discounts](internal_.Checkout.md#discounts)
- [giftCertificates](internal_.Checkout.md#giftcertificates)
- [giftWrappingCostTotal](internal_.Checkout.md#giftwrappingcosttotal)
- [grandTotal](internal_.Checkout.md#grandtotal)
- [handlingCostTotal](internal_.Checkout.md#handlingcosttotal)
- [id](internal_.Checkout.md#id)
- [isStoreCreditApplied](internal_.Checkout.md#isstorecreditapplied)
- [orderId](internal_.Checkout.md#orderid)
- [outstandingBalance](internal_.Checkout.md#outstandingbalance)
- [payments](internal_.Checkout.md#payments)
- [promotions](internal_.Checkout.md#promotions)
- [shippingCostBeforeDiscount](internal_.Checkout.md#shippingcostbeforediscount)
- [shippingCostTotal](internal_.Checkout.md#shippingcosttotal)
- [shouldExecuteSpamCheck](internal_.Checkout.md#shouldexecutespamcheck)
- [subtotal](internal_.Checkout.md#subtotal)
- [taxTotal](internal_.Checkout.md#taxtotal)
- [taxes](internal_.Checkout.md#taxes)
- [updatedTime](internal_.Checkout.md#updatedtime)

## Properties

### balanceDue

• **balanceDue**: `number`

___

### billingAddress

• `Optional` **billingAddress**: [`BillingAddress`](internal_.BillingAddress.md)

___

### cart

• **cart**: [`Cart`](internal_.Cart.md)

___

### channelId

• **channelId**: `number`

___

### consignments

• **consignments**: [`Consignment`](internal_.Consignment.md)[]

___

### coupons

• **coupons**: [`Coupon`](internal_.Coupon.md)[]

___

### createdTime

• **createdTime**: `string`

___

### customer

• **customer**: [`Customer`](internal_.Customer.md)

___

### customerMessage

• **customerMessage**: `string`

___

### discounts

• **discounts**: [`Discount`](internal_.Discount.md)[]

___

### giftCertificates

• **giftCertificates**: [`GiftCertificate`](internal_.GiftCertificate.md)[]

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

• `Optional` **payments**: [`CheckoutPayment`](internal_.CheckoutPayment.md)[]

___

### promotions

• `Optional` **promotions**: [`Promotion`](internal_.Promotion.md)[]

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

• **taxes**: [`Tax`](internal_.Tax.md)[]

___

### updatedTime

• **updatedTime**: `string`
