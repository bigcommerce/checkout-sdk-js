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

*Defined in [checkout-sdk.d.ts:445](https://github.com/bigcommerce/checkout-sdk-js/blob/1f51420/dist/checkout-sdk.d.ts#L445)*





___

<a id="coupon"></a>

###  coupon

**●  coupon**:  *`object`* 

*Defined in [checkout-sdk.d.ts:478](https://github.com/bigcommerce/checkout-sdk-js/blob/1f51420/dist/checkout-sdk.d.ts#L478)*


#### Type declaration




 coupons: [InternalCoupon](internalcoupon.md)[]






 discountedAmount: `number`







___

<a id="currency"></a>

###  currency

**●  currency**:  *`string`* 

*Defined in [checkout-sdk.d.ts:472](https://github.com/bigcommerce/checkout-sdk-js/blob/1f51420/dist/checkout-sdk.d.ts#L472)*





___

<a id="customercanbecreated"></a>

###  customerCanBeCreated

**●  customerCanBeCreated**:  *`boolean`* 

*Defined in [checkout-sdk.d.ts:473](https://github.com/bigcommerce/checkout-sdk-js/blob/1f51420/dist/checkout-sdk.d.ts#L473)*





___

<a id="customercreated"></a>

###  customerCreated

**●  customerCreated**:  *`boolean`* 

*Inherited from [InternalIncompleteOrder](internalincompleteorder.md).[customerCreated](internalincompleteorder.md#customercreated)*

*Defined in [checkout-sdk.d.ts:441](https://github.com/bigcommerce/checkout-sdk-js/blob/1f51420/dist/checkout-sdk.d.ts#L441)*





___

<a id="discount"></a>

###  discount

**●  discount**:  *`object`* 

*Defined in [checkout-sdk.d.ts:482](https://github.com/bigcommerce/checkout-sdk-js/blob/1f51420/dist/checkout-sdk.d.ts#L482)*


#### Type declaration




 amount: `number`






 integerAmount: `number`







___

<a id="discountnotifications"></a>

###  discountNotifications

**●  discountNotifications**:  *`Array`.<`object`>* 

*Defined in [checkout-sdk.d.ts:486](https://github.com/bigcommerce/checkout-sdk-js/blob/1f51420/dist/checkout-sdk.d.ts#L486)*





___

<a id="giftcertificate"></a>

###  giftCertificate

**●  giftCertificate**:  *`object`* 

*Defined in [checkout-sdk.d.ts:491](https://github.com/bigcommerce/checkout-sdk-js/blob/1f51420/dist/checkout-sdk.d.ts#L491)*


#### Type declaration




 appliedGiftCertificates: [InternalGiftCertificate](internalgiftcertificate.md)[]






 totalDiscountedAmount: `number`







___

<a id="grandtotal"></a>

###  grandTotal

**●  grandTotal**:  *`object`* 

*Defined in [checkout-sdk.d.ts:521](https://github.com/bigcommerce/checkout-sdk-js/blob/1f51420/dist/checkout-sdk.d.ts#L521)*


#### Type declaration




 amount: `number`






 integerAmount: `number`







___

<a id="handling"></a>

###  handling

**●  handling**:  *`object`* 

*Defined in [checkout-sdk.d.ts:517](https://github.com/bigcommerce/checkout-sdk-js/blob/1f51420/dist/checkout-sdk.d.ts#L517)*


#### Type declaration




 amount: `number`






 integerAmount: `number`







___

<a id="hasdigitalitems"></a>

###  hasDigitalItems

**●  hasDigitalItems**:  *`boolean`* 

*Inherited from [InternalIncompleteOrder](internalincompleteorder.md).[hasDigitalItems](internalincompleteorder.md#hasdigitalitems)*

*Defined in [checkout-sdk.d.ts:442](https://github.com/bigcommerce/checkout-sdk-js/blob/1f51420/dist/checkout-sdk.d.ts#L442)*





___

<a id="id"></a>

###  id

**●  id**:  *`number`* 

*Defined in [checkout-sdk.d.ts:470](https://github.com/bigcommerce/checkout-sdk-js/blob/1f51420/dist/checkout-sdk.d.ts#L470)*





___

<a id="iscomplete"></a>

###  isComplete

**●  isComplete**:  *`boolean`* 

*Inherited from [InternalIncompleteOrder](internalincompleteorder.md).[isComplete](internalincompleteorder.md#iscomplete)*

*Defined in [checkout-sdk.d.ts:444](https://github.com/bigcommerce/checkout-sdk-js/blob/1f51420/dist/checkout-sdk.d.ts#L444)*





___

<a id="isdownloadable"></a>

###  isDownloadable

**●  isDownloadable**:  *`boolean`* 

*Inherited from [InternalIncompleteOrder](internalincompleteorder.md).[isDownloadable](internalincompleteorder.md#isdownloadable)*

*Defined in [checkout-sdk.d.ts:443](https://github.com/bigcommerce/checkout-sdk-js/blob/1f51420/dist/checkout-sdk.d.ts#L443)*





___

<a id="items"></a>

###  items

**●  items**:  *[InternalLineItem](internallineitem.md)[]* 

*Defined in [checkout-sdk.d.ts:471](https://github.com/bigcommerce/checkout-sdk-js/blob/1f51420/dist/checkout-sdk.d.ts#L471)*





___

<a id="orderid"></a>

###  orderId

**●  orderId**:  *`number`* 

*Inherited from [InternalIncompleteOrder](internalincompleteorder.md).[orderId](internalincompleteorder.md#orderid)*

*Defined in [checkout-sdk.d.ts:421](https://github.com/bigcommerce/checkout-sdk-js/blob/1f51420/dist/checkout-sdk.d.ts#L421)*





___

<a id="payment"></a>

###  payment

**●  payment**:  *`object`* 

*Inherited from [InternalIncompleteOrder](internalincompleteorder.md).[payment](internalincompleteorder.md#payment)*

*Defined in [checkout-sdk.d.ts:423](https://github.com/bigcommerce/checkout-sdk-js/blob/1f51420/dist/checkout-sdk.d.ts#L423)*


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

*Defined in [checkout-sdk.d.ts:495](https://github.com/bigcommerce/checkout-sdk-js/blob/1f51420/dist/checkout-sdk.d.ts#L495)*


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

*Defined in [checkout-sdk.d.ts:430](https://github.com/bigcommerce/checkout-sdk-js/blob/1f51420/dist/checkout-sdk.d.ts#L430)*


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

*Defined in [checkout-sdk.d.ts:440](https://github.com/bigcommerce/checkout-sdk-js/blob/1f51420/dist/checkout-sdk.d.ts#L440)*





___

<a id="storecredit"></a>

###  storeCredit

**●  storeCredit**:  *`object`* 

*Defined in [checkout-sdk.d.ts:502](https://github.com/bigcommerce/checkout-sdk-js/blob/1f51420/dist/checkout-sdk.d.ts#L502)*


#### Type declaration




 amount: `number`







___

<a id="subtotal"></a>

###  subtotal

**●  subtotal**:  *`object`* 

*Defined in [checkout-sdk.d.ts:474](https://github.com/bigcommerce/checkout-sdk-js/blob/1f51420/dist/checkout-sdk.d.ts#L474)*


#### Type declaration




 amount: `number`






 integerAmount: `number`







___

<a id="taxsubtotal"></a>

###  taxSubtotal

**●  taxSubtotal**:  *`object`* 

*Defined in [checkout-sdk.d.ts:505](https://github.com/bigcommerce/checkout-sdk-js/blob/1f51420/dist/checkout-sdk.d.ts#L505)*


#### Type declaration




 amount: `number`






 integerAmount: `number`







___

<a id="taxtotal"></a>

###  taxTotal

**●  taxTotal**:  *`object`* 

*Defined in [checkout-sdk.d.ts:513](https://github.com/bigcommerce/checkout-sdk-js/blob/1f51420/dist/checkout-sdk.d.ts#L513)*


#### Type declaration




 amount: `number`






 integerAmount: `number`







___

<a id="taxes"></a>

###  taxes

**●  taxes**:  *`Array`.<`object`>* 

*Defined in [checkout-sdk.d.ts:509](https://github.com/bigcommerce/checkout-sdk-js/blob/1f51420/dist/checkout-sdk.d.ts#L509)*





___

<a id="token"></a>

###  token

**●  token**:  *`string`* 

*Inherited from [InternalIncompleteOrder](internalincompleteorder.md).[token](internalincompleteorder.md#token)*

*Defined in [checkout-sdk.d.ts:422](https://github.com/bigcommerce/checkout-sdk-js/blob/1f51420/dist/checkout-sdk.d.ts#L422)*





___


