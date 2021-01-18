[@bigcommerce/checkout-sdk](../README.md) › [Checkout](checkout.md)

# Interface: Checkout

## Hierarchy

* **Checkout**

## Index

### Properties

* [balanceDue](checkout.md#balancedue)
* [billingAddress](checkout.md#optional-billingaddress)
* [cart](checkout.md#cart)
* [consignments](checkout.md#consignments)
* [coupons](checkout.md#coupons)
* [createdTime](checkout.md#createdtime)
* [customer](checkout.md#customer)
* [customerMessage](checkout.md#customermessage)
* [discounts](checkout.md#discounts)
* [giftCertificates](checkout.md#giftcertificates)
* [giftWrappingCostTotal](checkout.md#giftwrappingcosttotal)
* [grandTotal](checkout.md#grandtotal)
* [handlingCostTotal](checkout.md#handlingcosttotal)
* [id](checkout.md#id)
* [isStoreCreditApplied](checkout.md#isstorecreditapplied)
* [orderId](checkout.md#optional-orderid)
* [outstandingBalance](checkout.md#outstandingbalance)
* [payments](checkout.md#optional-payments)
* [promotions](checkout.md#optional-promotions)
* [shippingCostBeforeDiscount](checkout.md#shippingcostbeforediscount)
* [shippingCostTotal](checkout.md#shippingcosttotal)
* [shouldExecuteSpamCheck](checkout.md#shouldexecutespamcheck)
* [subtotal](checkout.md#subtotal)
* [taxTotal](checkout.md#taxtotal)
* [taxes](checkout.md#taxes)
* [updatedTime](checkout.md#updatedtime)

## Properties

###  balanceDue

• **balanceDue**: *number*

___

### `Optional` billingAddress

• **billingAddress**? : *[BillingAddress](billingaddress.md)*

___

###  cart

• **cart**: *[Cart](cart.md)*

___

###  consignments

• **consignments**: *[Consignment](consignment.md)[]*

___

###  coupons

• **coupons**: *[Coupon](coupon.md)[]*

___

###  createdTime

• **createdTime**: *string*

___

###  customer

• **customer**: *[Customer](customer.md)*

___

###  customerMessage

• **customerMessage**: *string*

___

###  discounts

• **discounts**: *[Discount](discount.md)[]*

___

###  giftCertificates

• **giftCertificates**: *[GiftCertificate](giftcertificate.md)[]*

___

###  giftWrappingCostTotal

• **giftWrappingCostTotal**: *number*

___

###  grandTotal

• **grandTotal**: *number*

___

###  handlingCostTotal

• **handlingCostTotal**: *number*

___

###  id

• **id**: *string*

___

###  isStoreCreditApplied

• **isStoreCreditApplied**: *boolean*

___

### `Optional` orderId

• **orderId**? : *undefined | number*

___

###  outstandingBalance

• **outstandingBalance**: *number*

___

### `Optional` payments

• **payments**? : *[CheckoutPayment](checkoutpayment.md)[]*

___

### `Optional` promotions

• **promotions**? : *[Promotion](promotion.md)[]*

___

###  shippingCostBeforeDiscount

• **shippingCostBeforeDiscount**: *number*

___

###  shippingCostTotal

• **shippingCostTotal**: *number*

___

###  shouldExecuteSpamCheck

• **shouldExecuteSpamCheck**: *boolean*

Whether the current checkout must execute spam protection
before placing the order.

Note: You need to enable Google ReCAPTCHA bot protection in your Checkout Settings.

___

###  subtotal

• **subtotal**: *number*

___

###  taxTotal

• **taxTotal**: *number*

___

###  taxes

• **taxes**: *[Tax](tax.md)[]*

___

###  updatedTime

• **updatedTime**: *string*
