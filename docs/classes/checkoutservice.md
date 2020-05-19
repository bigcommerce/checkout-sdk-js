[@bigcommerce/checkout-sdk](../README.md) > [CheckoutService](../classes/checkoutservice.md)

# CheckoutService

## Hierarchy

**CheckoutService**

## Index

### Methods

* [applyCoupon](checkoutservice.md#applycoupon)
* [applyGiftCertificate](checkoutservice.md#applygiftcertificate)
* [applyStoreCredit](checkoutservice.md#applystorecredit)
* [assignItemsToAddress](checkoutservice.md#assignitemstoaddress)
* [clearError](checkoutservice.md#clearerror)
* [continueAsGuest](checkoutservice.md#continueasguest)
* [createConsignments](checkoutservice.md#createconsignments)
* [deinitializeCustomer](checkoutservice.md#deinitializecustomer)
* [deinitializePayment](checkoutservice.md#deinitializepayment)
* [deinitializeShipping](checkoutservice.md#deinitializeshipping)
* [deleteConsignment](checkoutservice.md#deleteconsignment)
* [deleteInstrument](checkoutservice.md#deleteinstrument)
* [executeSpamCheck](checkoutservice.md#executespamcheck)
* [finalizeOrderIfNeeded](checkoutservice.md#finalizeorderifneeded)
* [getState](checkoutservice.md#getstate)
* [initializeCustomer](checkoutservice.md#initializecustomer)
* [initializePayment](checkoutservice.md#initializepayment)
* [initializeShipping](checkoutservice.md#initializeshipping)
* [initializeSpamProtection](checkoutservice.md#initializespamprotection)
* [loadBillingAddressFields](checkoutservice.md#loadbillingaddressfields)
* [loadBillingCountries](checkoutservice.md#loadbillingcountries)
* [loadCheckout](checkoutservice.md#loadcheckout)
* [loadInstruments](checkoutservice.md#loadinstruments)
* [loadOrder](checkoutservice.md#loadorder)
* [loadPaymentMethods](checkoutservice.md#loadpaymentmethods)
* [loadShippingAddressFields](checkoutservice.md#loadshippingaddressfields)
* [loadShippingCountries](checkoutservice.md#loadshippingcountries)
* [loadShippingOptions](checkoutservice.md#loadshippingoptions)
* [notifyState](checkoutservice.md#notifystate)
* [removeCoupon](checkoutservice.md#removecoupon)
* [removeGiftCertificate](checkoutservice.md#removegiftcertificate)
* [selectConsignmentShippingOption](checkoutservice.md#selectconsignmentshippingoption)
* [selectShippingOption](checkoutservice.md#selectshippingoption)
* [signInCustomer](checkoutservice.md#signincustomer)
* [signOutCustomer](checkoutservice.md#signoutcustomer)
* [submitOrder](checkoutservice.md#submitorder)
* [subscribe](checkoutservice.md#subscribe)
* [unassignItemsToAddress](checkoutservice.md#unassignitemstoaddress)
* [updateBillingAddress](checkoutservice.md#updatebillingaddress)
* [updateCheckout](checkoutservice.md#updatecheckout)
* [updateConsignment](checkoutservice.md#updateconsignment)
* [updateShippingAddress](checkoutservice.md#updateshippingaddress)
* [updateSubscriptions](checkoutservice.md#updatesubscriptions)

---

## Methods

<a id="applycoupon"></a>

###  applyCoupon

▸ **applyCoupon**(code: *`string`*, options?: *[RequestOptions](../interfaces/requestoptions.md)*): `Promise`<[CheckoutSelectors](../interfaces/checkoutselectors.md)>

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| code | `string` |  The coupon code to apply to the current checkout. |
| `Optional` options | [RequestOptions](../interfaces/requestoptions.md) |  Options for applying the coupon code. |

**Returns:** `Promise`<[CheckoutSelectors](../interfaces/checkoutselectors.md)>
A promise that resolves to the current state.

___
<a id="applygiftcertificate"></a>

###  applyGiftCertificate

▸ **applyGiftCertificate**(code: *`string`*, options?: *[RequestOptions](../interfaces/requestoptions.md)*): `Promise`<[CheckoutSelectors](../interfaces/checkoutselectors.md)>

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| code | `string` |  The gift certificate to apply to the current checkout. |
| `Optional` options | [RequestOptions](../interfaces/requestoptions.md) |  Options for applying the gift certificate. |

**Returns:** `Promise`<[CheckoutSelectors](../interfaces/checkoutselectors.md)>
A promise that resolves to the current state.

___
<a id="applystorecredit"></a>

###  applyStoreCredit

▸ **applyStoreCredit**(useStoreCredit: *`boolean`*, options?: *[RequestOptions](../interfaces/requestoptions.md)*): `Promise`<[CheckoutSelectors](../interfaces/checkoutselectors.md)>

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| useStoreCredit | `boolean` |
| `Optional` options | [RequestOptions](../interfaces/requestoptions.md) |  Options for applying store credit. |

**Returns:** `Promise`<[CheckoutSelectors](../interfaces/checkoutselectors.md)>
A promise that resolves to the current state.

___
<a id="assignitemstoaddress"></a>

###  assignItemsToAddress

▸ **assignItemsToAddress**(consignment: *[ConsignmentAssignmentRequestBody](../interfaces/consignmentassignmentrequestbody.md)*, options?: *[RequestOptions](../interfaces/requestoptions.md)*): `Promise`<[CheckoutSelectors](../interfaces/checkoutselectors.md)>

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| consignment | [ConsignmentAssignmentRequestBody](../interfaces/consignmentassignmentrequestbody.md) |  The consignment data that will be used. |
| `Optional` options | [RequestOptions](../interfaces/requestoptions.md) |  Options for the request |

**Returns:** `Promise`<[CheckoutSelectors](../interfaces/checkoutselectors.md)>
A promise that resolves to the current state.

___
<a id="clearerror"></a>

###  clearError

▸ **clearError**(error: *`Error`*): `Promise`<[CheckoutSelectors](../interfaces/checkoutselectors.md)>

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| error | `Error` |  Specific error object to clear |

**Returns:** `Promise`<[CheckoutSelectors](../interfaces/checkoutselectors.md)>
A promise that resolves to the current state.

___
<a id="continueasguest"></a>

###  continueAsGuest

▸ **continueAsGuest**(credentials: *[GuestCredentials](../#guestcredentials)*, options?: *[RequestOptions](../interfaces/requestoptions.md)*): `Promise`<[CheckoutSelectors](../interfaces/checkoutselectors.md)>

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| credentials | [GuestCredentials](../#guestcredentials) |  The guest credentials to use, with optional subscriptions. |
| `Optional` options | [RequestOptions](../interfaces/requestoptions.md) |  Options for continuing as a guest. |

**Returns:** `Promise`<[CheckoutSelectors](../interfaces/checkoutselectors.md)>
A promise that resolves to the current state.

___
<a id="createconsignments"></a>

###  createConsignments

▸ **createConsignments**(consignments: *[ConsignmentsRequestBody](../#consignmentsrequestbody)*, options?: *[RequestOptions](../interfaces/requestoptions.md)*): `Promise`<[CheckoutSelectors](../interfaces/checkoutselectors.md)>

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| consignments | [ConsignmentsRequestBody](../#consignmentsrequestbody) |  The list of consignments to be created. |
| `Optional` options | [RequestOptions](../interfaces/requestoptions.md) |  Options for updating the shipping address. |

**Returns:** `Promise`<[CheckoutSelectors](../interfaces/checkoutselectors.md)>
A promise that resolves to the current state.

___
<a id="deinitializecustomer"></a>

###  deinitializeCustomer

▸ **deinitializeCustomer**(options?: *[CustomerRequestOptions](../interfaces/customerrequestoptions.md)*): `Promise`<[CheckoutSelectors](../interfaces/checkoutselectors.md)>

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| `Optional` options | [CustomerRequestOptions](../interfaces/customerrequestoptions.md) |  Options for deinitializing the customer step of checkout. |

**Returns:** `Promise`<[CheckoutSelectors](../interfaces/checkoutselectors.md)>
A promise that resolves to the current state.

___
<a id="deinitializepayment"></a>

###  deinitializePayment

▸ **deinitializePayment**(options: *[PaymentRequestOptions](../interfaces/paymentrequestoptions.md)*): `Promise`<[CheckoutSelectors](../interfaces/checkoutselectors.md)>

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| options | [PaymentRequestOptions](../interfaces/paymentrequestoptions.md) |  Options for deinitializing the payment step of checkout. |

**Returns:** `Promise`<[CheckoutSelectors](../interfaces/checkoutselectors.md)>
A promise that resolves to the current state.

___
<a id="deinitializeshipping"></a>

###  deinitializeShipping

▸ **deinitializeShipping**(options?: *[ShippingRequestOptions](../interfaces/shippingrequestoptions.md)*): `Promise`<[CheckoutSelectors](../interfaces/checkoutselectors.md)>

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| `Optional` options | [ShippingRequestOptions](../interfaces/shippingrequestoptions.md) |  Options for deinitializing the shipping step of checkout. |

**Returns:** `Promise`<[CheckoutSelectors](../interfaces/checkoutselectors.md)>
A promise that resolves to the current state.

___
<a id="deleteconsignment"></a>

###  deleteConsignment

▸ **deleteConsignment**(consignmentId: *`string`*, options?: *[RequestOptions](../interfaces/requestoptions.md)*): `Promise`<[CheckoutSelectors](../interfaces/checkoutselectors.md)>

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| consignmentId | `string` |  The ID of the consignment to be deleted |
| `Optional` options | [RequestOptions](../interfaces/requestoptions.md) |  Options for the consignment delete request |

**Returns:** `Promise`<[CheckoutSelectors](../interfaces/checkoutselectors.md)>
A promise that resolves to the current state.

___
<a id="deleteinstrument"></a>

###  deleteInstrument

▸ **deleteInstrument**(instrumentId: *`string`*): `Promise`<[CheckoutSelectors](../interfaces/checkoutselectors.md)>

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| instrumentId | `string` |  The identifier of the payment instrument to delete. |

**Returns:** `Promise`<[CheckoutSelectors](../interfaces/checkoutselectors.md)>
A promise that resolves to the current state.

___
<a id="executespamcheck"></a>

###  executeSpamCheck

▸ **executeSpamCheck**(): `Promise`<[CheckoutSelectors](../interfaces/checkoutselectors.md)>

**Returns:** `Promise`<[CheckoutSelectors](../interfaces/checkoutselectors.md)>
A promise that resolves to the current state.

___
<a id="finalizeorderifneeded"></a>

###  finalizeOrderIfNeeded

▸ **finalizeOrderIfNeeded**(options?: *[RequestOptions](../interfaces/requestoptions.md)*): `Promise`<[CheckoutSelectors](../interfaces/checkoutselectors.md)>

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| `Optional` options | [RequestOptions](../interfaces/requestoptions.md) |  Options for finalizing the current order. |

**Returns:** `Promise`<[CheckoutSelectors](../interfaces/checkoutselectors.md)>
A promise that resolves to the current state.

___
<a id="getstate"></a>

###  getState

▸ **getState**(): [CheckoutSelectors](../interfaces/checkoutselectors.md)

**Returns:** [CheckoutSelectors](../interfaces/checkoutselectors.md)
The current customer's checkout state

___
<a id="initializecustomer"></a>

###  initializeCustomer

▸ **initializeCustomer**(options?: *[CustomerInitializeOptions](../interfaces/customerinitializeoptions.md)*): `Promise`<[CheckoutSelectors](../interfaces/checkoutselectors.md)>

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| `Optional` options | [CustomerInitializeOptions](../interfaces/customerinitializeoptions.md) |  Options for initializing the customer step of checkout. |

**Returns:** `Promise`<[CheckoutSelectors](../interfaces/checkoutselectors.md)>
A promise that resolves to the current state.

___
<a id="initializepayment"></a>

###  initializePayment

▸ **initializePayment**(options: *[PaymentInitializeOptions](../interfaces/paymentinitializeoptions.md)*): `Promise`<[CheckoutSelectors](../interfaces/checkoutselectors.md)>

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| options | [PaymentInitializeOptions](../interfaces/paymentinitializeoptions.md) |  Options for initializing the payment step of checkout. |

**Returns:** `Promise`<[CheckoutSelectors](../interfaces/checkoutselectors.md)>
A promise that resolves to the current state.

___
<a id="initializeshipping"></a>

###  initializeShipping

▸ **initializeShipping**(options?: *[ShippingInitializeOptions](../interfaces/shippinginitializeoptions.md)*): `Promise`<[CheckoutSelectors](../interfaces/checkoutselectors.md)>

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| `Optional` options | [ShippingInitializeOptions](../interfaces/shippinginitializeoptions.md) |  Options for initializing the shipping step of checkout. |

**Returns:** `Promise`<[CheckoutSelectors](../interfaces/checkoutselectors.md)>
A promise that resolves to the current state.

___
<a id="initializespamprotection"></a>

###  initializeSpamProtection

▸ **initializeSpamProtection**(options: *[SpamProtectionOptions](../interfaces/spamprotectionoptions.md)*): `Promise`<[CheckoutSelectors](../interfaces/checkoutselectors.md)>

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| options | [SpamProtectionOptions](../interfaces/spamprotectionoptions.md) |  Options for initializing spam protection. |

**Returns:** `Promise`<[CheckoutSelectors](../interfaces/checkoutselectors.md)>
A promise that resolves to the current state.

___
<a id="loadbillingaddressfields"></a>

###  loadBillingAddressFields

▸ **loadBillingAddressFields**(options?: *[RequestOptions](../interfaces/requestoptions.md)*): `Promise`<[CheckoutSelectors](../interfaces/checkoutselectors.md)>

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| `Optional` options | [RequestOptions](../interfaces/requestoptions.md) |  Options for loading the billing address form fields. |

**Returns:** `Promise`<[CheckoutSelectors](../interfaces/checkoutselectors.md)>
A promise that resolves to the current state.

___
<a id="loadbillingcountries"></a>

###  loadBillingCountries

▸ **loadBillingCountries**(options?: *[RequestOptions](../interfaces/requestoptions.md)*): `Promise`<[CheckoutSelectors](../interfaces/checkoutselectors.md)>

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| `Optional` options | [RequestOptions](../interfaces/requestoptions.md) |  Options for loading the available billing countries. |

**Returns:** `Promise`<[CheckoutSelectors](../interfaces/checkoutselectors.md)>
A promise that resolves to the current state.

___
<a id="loadcheckout"></a>

###  loadCheckout

▸ **loadCheckout**(id?: * `undefined` &#124; `string`*, options?: *[RequestOptions](../interfaces/requestoptions.md)<[CheckoutParams](../interfaces/checkoutparams.md)>*): `Promise`<[CheckoutSelectors](../interfaces/checkoutselectors.md)>

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| `Optional` id |  `undefined` &#124; `string`|  The identifier of the checkout to load, or the default checkout if not provided. |
| `Optional` options | [RequestOptions](../interfaces/requestoptions.md)<[CheckoutParams](../interfaces/checkoutparams.md)> |  Options for loading the current checkout. |

**Returns:** `Promise`<[CheckoutSelectors](../interfaces/checkoutselectors.md)>
A promise that resolves to the current state.

___
<a id="loadinstruments"></a>

###  loadInstruments

▸ **loadInstruments**(): `Promise`<[CheckoutSelectors](../interfaces/checkoutselectors.md)>

**Returns:** `Promise`<[CheckoutSelectors](../interfaces/checkoutselectors.md)>
A promise that resolves to the current state.

___
<a id="loadorder"></a>

###  loadOrder

▸ **loadOrder**(orderId: *`number`*, options?: *[RequestOptions](../interfaces/requestoptions.md)*): `Promise`<[CheckoutSelectors](../interfaces/checkoutselectors.md)>

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| orderId | `number` |  The identifier of the order to load. |
| `Optional` options | [RequestOptions](../interfaces/requestoptions.md) |  Options for loading the order. |

**Returns:** `Promise`<[CheckoutSelectors](../interfaces/checkoutselectors.md)>
A promise that resolves to the current state.

___
<a id="loadpaymentmethods"></a>

###  loadPaymentMethods

▸ **loadPaymentMethods**(options?: *[RequestOptions](../interfaces/requestoptions.md)*): `Promise`<[CheckoutSelectors](../interfaces/checkoutselectors.md)>

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| `Optional` options | [RequestOptions](../interfaces/requestoptions.md) |  Options for loading the payment methods that are available to the current customer. |

**Returns:** `Promise`<[CheckoutSelectors](../interfaces/checkoutselectors.md)>
A promise that resolves to the current state.

___
<a id="loadshippingaddressfields"></a>

###  loadShippingAddressFields

▸ **loadShippingAddressFields**(options?: *[RequestOptions](../interfaces/requestoptions.md)*): `Promise`<[CheckoutSelectors](../interfaces/checkoutselectors.md)>

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| `Optional` options | [RequestOptions](../interfaces/requestoptions.md) |  Options for loading the shipping address form fields. |

**Returns:** `Promise`<[CheckoutSelectors](../interfaces/checkoutselectors.md)>
A promise that resolves to the current state.

___
<a id="loadshippingcountries"></a>

###  loadShippingCountries

▸ **loadShippingCountries**(options?: *[RequestOptions](../interfaces/requestoptions.md)*): `Promise`<[CheckoutSelectors](../interfaces/checkoutselectors.md)>

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| `Optional` options | [RequestOptions](../interfaces/requestoptions.md) |  Options for loading the available shipping countries. |

**Returns:** `Promise`<[CheckoutSelectors](../interfaces/checkoutselectors.md)>
A promise that resolves to the current state.

___
<a id="loadshippingoptions"></a>

###  loadShippingOptions

▸ **loadShippingOptions**(options?: *[RequestOptions](../interfaces/requestoptions.md)*): `Promise`<[CheckoutSelectors](../interfaces/checkoutselectors.md)>

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| `Optional` options | [RequestOptions](../interfaces/requestoptions.md) |  Options for loading the available shipping options. |

**Returns:** `Promise`<[CheckoutSelectors](../interfaces/checkoutselectors.md)>
A promise that resolves to the current state.

___
<a id="notifystate"></a>

###  notifyState

▸ **notifyState**(): `void`

**Returns:** `void`

___
<a id="removecoupon"></a>

###  removeCoupon

▸ **removeCoupon**(code: *`string`*, options?: *[RequestOptions](../interfaces/requestoptions.md)*): `Promise`<[CheckoutSelectors](../interfaces/checkoutselectors.md)>

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| code | `string` |  The coupon code to remove from the current checkout. |
| `Optional` options | [RequestOptions](../interfaces/requestoptions.md) |  Options for removing the coupon code. |

**Returns:** `Promise`<[CheckoutSelectors](../interfaces/checkoutselectors.md)>
A promise that resolves to the current state.

___
<a id="removegiftcertificate"></a>

###  removeGiftCertificate

▸ **removeGiftCertificate**(code: *`string`*, options?: *[RequestOptions](../interfaces/requestoptions.md)*): `Promise`<[CheckoutSelectors](../interfaces/checkoutselectors.md)>

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| code | `string` |  The gift certificate to remove from the current checkout. |
| `Optional` options | [RequestOptions](../interfaces/requestoptions.md) |  Options for removing the gift certificate. |

**Returns:** `Promise`<[CheckoutSelectors](../interfaces/checkoutselectors.md)>
A promise that resolves to the current state.

___
<a id="selectconsignmentshippingoption"></a>

###  selectConsignmentShippingOption

▸ **selectConsignmentShippingOption**(consignmentId: *`string`*, shippingOptionId: *`string`*, options?: *[ShippingRequestOptions](../interfaces/shippingrequestoptions.md)*): `Promise`<[CheckoutSelectors](../interfaces/checkoutselectors.md)>

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| consignmentId | `string` |  The identified of the consignment to be updated. |
| shippingOptionId | `string` |  The identifier of the shipping option to select. |
| `Optional` options | [ShippingRequestOptions](../interfaces/shippingrequestoptions.md) |  Options for selecting the shipping option. |

**Returns:** `Promise`<[CheckoutSelectors](../interfaces/checkoutselectors.md)>
A promise that resolves to the current state.

___
<a id="selectshippingoption"></a>

###  selectShippingOption

▸ **selectShippingOption**(shippingOptionId: *`string`*, options?: *[ShippingRequestOptions](../interfaces/shippingrequestoptions.md)*): `Promise`<[CheckoutSelectors](../interfaces/checkoutselectors.md)>

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| shippingOptionId | `string` |  The identifier of the shipping option to select. |
| `Optional` options | [ShippingRequestOptions](../interfaces/shippingrequestoptions.md) |  Options for selecting the shipping option. |

**Returns:** `Promise`<[CheckoutSelectors](../interfaces/checkoutselectors.md)>
A promise that resolves to the current state.

___
<a id="signincustomer"></a>

###  signInCustomer

▸ **signInCustomer**(credentials: *[CustomerCredentials](../interfaces/customercredentials.md)*, options?: *[CustomerRequestOptions](../interfaces/customerrequestoptions.md)*): `Promise`<[CheckoutSelectors](../interfaces/checkoutselectors.md)>

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| credentials | [CustomerCredentials](../interfaces/customercredentials.md) |  The credentials to be used for signing in the customer. |
| `Optional` options | [CustomerRequestOptions](../interfaces/customerrequestoptions.md) |  Options for signing in the customer. |

**Returns:** `Promise`<[CheckoutSelectors](../interfaces/checkoutselectors.md)>
A promise that resolves to the current state.

___
<a id="signoutcustomer"></a>

###  signOutCustomer

▸ **signOutCustomer**(options?: *[CustomerRequestOptions](../interfaces/customerrequestoptions.md)*): `Promise`<[CheckoutSelectors](../interfaces/checkoutselectors.md)>

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| `Optional` options | [CustomerRequestOptions](../interfaces/customerrequestoptions.md) |  Options for signing out the customer. |

**Returns:** `Promise`<[CheckoutSelectors](../interfaces/checkoutselectors.md)>
A promise that resolves to the current state.

___
<a id="submitorder"></a>

###  submitOrder

▸ **submitOrder**(payload: *[OrderRequestBody](../interfaces/orderrequestbody.md)*, options?: *[RequestOptions](../interfaces/requestoptions.md)*): `Promise`<[CheckoutSelectors](../interfaces/checkoutselectors.md)>

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| payload | [OrderRequestBody](../interfaces/orderrequestbody.md) |  The request payload to submit for the current order. |
| `Optional` options | [RequestOptions](../interfaces/requestoptions.md) |  Options for submitting the current order. |

**Returns:** `Promise`<[CheckoutSelectors](../interfaces/checkoutselectors.md)>
A promise that resolves to the current state.

___
<a id="subscribe"></a>

###  subscribe

▸ **subscribe**(subscriber: *`function`*, ...filters: *`Array`<`function`>*): `function`

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| subscriber | `function` |  The function to subscribe to state changes. |
| `Rest` filters | `Array`<`function`> |  One or more functions to filter out irrelevant state changes. If more than one function is provided, the subscriber will only be triggered if all conditions are met. |

**Returns:** `function`
A function, if called, will unsubscribe the subscriber.

___
<a id="unassignitemstoaddress"></a>

###  unassignItemsToAddress

▸ **unassignItemsToAddress**(consignment: *[ConsignmentAssignmentRequestBody](../interfaces/consignmentassignmentrequestbody.md)*, options?: *[RequestOptions](../interfaces/requestoptions.md)*): `Promise`<[CheckoutSelectors](../interfaces/checkoutselectors.md)>

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| consignment | [ConsignmentAssignmentRequestBody](../interfaces/consignmentassignmentrequestbody.md) |  The consignment data that will be used. |
| `Optional` options | [RequestOptions](../interfaces/requestoptions.md) |  Options for the request |

**Returns:** `Promise`<[CheckoutSelectors](../interfaces/checkoutselectors.md)>
A promise that resolves to the current state.

___
<a id="updatebillingaddress"></a>

###  updateBillingAddress

▸ **updateBillingAddress**(address: *`Partial`<[BillingAddressRequestBody](../interfaces/billingaddressrequestbody.md)>*, options?: *[RequestOptions](../interfaces/requestoptions.md)*): `Promise`<[CheckoutSelectors](../interfaces/checkoutselectors.md)>

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| address | `Partial`<[BillingAddressRequestBody](../interfaces/billingaddressrequestbody.md)> |  The address to be used for billing. |
| `Optional` options | [RequestOptions](../interfaces/requestoptions.md) |  Options for updating the billing address. |

**Returns:** `Promise`<[CheckoutSelectors](../interfaces/checkoutselectors.md)>
A promise that resolves to the current state.

___
<a id="updatecheckout"></a>

###  updateCheckout

▸ **updateCheckout**(payload: *[CheckoutRequestBody](../interfaces/checkoutrequestbody.md)*, options?: *[RequestOptions](../interfaces/requestoptions.md)*): `Promise`<[CheckoutSelectors](../interfaces/checkoutselectors.md)>

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| payload | [CheckoutRequestBody](../interfaces/checkoutrequestbody.md) |  The checkout properties to be updated. |
| `Optional` options | [RequestOptions](../interfaces/requestoptions.md) |  Options for loading the current checkout. |

**Returns:** `Promise`<[CheckoutSelectors](../interfaces/checkoutselectors.md)>
A promise that resolves to the current state.

___
<a id="updateconsignment"></a>

###  updateConsignment

▸ **updateConsignment**(consignment: *[ConsignmentUpdateRequestBody](../interfaces/consignmentupdaterequestbody.md)*, options?: *[RequestOptions](../interfaces/requestoptions.md)*): `Promise`<[CheckoutSelectors](../interfaces/checkoutselectors.md)>

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| consignment | [ConsignmentUpdateRequestBody](../interfaces/consignmentupdaterequestbody.md) |  The consignment data that will be used. |
| `Optional` options | [RequestOptions](../interfaces/requestoptions.md) |  Options for updating the shipping address. |

**Returns:** `Promise`<[CheckoutSelectors](../interfaces/checkoutselectors.md)>
A promise that resolves to the current state.

___
<a id="updateshippingaddress"></a>

###  updateShippingAddress

▸ **updateShippingAddress**(address: *`Partial`<[AddressRequestBody](../interfaces/addressrequestbody.md)>*, options?: *[ShippingRequestOptions](../interfaces/shippingrequestoptions.md)<[CheckoutParams](../interfaces/checkoutparams.md)>*): `Promise`<[CheckoutSelectors](../interfaces/checkoutselectors.md)>

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| address | `Partial`<[AddressRequestBody](../interfaces/addressrequestbody.md)> |  The address to be used for shipping. |
| `Optional` options | [ShippingRequestOptions](../interfaces/shippingrequestoptions.md)<[CheckoutParams](../interfaces/checkoutparams.md)> |  Options for updating the shipping address. |

**Returns:** `Promise`<[CheckoutSelectors](../interfaces/checkoutselectors.md)>
A promise that resolves to the current state.

___
<a id="updatesubscriptions"></a>

###  updateSubscriptions

▸ **updateSubscriptions**(subscriptions: *[Subscriptions](../interfaces/subscriptions.md)*, options?: *[RequestOptions](../interfaces/requestoptions.md)*): `Promise`<[CheckoutSelectors](../interfaces/checkoutselectors.md)>

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| subscriptions | [Subscriptions](../interfaces/subscriptions.md) |  The email and associated subscriptions to update. |
| `Optional` options | [RequestOptions](../interfaces/requestoptions.md) |  Options for continuing as a guest. |

**Returns:** `Promise`<[CheckoutSelectors](../interfaces/checkoutselectors.md)>
A promise that resolves to the current state.

___

