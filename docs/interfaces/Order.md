[@bigcommerce/checkout-sdk](../README.md) / Order

# Interface: Order

## Table of contents

### Properties

- [baseAmount](Order.md#baseamount)
- [billingAddress](Order.md#billingaddress)
- [cartId](Order.md#cartid)
- [channelId](Order.md#channelid)
- [consignments](Order.md#consignments)
- [coupons](Order.md#coupons)
- [currency](Order.md#currency)
- [customerCanBeCreated](Order.md#customercanbecreated)
- [customerId](Order.md#customerid)
- [customerMessage](Order.md#customermessage)
- [discountAmount](Order.md#discountamount)
- [giftWrappingCostTotal](Order.md#giftwrappingcosttotal)
- [handlingCostTotal](Order.md#handlingcosttotal)
- [hasDigitalItems](Order.md#hasdigitalitems)
- [isComplete](Order.md#iscomplete)
- [isDownloadable](Order.md#isdownloadable)
- [isTaxIncluded](Order.md#istaxincluded)
- [lineItems](Order.md#lineitems)
- [orderAmount](Order.md#orderamount)
- [orderAmountAsInteger](Order.md#orderamountasinteger)
- [orderId](Order.md#orderid)
- [payments](Order.md#payments)
- [shippingCostBeforeDiscount](Order.md#shippingcostbeforediscount)
- [shippingCostTotal](Order.md#shippingcosttotal)
- [status](Order.md#status)
- [taxTotal](Order.md#taxtotal)
- [taxes](Order.md#taxes)

## Properties

### baseAmount

• **baseAmount**: `number`

___

### billingAddress

• **billingAddress**: [`OrderBillingAddress`](OrderBillingAddress.md)

___

### cartId

• **cartId**: `string`

___

### channelId

• **channelId**: `number`

___

### consignments

• **consignments**: [`OrderConsignment`](OrderConsignment.md)

___

### coupons

• **coupons**: [`Coupon`](Coupon.md)[]

___

### currency

• **currency**: [`Currency`](Currency.md)

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

• **lineItems**: [`LineItemMap`](LineItemMap.md)

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

• `Optional` **payments**: [`OrderPayments`](../README.md#orderpayments)

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

• **taxes**: [`Tax`](Tax.md)[]
