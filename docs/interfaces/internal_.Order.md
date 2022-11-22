[@bigcommerce/checkout-sdk](../README.md) / [<internal\>](../modules/internal_.md) / Order

# Interface: Order

[<internal>](../modules/internal_.md).Order

## Table of contents

### Properties

- [baseAmount](internal_.Order.md#baseamount)
- [billingAddress](internal_.Order.md#billingaddress)
- [cartId](internal_.Order.md#cartid)
- [channelId](internal_.Order.md#channelid)
- [consignments](internal_.Order.md#consignments)
- [coupons](internal_.Order.md#coupons)
- [currency](internal_.Order.md#currency)
- [customerCanBeCreated](internal_.Order.md#customercanbecreated)
- [customerId](internal_.Order.md#customerid)
- [customerMessage](internal_.Order.md#customermessage)
- [discountAmount](internal_.Order.md#discountamount)
- [giftWrappingCostTotal](internal_.Order.md#giftwrappingcosttotal)
- [handlingCostTotal](internal_.Order.md#handlingcosttotal)
- [hasDigitalItems](internal_.Order.md#hasdigitalitems)
- [isComplete](internal_.Order.md#iscomplete)
- [isDownloadable](internal_.Order.md#isdownloadable)
- [isTaxIncluded](internal_.Order.md#istaxincluded)
- [lineItems](internal_.Order.md#lineitems)
- [orderAmount](internal_.Order.md#orderamount)
- [orderAmountAsInteger](internal_.Order.md#orderamountasinteger)
- [orderId](internal_.Order.md#orderid)
- [payments](internal_.Order.md#payments)
- [shippingCostBeforeDiscount](internal_.Order.md#shippingcostbeforediscount)
- [shippingCostTotal](internal_.Order.md#shippingcosttotal)
- [status](internal_.Order.md#status)
- [taxTotal](internal_.Order.md#taxtotal)
- [taxes](internal_.Order.md#taxes)

## Properties

### baseAmount

• **baseAmount**: `number`

___

### billingAddress

• **billingAddress**: [`BillingAddress`](internal_.BillingAddress.md)

___

### cartId

• **cartId**: `string`

___

### channelId

• **channelId**: `number`

___

### consignments

• **consignments**: [`OrderConsignment`](internal_.OrderConsignment.md)

___

### coupons

• **coupons**: [`Coupon`](internal_.Coupon.md)[]

___

### currency

• **currency**: [`Currency`](internal_.Currency.md)

___

### customerCanBeCreated

• **customerCanBeCreated**: `boolean`

___

### customerId

• **customerId**: `number`

___

### customerMessage

• **customerMessage**: `string`

___

### discountAmount

• **discountAmount**: `number`

___

### giftWrappingCostTotal

• **giftWrappingCostTotal**: `number`

___

### handlingCostTotal

• **handlingCostTotal**: `number`

___

### hasDigitalItems

• **hasDigitalItems**: `boolean`

___

### isComplete

• **isComplete**: `boolean`

___

### isDownloadable

• **isDownloadable**: `boolean`

___

### isTaxIncluded

• **isTaxIncluded**: `boolean`

___

### lineItems

• **lineItems**: [`LineItemMap`](internal_.LineItemMap.md)

___

### orderAmount

• **orderAmount**: `number`

___

### orderAmountAsInteger

• **orderAmountAsInteger**: `number`

___

### orderId

• **orderId**: `number`

___

### payments

• `Optional` **payments**: [`OrderPayments`](../modules/internal_.md#orderpayments)

___

### shippingCostBeforeDiscount

• **shippingCostBeforeDiscount**: `number`

___

### shippingCostTotal

• **shippingCostTotal**: `number`

___

### status

• **status**: `string`

___

### taxTotal

• **taxTotal**: `number`

___

### taxes

• **taxes**: [`Tax`](internal_.Tax.md)[]
