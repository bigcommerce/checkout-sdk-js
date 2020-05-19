[@bigcommerce/checkout-sdk](../README.md) > [CheckoutStoreStatusSelector](../interfaces/checkoutstorestatusselector.md)

# CheckoutStoreStatusSelector

## Hierarchy

**CheckoutStoreStatusSelector**

## Index

### Methods

* [isApplyingCoupon](checkoutstorestatusselector.md#isapplyingcoupon)
* [isApplyingGiftCertificate](checkoutstorestatusselector.md#isapplyinggiftcertificate)
* [isApplyingStoreCredit](checkoutstorestatusselector.md#isapplyingstorecredit)
* [isContinuingAsGuest](checkoutstorestatusselector.md#iscontinuingasguest)
* [isCreatingConsignments](checkoutstorestatusselector.md#iscreatingconsignments)
* [isCustomerStepPending](checkoutstorestatusselector.md#iscustomersteppending)
* [isDeletingConsignment](checkoutstorestatusselector.md#isdeletingconsignment)
* [isDeletingInstrument](checkoutstorestatusselector.md#isdeletinginstrument)
* [isExecutingSpamCheck](checkoutstorestatusselector.md#isexecutingspamcheck)
* [isFinalizingOrder](checkoutstorestatusselector.md#isfinalizingorder)
* [isInitializingCustomer](checkoutstorestatusselector.md#isinitializingcustomer)
* [isInitializingPayment](checkoutstorestatusselector.md#isinitializingpayment)
* [isInitializingShipping](checkoutstorestatusselector.md#isinitializingshipping)
* [isLoadingBillingCountries](checkoutstorestatusselector.md#isloadingbillingcountries)
* [isLoadingCart](checkoutstorestatusselector.md#isloadingcart)
* [isLoadingCheckout](checkoutstorestatusselector.md#isloadingcheckout)
* [isLoadingConfig](checkoutstorestatusselector.md#isloadingconfig)
* [isLoadingInstruments](checkoutstorestatusselector.md#isloadinginstruments)
* [isLoadingOrder](checkoutstorestatusselector.md#isloadingorder)
* [isLoadingPaymentMethod](checkoutstorestatusselector.md#isloadingpaymentmethod)
* [isLoadingPaymentMethods](checkoutstorestatusselector.md#isloadingpaymentmethods)
* [isLoadingShippingCountries](checkoutstorestatusselector.md#isloadingshippingcountries)
* [isLoadingShippingOptions](checkoutstorestatusselector.md#isloadingshippingoptions)
* [isPaymentStepPending](checkoutstorestatusselector.md#ispaymentsteppending)
* [isPending](checkoutstorestatusselector.md#ispending)
* [isRemovingCoupon](checkoutstorestatusselector.md#isremovingcoupon)
* [isRemovingGiftCertificate](checkoutstorestatusselector.md#isremovinggiftcertificate)
* [isSelectingShippingOption](checkoutstorestatusselector.md#isselectingshippingoption)
* [isSendingSignInEmail](checkoutstorestatusselector.md#issendingsigninemail)
* [isSigningIn](checkoutstorestatusselector.md#issigningin)
* [isSigningOut](checkoutstorestatusselector.md#issigningout)
* [isSubmittingOrder](checkoutstorestatusselector.md#issubmittingorder)
* [isUpdatingBillingAddress](checkoutstorestatusselector.md#isupdatingbillingaddress)
* [isUpdatingCheckout](checkoutstorestatusselector.md#isupdatingcheckout)
* [isUpdatingConsignment](checkoutstorestatusselector.md#isupdatingconsignment)
* [isUpdatingShippingAddress](checkoutstorestatusselector.md#isupdatingshippingaddress)
* [isUpdatingSubscriptions](checkoutstorestatusselector.md#isupdatingsubscriptions)

---

## Methods

<a id="isapplyingcoupon"></a>

###  isApplyingCoupon

▸ **isApplyingCoupon**(): `boolean`

**Returns:** `boolean`
True if applying a coupon code, otherwise false.

___
<a id="isapplyinggiftcertificate"></a>

###  isApplyingGiftCertificate

▸ **isApplyingGiftCertificate**(): `boolean`

**Returns:** `boolean`
True if applying a gift certificate, otherwise false.

___
<a id="isapplyingstorecredit"></a>

###  isApplyingStoreCredit

▸ **isApplyingStoreCredit**(): `boolean`

**Returns:** `boolean`
True if applying store credit, otherwise false.

___
<a id="iscontinuingasguest"></a>

###  isContinuingAsGuest

▸ **isContinuingAsGuest**(): `boolean`

**Returns:** `boolean`
True if continuing as guest, otherwise false.

___
<a id="iscreatingconsignments"></a>

###  isCreatingConsignments

▸ **isCreatingConsignments**(): `boolean`

**Returns:** `boolean`
True if creating consignments, otherwise false.

___
<a id="iscustomersteppending"></a>

###  isCustomerStepPending

▸ **isCustomerStepPending**(): `boolean`

**Returns:** `boolean`
True if the customer step is pending, otherwise false.

___
<a id="isdeletingconsignment"></a>

###  isDeletingConsignment

▸ **isDeletingConsignment**(consignmentId?: * `undefined` &#124; `string`*): `boolean`

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| `Optional` consignmentId |  `undefined` &#124; `string`|  The identifier of the consignment to be checked. |

**Returns:** `boolean`
True if deleting consignment(s), otherwise false.

___
<a id="isdeletinginstrument"></a>

###  isDeletingInstrument

▸ **isDeletingInstrument**(instrumentId?: * `undefined` &#124; `string`*): `boolean`

**Parameters:**

| Param | Type |
| ------ | ------ |
| `Optional` instrumentId |  `undefined` &#124; `string`|

**Returns:** `boolean`
True if deleting a payment instrument, otherwise false.

___
<a id="isexecutingspamcheck"></a>

###  isExecutingSpamCheck

▸ **isExecutingSpamCheck**(): `boolean`

**Returns:** `boolean`
True if the current checkout is being updated, otherwise false.

___
<a id="isfinalizingorder"></a>

###  isFinalizingOrder

▸ **isFinalizingOrder**(): `boolean`

**Returns:** `boolean`
True if the current order is finalizing, otherwise false.

___
<a id="isinitializingcustomer"></a>

###  isInitializingCustomer

▸ **isInitializingCustomer**(methodId?: * `undefined` &#124; `string`*): `boolean`

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| `Optional` methodId |  `undefined` &#124; `string`|  The identifier of the method used for initializing the customer step of checkout. |

**Returns:** `boolean`
True if the customer step is initializing, otherwise false.

___
<a id="isinitializingpayment"></a>

###  isInitializingPayment

▸ **isInitializingPayment**(methodId?: * `undefined` &#124; `string`*): `boolean`

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| `Optional` methodId |  `undefined` &#124; `string`|  The identifier of the payment method to check. |

**Returns:** `boolean`
True if the payment method is initializing, otherwise false.

___
<a id="isinitializingshipping"></a>

###  isInitializingShipping

▸ **isInitializingShipping**(methodId?: * `undefined` &#124; `string`*): `boolean`

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| `Optional` methodId |  `undefined` &#124; `string`|  The identifer of the initialization method to check. |

**Returns:** `boolean`
True if the shipping step is initializing, otherwise false.

___
<a id="isloadingbillingcountries"></a>

###  isLoadingBillingCountries

▸ **isLoadingBillingCountries**(): `boolean`

**Returns:** `boolean`
True if billing countries are loading, otherwise false.

___
<a id="isloadingcart"></a>

###  isLoadingCart

▸ **isLoadingCart**(): `boolean`

**Returns:** `boolean`
True if the current cart is loading, otherwise false.

___
<a id="isloadingcheckout"></a>

###  isLoadingCheckout

▸ **isLoadingCheckout**(): `boolean`

**Returns:** `boolean`
True if the current checkout is loading, otherwise false.

___
<a id="isloadingconfig"></a>

###  isLoadingConfig

▸ **isLoadingConfig**(): `boolean`

**Returns:** `boolean`
True if the configuration is loading, otherwise false.

___
<a id="isloadinginstruments"></a>

###  isLoadingInstruments

▸ **isLoadingInstruments**(): `boolean`

**Returns:** `boolean`
True if payment instruments are loading, otherwise false.

___
<a id="isloadingorder"></a>

###  isLoadingOrder

▸ **isLoadingOrder**(): `boolean`

**Returns:** `boolean`
True if the current order is loading, otherwise false.

___
<a id="isloadingpaymentmethod"></a>

###  isLoadingPaymentMethod

▸ **isLoadingPaymentMethod**(methodId?: * `undefined` &#124; `string`*): `boolean`

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| `Optional` methodId |  `undefined` &#124; `string`|  The identifier of the payment method to check. |

**Returns:** `boolean`
True if the payment method is loading, otherwise false.

___
<a id="isloadingpaymentmethods"></a>

###  isLoadingPaymentMethods

▸ **isLoadingPaymentMethods**(): `boolean`

**Returns:** `boolean`
True if payment methods are loading, otherwise false.

___
<a id="isloadingshippingcountries"></a>

###  isLoadingShippingCountries

▸ **isLoadingShippingCountries**(): `boolean`

**Returns:** `boolean`
True if shipping countries are loading, otherwise false.

___
<a id="isloadingshippingoptions"></a>

###  isLoadingShippingOptions

▸ **isLoadingShippingOptions**(): `boolean`

**Returns:** `boolean`
True if shipping options are loading, otherwise false.

___
<a id="ispaymentsteppending"></a>

###  isPaymentStepPending

▸ **isPaymentStepPending**(): `boolean`

**Returns:** `boolean`
True if the payment step is pending, otherwise false.

___
<a id="ispending"></a>

###  isPending

▸ **isPending**(): `boolean`

**Returns:** `boolean`
True if there is a pending action, otherwise false.

___
<a id="isremovingcoupon"></a>

###  isRemovingCoupon

▸ **isRemovingCoupon**(): `boolean`

**Returns:** `boolean`
True if removing a coupon code, otherwise false.

___
<a id="isremovinggiftcertificate"></a>

###  isRemovingGiftCertificate

▸ **isRemovingGiftCertificate**(): `boolean`

**Returns:** `boolean`
True if removing a gift certificate, otherwise false.

___
<a id="isselectingshippingoption"></a>

###  isSelectingShippingOption

▸ **isSelectingShippingOption**(consignmentId?: * `undefined` &#124; `string`*): `boolean`

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| `Optional` consignmentId |  `undefined` &#124; `string`|  The identifier of the consignment to be checked. |

**Returns:** `boolean`
True if selecting a shipping option, otherwise false.

___
<a id="issendingsigninemail"></a>

###  isSendingSignInEmail

▸ **isSendingSignInEmail**(): `boolean`

**Returns:** `boolean`
True if sending a sign-in email, otherwise false

___
<a id="issigningin"></a>

###  isSigningIn

▸ **isSigningIn**(methodId?: * `undefined` &#124; `string`*): `boolean`

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| `Optional` methodId |  `undefined` &#124; `string`|  The identifier of the method used for signing in the current customer. |

**Returns:** `boolean`
True if the customer is signing in, otherwise false.

___
<a id="issigningout"></a>

###  isSigningOut

▸ **isSigningOut**(methodId?: * `undefined` &#124; `string`*): `boolean`

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| `Optional` methodId |  `undefined` &#124; `string`|  The identifier of the method used for signing out the current customer. |

**Returns:** `boolean`
True if the customer is signing out, otherwise false.

___
<a id="issubmittingorder"></a>

###  isSubmittingOrder

▸ **isSubmittingOrder**(): `boolean`

**Returns:** `boolean`
True if the current order is submitting, otherwise false.

___
<a id="isupdatingbillingaddress"></a>

###  isUpdatingBillingAddress

▸ **isUpdatingBillingAddress**(): `boolean`

**Returns:** `boolean`
True if updating their billing address, otherwise false.

___
<a id="isupdatingcheckout"></a>

###  isUpdatingCheckout

▸ **isUpdatingCheckout**(): `boolean`

**Returns:** `boolean`
True if the current checkout is being updated, otherwise false.

___
<a id="isupdatingconsignment"></a>

###  isUpdatingConsignment

▸ **isUpdatingConsignment**(consignmentId?: * `undefined` &#124; `string`*): `boolean`

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| `Optional` consignmentId |  `undefined` &#124; `string`|  The identifier of the consignment to be checked. |

**Returns:** `boolean`
True if updating consignment(s), otherwise false.

___
<a id="isupdatingshippingaddress"></a>

###  isUpdatingShippingAddress

▸ **isUpdatingShippingAddress**(): `boolean`

**Returns:** `boolean`
True if updating their shipping address, otherwise false.

___
<a id="isupdatingsubscriptions"></a>

###  isUpdatingSubscriptions

▸ **isUpdatingSubscriptions**(): `boolean`

**Returns:** `boolean`
True if updating subscriptions, otherwise false.

___

