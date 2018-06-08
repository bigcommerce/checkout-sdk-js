[@bigcommerce/checkout-sdk](../README.md) > [InternalCart](../interfaces/internalcart.md)

# InternalCart

## Hierarchy

**InternalCart**

## Index

### Properties

* [coupon](internalcart.md#coupon)
* [currency](internalcart.md#currency)
* [discount](internalcart.md#discount)
* [discountNotifications](internalcart.md#discountnotifications)
* [giftCertificate](internalcart.md#giftcertificate)
* [grandTotal](internalcart.md#grandtotal)
* [handling](internalcart.md#handling)
* [id](internalcart.md#id)
* [items](internalcart.md#items)
* [shipping](internalcart.md#shipping)
* [storeCredit](internalcart.md#storecredit)
* [subtotal](internalcart.md#subtotal)
* [taxSubtotal](internalcart.md#taxsubtotal)
* [taxTotal](internalcart.md#taxtotal)
* [taxes](internalcart.md#taxes)

---

## Properties

<a id="coupon"></a>

###  coupon

**● coupon**: *`object`*

#### Type declaration

 coupons: [InternalCoupon](internalcoupon.md)[]

 discountedAmount: `number`

___
<a id="currency"></a>

###  currency

**● currency**: *`string`*

___
<a id="discount"></a>

###  discount

**● discount**: *`object`*

#### Type declaration

 amount: `number`

 integerAmount: `number`

___
<a id="discountnotifications"></a>

###  discountNotifications

**● discountNotifications**: *[DiscountNotification](discountnotification.md)[]*

___
<a id="giftcertificate"></a>

###  giftCertificate

**● giftCertificate**: *`object`*

#### Type declaration

 appliedGiftCertificates: `object`

[code: `string`]: [InternalGiftCertificate](internalgiftcertificate.md)

 totalDiscountedAmount: `number`

___
<a id="grandtotal"></a>

###  grandTotal

**● grandTotal**: *`object`*

#### Type declaration

 amount: `number`

 integerAmount: `number`

___
<a id="handling"></a>

###  handling

**● handling**: *`object`*

#### Type declaration

 amount: `number`

 integerAmount: `number`

___
<a id="id"></a>

###  id

**● id**: *`string`*

___
<a id="items"></a>

###  items

**● items**: *[InternalLineItem](internallineitem.md)[]*

___
<a id="shipping"></a>

###  shipping

**● shipping**: *`object`*

#### Type declaration

 amount: `number`

 amountBeforeDiscount: `number`

 integerAmount: `number`

 integerAmountBeforeDiscount: `number`

 required: `boolean`

___
<a id="storecredit"></a>

###  storeCredit

**● storeCredit**: *`object`*

#### Type declaration

 amount: `number`

___
<a id="subtotal"></a>

###  subtotal

**● subtotal**: *`object`*

#### Type declaration

 amount: `number`

 integerAmount: `number`

___
<a id="taxsubtotal"></a>

###  taxSubtotal

**● taxSubtotal**: *`object`*

#### Type declaration

 amount: `number`

 integerAmount: `number`

___
<a id="taxtotal"></a>

###  taxTotal

**● taxTotal**: *`object`*

#### Type declaration

 amount: `number`

 integerAmount: `number`

___
<a id="taxes"></a>

###  taxes

**● taxes**: *`Array`<`object`>*

___

