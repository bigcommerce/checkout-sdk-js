[@bigcommerce/checkout-sdk](../README.md) > [CheckoutStoreStatusSelector](../interfaces/checkoutstorestatusselector.md)

# CheckoutStoreStatusSelector

Responsible for checking the statuses of various asynchronous actions related to checkout.

This object has a set of getters that return true if an action is in progress. For example, you can check whether a customer is submitting an order and waiting for the request to complete.

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

Checks whether the current customer is applying a coupon code.

**Returns:** `boolean`
True if applying a coupon code, otherwise false.

___
<a id="isapplyinggiftcertificate"></a>

###  isApplyingGiftCertificate

▸ **isApplyingGiftCertificate**(): `boolean`

Checks whether the current customer is applying a gift certificate.

**Returns:** `boolean`
True if applying a gift certificate, otherwise false.

___
<a id="isapplyingstorecredit"></a>

###  isApplyingStoreCredit

▸ **isApplyingStoreCredit**(): `boolean`

Checks whether the current customer is applying store credit.

**Returns:** `boolean`
True if applying store credit, otherwise false.

___
<a id="iscontinuingasguest"></a>

###  isContinuingAsGuest

▸ **isContinuingAsGuest**(): `boolean`

Checks whether the shopper is continuing out as a guest.

**Returns:** `boolean`
True if continuing as guest, otherwise false.

___
<a id="iscreatingconsignments"></a>

###  isCreatingConsignments

▸ **isCreatingConsignments**(): `boolean`

Checks whether a given/any consignment is being updated.

A consignment ID should be provided when checking for a specific consignment, otherwise it will check for any consignment.

**Returns:** `boolean`
True if creating consignments, otherwise false.

___
<a id="iscustomersteppending"></a>

###  isCustomerStepPending

▸ **isCustomerStepPending**(): `boolean`

Checks whether the customer step of a checkout is in a pending state.

The customer step is considered to be pending if it is in the process of initializing, signing in, signing out, and/or interacting with a customer widget.

**Returns:** `boolean`
True if the customer step is pending, otherwise false.

___
<a id="isdeletingconsignment"></a>

###  isDeletingConsignment

