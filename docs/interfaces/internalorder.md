[@bigcommerce/checkout-sdk](../README.md) > [InternalOrder](../interfaces/internalorder.md)



# Interface: InternalOrder

## Hierarchy


 [InternalIncompleteOrder](internalincompleteorder.md)

**↳ InternalOrder**








## Properties
<a id="callbackurl"></a>

###  callbackUrl

**●  callbackUrl**:  *`string`* 

*Inherited from [InternalIncompleteOrder](internalincompleteorder.md).[callbackUrl](internalincompleteorder.md#callbackurl)*

*Defined in checkout-sdk.d.ts:445*





___

<a id="coupon"></a>

###  coupon

**●  coupon**:  *`object`* 

*Defined in checkout-sdk.d.ts:478*


#### Type declaration




 coupons: [InternalCoupon](internalcoupon.md)[]






 discountedAmount: `number`







___

<a id="currency"></a>

###  currency

**●  currency**:  *`string`* 

*Defined in checkout-sdk.d.ts:472*





___

<a id="customercanbecreated"></a>

###  customerCanBeCreated

**●  customerCanBeCreated**:  *`boolean`* 

*Defined in checkout-sdk.d.ts:473*





___

<a id="customercreated"></a>

###  customerCreated

**●  customerCreated**:  *`boolean`* 

*Inherited from [InternalIncompleteOrder](internalincompleteorder.md).[customerCreated](internalincompleteorder.md#customercreated)*

*Defined in checkout-sdk.d.ts:441*





___

<a id="discount"></a>

###  discount

**●  discount**:  *`object`* 

*Defined in checkout-sdk.d.ts:482*


#### Type declaration




 amount: `number`






 integerAmount: `number`







___

<a id="discountnotifications"></a>

###  discountNotifications

**●  discountNotifications**:  *`Array`.<`object`>* 

*Defined in checkout-sdk.d.ts:486*





___

<a id="giftcertificate"></a>

###  giftCertificate

**●  giftCertificate**:  *`object`* 

*Defined in checkout-sdk.d.ts:491*


#### Type declaration




 appliedGiftCertificates: [InternalGiftCertificate](internalgiftcertificate.md)[]






 totalDiscountedAmount: `number`







___

<a id="grandtotal"></a>

###  grandTotal

**●  grandTotal**:  *`object`* 

*Defined in checkout-sdk.d.ts:521*


#### Type declaration




 amount: `number`






 integerAmount: `number`







___

<a id="handling"></a>

###  handling

**●  handling**:  *`object`* 

*Defined in checkout-sdk.d.ts:517*


#### Type declaration




 amount: `number`






 integerAmount: `number`







___

<a id="hasdigitalitems"></a>

###  hasDigitalItems

**●  hasDigitalItems**:  *`boolean`* 

*Inherited from [InternalIncompleteOrder](internalincompleteorder.md).[hasDigitalItems](internalincompleteorder.md#hasdigitalitems)*

*Defined in checkout-sdk.d.ts:442*





___

<a id="id"></a>

###  id

**●  id**:  *`number`* 

*Defined in checkout-sdk.d.ts:470*





___

<a id="iscomplete"></a>

###  isComplete

**●  isComplete**:  *`boolean`* 

*Inherited from [InternalIncompleteOrder](internalincompleteorder.md).[isComplete](internalincompleteorder.md#iscomplete)*

*Defined in checkout-sdk.d.ts:444*





___

<a id="isdownloadable"></a>

###  isDownloadable

**●  isDownloadable**:  *`boolean`* 

*Inherited from [InternalIncompleteOrder](internalincompleteorder.md).[isDownloadable](internalincompleteorder.md#isdownloadable)*

*Defined in checkout-sdk.d.ts:443*





___

<a id="items"></a>

###  items

**●  items**:  *[InternalLineItem](internallineitem.md)[]* 

*Defined in checkout-sdk.d.ts:471*





___

<a id="orderid"></a>

###  orderId

**●  orderId**:  *`number`* 

*Inherited from [InternalIncompleteOrder](internalincompleteorder.md).[orderId](internalincompleteorder.md#orderid)*

*Defined in checkout-sdk.d.ts:421*





___

<a id="payment"></a>

###  payment

**●  payment**:  *`object`* 

*Inherited from [InternalIncompleteOrder](internalincompleteorder.md).[payment](internalincompleteorder.md#payment)*

*Defined in checkout-sdk.d.ts:423*


#### Type declaration




«Optional»  helpText: `undefined`⎮`string`






«Optional»  id: `undefined`⎮`string`






«Optional»  redirectUrl: `undefined`⎮`string`






«Optional»  returnUrl: `undefined`⎮`string`






«Optional»  status: `undefined`⎮`string`







___

<a id="shipping"></a>

###  shipping

**●  shipping**:  *`object`* 

*Defined in checkout-sdk.d.ts:495*


#### Type declaration




 amount: `number`






 amountBeforeDiscount: `number`






 integerAmount: `number`






 integerAmountBeforeDiscount: `number`






 required: `boolean`







___

<a id="socialdata"></a>

###  socialData

**●  socialData**:  *`object`* 

*Inherited from [InternalIncompleteOrder](internalincompleteorder.md).[socialData](internalincompleteorder.md#socialdata)*

*Defined in checkout-sdk.d.ts:430*


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

**●  status**:  *`string`* 

*Inherited from [InternalIncompleteOrder](internalincompleteorder.md).[status](internalincompleteorder.md#status-1)*

*Defined in checkout-sdk.d.ts:440*





___

<a id="storecredit"></a>

###  storeCredit

**●  storeCredit**:  *`object`* 

*Defined in checkout-sdk.d.ts:502*


#### Type declaration




 amount: `number`







___

<a id="subtotal"></a>

###  subtotal

**●  subtotal**:  *`object`* 

*Defined in checkout-sdk.d.ts:474*


#### Type declaration




 amount: `number`






 integerAmount: `number`







___

<a id="taxsubtotal"></a>

###  taxSubtotal

**●  taxSubtotal**:  *`object`* 

*Defined in checkout-sdk.d.ts:505*


#### Type declaration




 amount: `number`






 integerAmount: `number`







___

<a id="taxtotal"></a>

###  taxTotal

**●  taxTotal**:  *`object`* 

*Defined in checkout-sdk.d.ts:513*


#### Type declaration




 amount: `number`






 integerAmount: `number`







___

<a id="taxes"></a>

###  taxes

**●  taxes**:  *`Array`.<`object`>* 

*Defined in checkout-sdk.d.ts:509*





___

<a id="token"></a>

###  token

**●  token**:  *`string`* 

*Inherited from [InternalIncompleteOrder](internalincompleteorder.md).[token](internalincompleteorder.md#token)*

*Defined in checkout-sdk.d.ts:422*





___


