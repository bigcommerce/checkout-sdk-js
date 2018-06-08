[@bigcommerce/checkout-sdk](../README.md) > [InternalOrder](../interfaces/internalorder.md)

# InternalOrder

## Hierarchy

**InternalOrder**

## Index

### Properties

* [callbackUrl](internalorder.md#callbackurl)
* [coupon](internalorder.md#coupon)
* [currency](internalorder.md#currency)
* [customerCanBeCreated](internalorder.md#customercanbecreated)
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
* [status](internalorder.md#status)
* [storeCredit](internalorder.md#storecredit)
* [subtotal](internalorder.md#subtotal)
* [taxes](internalorder.md#taxes)
* [token](internalorder.md#token)

---

## Properties

<a id="callbackurl"></a>

### `<Optional>` callbackUrl

**● callbackUrl**: * `undefined` &#124; `string`
*

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

**● giftCertificate**: *[InternalGiftCertificateList](internalgiftcertificatelist.md)*

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

**● payment**: *[InternalOrderPayment](internalorderpayment.md)*

___
<a id="shipping"></a>

###  shipping

**● shipping**: *`object`*

#### Type declaration

 amount: `number`

 amountBeforeDiscount: `number`

 integerAmount: `number`

 integerAmountBeforeDiscount: `number`

___
<a id="socialdata"></a>

### `<Optional>` socialData

**● socialData**: * `undefined` &#124; `object`
*

___
<a id="status"></a>

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
<a id="taxes"></a>

###  taxes

**● taxes**: *`Array`<`object`>*

___
<a id="token"></a>

### `<Optional>` token

**● token**: * `undefined` &#124; `string`
*

___

