[@bigcommerce/checkout-sdk](../README.md) > [InternalOrder](../interfaces/internalorder.md)

# InternalOrder

## Hierarchy

 [InternalIncompleteOrder](internalincompleteorder.md)

**↳ InternalOrder**

## Index

### Properties

* [callbackUrl](internalorder.md#callbackurl)
* [coupon](internalorder.md#coupon)
* [currency](internalorder.md#currency)
* [customerCanBeCreated](internalorder.md#customercanbecreated)
* [customerCreated](internalorder.md#customercreated)
* [discount](internalorder.md#discount)
* [discountNotifications](internalorder.md#discountnotifications)
* [giftCertificate](internalorder.md#giftcertificate)
* [grandTotal](internalorder.md#grandtotal)
* [handling](internalorder.md#handling)
* [hasDigitalItems](internalorder.md#hasdigitalitems)
* [id](internalorder.md#id)
* [isComplete](internalorder.md#iscomplete)
* [isDownloadable](internalorder.md#isdownloadable)
* [items](internalorder.md#items)
* [orderId](internalorder.md#orderid)
* [payment](internalorder.md#payment)
* [shipping](internalorder.md#shipping)
* [socialData](internalorder.md#socialdata)
* [status](internalorder.md#status-1)
* [storeCredit](internalorder.md#storecredit)
* [subtotal](internalorder.md#subtotal)
* [taxSubtotal](internalorder.md#taxsubtotal)
* [taxTotal](internalorder.md#taxtotal)
* [taxes](internalorder.md#taxes)
* [token](internalorder.md#token)

---

## Properties

<a id="callbackurl"></a>

###  callbackUrl

**● callbackUrl**: *`string`*

___
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
<a id="customercanbecreated"></a>

###  customerCanBeCreated

**● customerCanBeCreated**: *`boolean`*

___
<a id="customercreated"></a>

###  customerCreated

**● customerCreated**: *`boolean`*

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

**● discountNotifications**: *`Array`<`object`>*

___
<a id="giftcertificate"></a>

###  giftCertificate

**● giftCertificate**: *`object`*

#### Type declaration

 appliedGiftCertificates: [InternalGiftCertificate](internalgiftcertificate.md)[]

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
<a id="hasdigitalitems"></a>

###  hasDigitalItems

**● hasDigitalItems**: *`boolean`*

___
<a id="id"></a>

###  id

**● id**: *`number`*

___
<a id="iscomplete"></a>

###  isComplete

**● isComplete**: *`boolean`*

___
<a id="isdownloadable"></a>

###  isDownloadable

**● isDownloadable**: *`boolean`*

___
<a id="items"></a>

###  items

**● items**: *[InternalLineItem](internallineitem.md)[]*

___
<a id="orderid"></a>

###  orderId

**● orderId**: *`number`*

___
<a id="payment"></a>

###  payment

**● payment**: *`object`*

#### Type declaration

`Optional`  gateway:  `undefined` &#124; `string`

`Optional`  helpText:  `undefined` &#124; `string`

`Optional`  id:  `undefined` &#124; `string`

`Optional`  redirectUrl:  `undefined` &#124; `string`

`Optional`  returnUrl:  `undefined` &#124; `string`

`Optional`  status:  `undefined` &#124; `string`

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
<a id="socialdata"></a>

###  socialData

**● socialData**: *`object`*

#### Type declaration

[key: `string`]: `object`

 description: `string`

 image: `string`

 name: `string`

 shareText: `string`

 sharingLink: `string`

 url: `string`

___
<a id="status-1"></a>

###  status

**● status**: *`string`*

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
<a id="token"></a>

###  token

**● token**: *`string`*

___

