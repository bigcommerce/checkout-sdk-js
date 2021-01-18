[@bigcommerce/checkout-sdk](../README.md) › [Order](order.md)

# Interface: Order

## Hierarchy

* **Order**

## Index

### Properties

* [baseAmount](order.md#baseamount)
* [billingAddress](order.md#billingaddress)
* [cartId](order.md#cartid)
* [coupons](order.md#coupons)
* [currency](order.md#currency)
* [customerCanBeCreated](order.md#customercanbecreated)
* [customerId](order.md#customerid)
* [customerMessage](order.md#customermessage)
* [discountAmount](order.md#discountamount)
* [giftWrappingCostTotal](order.md#giftwrappingcosttotal)
* [handlingCostTotal](order.md#handlingcosttotal)
* [hasDigitalItems](order.md#hasdigitalitems)
* [isComplete](order.md#iscomplete)
* [isDownloadable](order.md#isdownloadable)
* [isTaxIncluded](order.md#istaxincluded)
* [lineItems](order.md#lineitems)
* [mandateUrl](order.md#optional-mandateurl)
* [orderAmount](order.md#orderamount)
* [orderAmountAsInteger](order.md#orderamountasinteger)
* [orderId](order.md#orderid)
* [payments](order.md#optional-payments)
* [shippingCostBeforeDiscount](order.md#shippingcostbeforediscount)
* [shippingCostTotal](order.md#shippingcosttotal)
* [status](order.md#status)
* [taxTotal](order.md#taxtotal)
* [taxes](order.md#taxes)

## Properties

###  baseAmount

• **baseAmount**: *number*

___

###  billingAddress

• **billingAddress**: *[BillingAddress](billingaddress.md)*

___

###  cartId

• **cartId**: *string*

___

###  coupons

• **coupons**: *[Coupon](coupon.md)[]*

___

###  currency

• **currency**: *[Currency](currency.md)*

___

###  customerCanBeCreated

• **customerCanBeCreated**: *boolean*

___

###  customerId

• **customerId**: *number*

___

###  customerMessage

• **customerMessage**: *string*

___

###  discountAmount

• **discountAmount**: *number*

___

###  giftWrappingCostTotal

• **giftWrappingCostTotal**: *number*

___

###  handlingCostTotal

• **handlingCostTotal**: *number*

___

###  hasDigitalItems

• **hasDigitalItems**: *boolean*

___

###  isComplete

• **isComplete**: *boolean*

___

###  isDownloadable

• **isDownloadable**: *boolean*

___

###  isTaxIncluded

• **isTaxIncluded**: *boolean*

___

###  lineItems

• **lineItems**: *[LineItemMap](lineitemmap.md)*

___

### `Optional` mandateUrl

• **mandateUrl**? : *undefined | string*

___

###  orderAmount

• **orderAmount**: *number*

___

###  orderAmountAsInteger

• **orderAmountAsInteger**: *number*

___

###  orderId

• **orderId**: *number*

___

### `Optional` payments

• **payments**? : *[OrderPayments](../README.md#orderpayments)*

___

###  shippingCostBeforeDiscount

• **shippingCostBeforeDiscount**: *number*

___

###  shippingCostTotal

• **shippingCostTotal**: *number*

___

###  status

• **status**: *string*

___

###  taxTotal

• **taxTotal**: *number*

___

###  taxes

• **taxes**: *[Tax](tax.md)[]*