▸ **isDeletingConsignment**(consignmentId?: * `undefined` &#124; `string`*): `boolean`

Checks whether a given/any consignment is being deleted.

A consignment ID should be provided when checking for a specific consignment, otherwise it will check for any consignment.

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

Checks whether the current customer is deleting a payment instrument.

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

Checks whether spam check is executing.

**Returns:** `boolean`
True if the current checkout is being updated, otherwise false.

___
<a id="isfinalizingorder"></a>

###  isFinalizingOrder

▸ **isFinalizingOrder**(): `boolean`

Checks whether the current order is finalizing.

**Returns:** `boolean`
True if the current order is finalizing, otherwise false.

___
<a id="isinitializingcustomer"></a>

###  isInitializingCustomer

▸ **isInitializingCustomer**(methodId?: * `undefined` &#124; `string`*): `boolean`

Checks whether the customer step is initializing.

If an ID is provided, the method also checks whether the customer step is initializing using a specific customer method with the same ID.

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

Checks whether a specific or any payment method is initializing.

The method returns true if no ID is provided and at least one payment method is initializing.

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

Checks whether the shipping step of a checkout process is initializing.

If an identifier is provided, the method also checks whether the shipping step is initializing using a specific shipping method with the same identifier.

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

Checks whether billing countries are loading.

**Returns:** `boolean`
True if billing countries are loading, otherwise false.

___
<a id="isloadingcart"></a>

###  isLoadingCart

▸ **isLoadingCart**(): `boolean`

Checks whether the current cart is loading.

**Returns:** `boolean`
True if the current cart is loading, otherwise false.

___
<a id="isloadingcheckout"></a>

###  isLoadingCheckout

▸ **isLoadingCheckout**(): `boolean`

Checks whether the current checkout is loading.

**Returns:** `boolean`
True if the current checkout is loading, otherwise false.

___
<a id="isloadingconfig"></a>

###  isLoadingConfig

▸ **isLoadingConfig**(): `boolean`

Checks whether the checkout configuration of a store is loading.

**Returns:** `boolean`
True if the configuration is loading, otherwise false.

___
<a id="isloadinginstruments"></a>

###  isLoadingInstruments

▸ **isLoadingInstruments**(): `boolean`

Checks whether the current customer's payment instruments are loading.

**Returns:** `boolean`
True if payment instruments are loading, otherwise false.

___
<a id="isloadingorder"></a>

###  isLoadingOrder

▸ **isLoadingOrder**(): `boolean`

Checks whether the current order is loading.

**Returns:** `boolean`
True if the current order is loading, otherwise false.

___
<a id="isloadingpaymentmethod"></a>

###  isLoadingPaymentMethod

▸ **isLoadingPaymentMethod**(methodId?: * `undefined` &#124; `string`*): `boolean`

Checks whether a specific or any payment method is loading.

The method returns true if no ID is provided and at least one payment method is loading.

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

Checks whether payment methods are loading.

**Returns:** `boolean`
True if payment methods are loading, otherwise false.

___
<a id="isloadingshippingcountries"></a>

###  isLoadingShippingCountries

▸ **isLoadingShippingCountries**(): `boolean`

Checks whether shipping countries are loading.

**Returns:** `boolean`
True if shipping countries are loading, otherwise false.

___
<a id="isloadingshippingoptions"></a>

###  isLoadingShippingOptions

▸ **isLoadingShippingOptions**(): `boolean`

Checks whether shipping options are loading.

**Returns:** `boolean`
True if shipping options are loading, otherwise false.

___
<a id="ispaymentsteppending"></a>

###  isPaymentStepPending

▸ **isPaymentStepPending**(): `boolean`

Checks whether the payment step of a checkout is in a pending state.

The payment step is considered to be pending if it is in the process of initializing, submitting an order, finalizing an order, and/or interacting with a payment widget.

**Returns:** `boolean`
True if the payment step is pending, otherwise false.

___
<a id="ispending"></a>

###  isPending

▸ **isPending**(): `boolean`

Checks whether any checkout action is pending.

**Returns:** `boolean`
True if there is a pending action, otherwise false.

___
<a id="isremovingcoupon"></a>

###  isRemovingCoupon

▸ **isRemovingCoupon**(): `boolean`

Checks whether the current customer is removing a coupon code.

**Returns:** `boolean`
True if removing a coupon code, otherwise false.

___
<a id="isremovinggiftcertificate"></a>

###  isRemovingGiftCertificate

▸ **isRemovingGiftCertificate**(): `boolean`

Checks whether the current customer is removing a gift certificate.

**Returns:** `boolean`
True if removing a gift certificate, otherwise false.

___
<a id="isselectingshippingoption"></a>

###  isSelectingShippingOption

▸ **isSelectingShippingOption**(consignmentId?: * `undefined` &#124; `string`*): `boolean`

Checks whether a shipping option is being selected.

A consignment ID should be provided when checking if a shipping option is being selected for a specific consignment, otherwise it will check for all consignments.

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

Checks whether a sign-in email is being sent.

**Returns:** `boolean`
True if sending a sign-in email, otherwise false

___
<a id="issigningin"></a>

###  isSigningIn

▸ **isSigningIn**(methodId?: * `undefined` &#124; `string`*): `boolean`

Checks whether the current customer is signing in.

If an ID is provided, the method also checks whether the customer is signing in using a specific customer method with the same ID.

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

Checks whether the current customer is signing out.

If an ID is provided, the method also checks whether the customer is signing out using a specific customer method with the same ID.

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

Checks whether the current order is submitting.

**Returns:** `boolean`
True if the current order is submitting, otherwise false.

___
<a id="isupdatingbillingaddress"></a>

###  isUpdatingBillingAddress

▸ **isUpdatingBillingAddress**(): `boolean`

Checks whether the billing address is being updated.

**Returns:** `boolean`
True if updating their billing address, otherwise false.

___
<a id="isupdatingcheckout"></a>

###  isUpdatingCheckout

▸ **isUpdatingCheckout**(): `boolean`

Checks whether the current checkout is being updated.

**Returns:** `boolean`
True if the current checkout is being updated, otherwise false.

___
<a id="isupdatingconsignment"></a>

###  isUpdatingConsignment

▸ **isUpdatingConsignment**(consignmentId?: * `undefined` &#124; `string`*): `boolean`

Checks whether a given/any consignment is being updated.

A consignment ID should be provided when checking for a specific consignment, otherwise it will check for any consignment.

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

Checks the shipping address is being updated.

**Returns:** `boolean`
True if updating their shipping address, otherwise false.

___
<a id="isupdatingsubscriptions"></a>

###  isUpdatingSubscriptions

▸ **isUpdatingSubscriptions**(): `boolean`

Checks whether the subscriptions are being updated.

**Returns:** `boolean`
True if updating subscriptions, otherwise false.

___

