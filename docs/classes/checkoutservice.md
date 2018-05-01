[@bigcommerce/checkout-sdk](../README.md) > [CheckoutService](../classes/checkoutservice.md)



# Class: CheckoutService


TODO: Convert this file into TypeScript properly i.e.: Instrument, InitializePaymentOptions etc...

## Index

### Methods

* [applyCoupon](checkoutservice.md#applycoupon)
* [applyGiftCertificate](checkoutservice.md#applygiftcertificate)
* [deinitializeCustomer](checkoutservice.md#deinitializecustomer)
* [deinitializePayment](checkoutservice.md#deinitializepayment)
* [deinitializeShipping](checkoutservice.md#deinitializeshipping)
* [deleteInstrument](checkoutservice.md#deleteinstrument)
* [finalizeOrder](checkoutservice.md#finalizeorder)
* [finalizeOrderIfNeeded](checkoutservice.md#finalizeorderifneeded)
* [getState](checkoutservice.md#getstate)
* [initializeCustomer](checkoutservice.md#initializecustomer)
* [initializePayment](checkoutservice.md#initializepayment)
* [initializeShipping](checkoutservice.md#initializeshipping)
* [loadBillingAddressFields](checkoutservice.md#loadbillingaddressfields)
* [loadBillingCountries](checkoutservice.md#loadbillingcountries)
* [loadCart](checkoutservice.md#loadcart)
* [loadCheckout](checkoutservice.md#loadcheckout)
* [loadConfig](checkoutservice.md#loadconfig)
* [loadInstruments](checkoutservice.md#loadinstruments)
* [loadOrder](checkoutservice.md#loadorder)
* [loadPaymentMethod](checkoutservice.md#loadpaymentmethod)
* [loadPaymentMethods](checkoutservice.md#loadpaymentmethods)
* [loadShippingAddressFields](checkoutservice.md#loadshippingaddressfields)
* [loadShippingCountries](checkoutservice.md#loadshippingcountries)
* [loadShippingOptions](checkoutservice.md#loadshippingoptions)
* [notifyState](checkoutservice.md#notifystate)
* [removeCoupon](checkoutservice.md#removecoupon)
* [removeGiftCertificate](checkoutservice.md#removegiftcertificate)
* [selectShippingOption](checkoutservice.md#selectshippingoption)
* [signInCustomer](checkoutservice.md#signincustomer)
* [signOutCustomer](checkoutservice.md#signoutcustomer)
* [submitOrder](checkoutservice.md#submitorder)
* [subscribe](checkoutservice.md#subscribe)
* [updateBillingAddress](checkoutservice.md#updatebillingaddress)
* [updateShippingAddress](checkoutservice.md#updateshippingaddress)
* [vaultInstrument](checkoutservice.md#vaultinstrument)
* [verifyCart](checkoutservice.md#verifycart)



---
## Methods
<a id="applycoupon"></a>

###  applyCoupon

► **applyCoupon**(code: *`string`*, options?: *[RequestOptions](../interfaces/requestoptions.md)*): `Promise`.<[CheckoutSelectors](../interfaces/checkoutselectors.md)>






**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| code | `string`   |  - |
| options | [RequestOptions](../interfaces/requestoptions.md)   |  - |





**Returns:** `Promise`.<[CheckoutSelectors](../interfaces/checkoutselectors.md)>





___

<a id="applygiftcertificate"></a>

###  applyGiftCertificate

► **applyGiftCertificate**(code: *`string`*, options?: *[RequestOptions](../interfaces/requestoptions.md)*): `Promise`.<[CheckoutSelectors](../interfaces/checkoutselectors.md)>






**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| code | `string`   |  - |
| options | [RequestOptions](../interfaces/requestoptions.md)   |  - |





**Returns:** `Promise`.<[CheckoutSelectors](../interfaces/checkoutselectors.md)>





___

<a id="deinitializecustomer"></a>

###  deinitializeCustomer

► **deinitializeCustomer**(options?: *[CustomerRequestOptions](../interfaces/customerrequestoptions.md)*): `Promise`.<[CheckoutSelectors](../interfaces/checkoutselectors.md)>






**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| options | [CustomerRequestOptions](../interfaces/customerrequestoptions.md)   |  - |





**Returns:** `Promise`.<[CheckoutSelectors](../interfaces/checkoutselectors.md)>





___

<a id="deinitializepayment"></a>

###  deinitializePayment

► **deinitializePayment**(options: *[PaymentRequestOptions](../interfaces/paymentrequestoptions.md)*): `Promise`.<[CheckoutSelectors](../interfaces/checkoutselectors.md)>






**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| options | [PaymentRequestOptions](../interfaces/paymentrequestoptions.md)   |  - |





**Returns:** `Promise`.<[CheckoutSelectors](../interfaces/checkoutselectors.md)>





___

<a id="deinitializeshipping"></a>

###  deinitializeShipping

► **deinitializeShipping**(options?: *[ShippingRequestOptions](../interfaces/shippingrequestoptions.md)*): `Promise`.<[CheckoutSelectors](../interfaces/checkoutselectors.md)>






**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| options | [ShippingRequestOptions](../interfaces/shippingrequestoptions.md)   |  - |





**Returns:** `Promise`.<[CheckoutSelectors](../interfaces/checkoutselectors.md)>





___

<a id="deleteinstrument"></a>

###  deleteInstrument

► **deleteInstrument**(instrumentId: *`string`*): `Promise`.<[CheckoutSelectors](../interfaces/checkoutselectors.md)>






**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| instrumentId | `string`   |  - |





**Returns:** `Promise`.<[CheckoutSelectors](../interfaces/checkoutselectors.md)>





___

<a id="finalizeorder"></a>

###  finalizeOrder

► **finalizeOrder**(orderId: *`number`*, options?: *[RequestOptions](../interfaces/requestoptions.md)*): `Promise`.<[CheckoutSelectors](../interfaces/checkoutselectors.md)>





*__deprecated__*: 



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| orderId | `number`   |  - |
| options | [RequestOptions](../interfaces/requestoptions.md)   |  - |





**Returns:** `Promise`.<[CheckoutSelectors](../interfaces/checkoutselectors.md)>





___

<a id="finalizeorderifneeded"></a>

###  finalizeOrderIfNeeded

► **finalizeOrderIfNeeded**(options?: *[RequestOptions](../interfaces/requestoptions.md)*): `Promise`.<[CheckoutSelectors](../interfaces/checkoutselectors.md)>






**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| options | [RequestOptions](../interfaces/requestoptions.md)   |  - |





**Returns:** `Promise`.<[CheckoutSelectors](../interfaces/checkoutselectors.md)>





___

<a id="getstate"></a>

###  getState

► **getState**(): [CheckoutSelectors](../interfaces/checkoutselectors.md)








**Returns:** [CheckoutSelectors](../interfaces/checkoutselectors.md)





___

<a id="initializecustomer"></a>

###  initializeCustomer

► **initializeCustomer**(options?: *[CustomerInitializeOptions](../interfaces/customerinitializeoptions.md)*): `Promise`.<[CheckoutSelectors](../interfaces/checkoutselectors.md)>






**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| options | [CustomerInitializeOptions](../interfaces/customerinitializeoptions.md)   |  - |





**Returns:** `Promise`.<[CheckoutSelectors](../interfaces/checkoutselectors.md)>





___

<a id="initializepayment"></a>

###  initializePayment

► **initializePayment**(options: *[PaymentInitializeOptions](../interfaces/paymentinitializeoptions.md)*): `Promise`.<[CheckoutSelectors](../interfaces/checkoutselectors.md)>






**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| options | [PaymentInitializeOptions](../interfaces/paymentinitializeoptions.md)   |  - |





**Returns:** `Promise`.<[CheckoutSelectors](../interfaces/checkoutselectors.md)>





___

<a id="initializeshipping"></a>

###  initializeShipping

► **initializeShipping**(options?: *[ShippingInitializeOptions](../interfaces/shippinginitializeoptions.md)*): `Promise`.<[CheckoutSelectors](../interfaces/checkoutselectors.md)>






**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| options | [ShippingInitializeOptions](../interfaces/shippinginitializeoptions.md)   |  - |





**Returns:** `Promise`.<[CheckoutSelectors](../interfaces/checkoutselectors.md)>





___

<a id="loadbillingaddressfields"></a>

###  loadBillingAddressFields

► **loadBillingAddressFields**(options?: *[RequestOptions](../interfaces/requestoptions.md)*): `Promise`.<[CheckoutSelectors](../interfaces/checkoutselectors.md)>






**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| options | [RequestOptions](../interfaces/requestoptions.md)   |  - |





**Returns:** `Promise`.<[CheckoutSelectors](../interfaces/checkoutselectors.md)>





___

<a id="loadbillingcountries"></a>

###  loadBillingCountries

► **loadBillingCountries**(options?: *[RequestOptions](../interfaces/requestoptions.md)*): `Promise`.<[CheckoutSelectors](../interfaces/checkoutselectors.md)>






**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| options | [RequestOptions](../interfaces/requestoptions.md)   |  - |





**Returns:** `Promise`.<[CheckoutSelectors](../interfaces/checkoutselectors.md)>





___

<a id="loadcart"></a>

###  loadCart

► **loadCart**(options?: *[RequestOptions](../interfaces/requestoptions.md)*): `Promise`.<[CheckoutSelectors](../interfaces/checkoutselectors.md)>






**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| options | [RequestOptions](../interfaces/requestoptions.md)   |  - |





**Returns:** `Promise`.<[CheckoutSelectors](../interfaces/checkoutselectors.md)>





___

<a id="loadcheckout"></a>

###  loadCheckout

► **loadCheckout**(options?: *[RequestOptions](../interfaces/requestoptions.md)*): `Promise`.<[CheckoutSelectors](../interfaces/checkoutselectors.md)>






**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| options | [RequestOptions](../interfaces/requestoptions.md)   |  - |





**Returns:** `Promise`.<[CheckoutSelectors](../interfaces/checkoutselectors.md)>





___

<a id="loadconfig"></a>

###  loadConfig

► **loadConfig**(options?: *[RequestOptions](../interfaces/requestoptions.md)*): `Promise`.<[CheckoutSelectors](../interfaces/checkoutselectors.md)>






**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| options | [RequestOptions](../interfaces/requestoptions.md)   |  - |





**Returns:** `Promise`.<[CheckoutSelectors](../interfaces/checkoutselectors.md)>





___

<a id="loadinstruments"></a>

###  loadInstruments

► **loadInstruments**(): `Promise`.<[CheckoutSelectors](../interfaces/checkoutselectors.md)>








**Returns:** `Promise`.<[CheckoutSelectors](../interfaces/checkoutselectors.md)>





___

<a id="loadorder"></a>

###  loadOrder

► **loadOrder**(orderId: *`number`*, options?: *[RequestOptions](../interfaces/requestoptions.md)*): `Promise`.<[CheckoutSelectors](../interfaces/checkoutselectors.md)>






**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| orderId | `number`   |  - |
| options | [RequestOptions](../interfaces/requestoptions.md)   |  - |





**Returns:** `Promise`.<[CheckoutSelectors](../interfaces/checkoutselectors.md)>





___

<a id="loadpaymentmethod"></a>

###  loadPaymentMethod

► **loadPaymentMethod**(methodId: *`string`*, options: *[RequestOptions](../interfaces/requestoptions.md)*): `Promise`.<[CheckoutSelectors](../interfaces/checkoutselectors.md)>






**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| methodId | `string`   |  - |
| options | [RequestOptions](../interfaces/requestoptions.md)   |  - |





**Returns:** `Promise`.<[CheckoutSelectors](../interfaces/checkoutselectors.md)>





___

<a id="loadpaymentmethods"></a>

###  loadPaymentMethods

► **loadPaymentMethods**(options?: *[RequestOptions](../interfaces/requestoptions.md)*): `Promise`.<[CheckoutSelectors](../interfaces/checkoutselectors.md)>






**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| options | [RequestOptions](../interfaces/requestoptions.md)   |  - |





**Returns:** `Promise`.<[CheckoutSelectors](../interfaces/checkoutselectors.md)>





___

<a id="loadshippingaddressfields"></a>

###  loadShippingAddressFields

► **loadShippingAddressFields**(options?: *[RequestOptions](../interfaces/requestoptions.md)*): `Promise`.<[CheckoutSelectors](../interfaces/checkoutselectors.md)>






**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| options | [RequestOptions](../interfaces/requestoptions.md)   |  - |





**Returns:** `Promise`.<[CheckoutSelectors](../interfaces/checkoutselectors.md)>





___

<a id="loadshippingcountries"></a>

###  loadShippingCountries

► **loadShippingCountries**(options?: *[RequestOptions](../interfaces/requestoptions.md)*): `Promise`.<[CheckoutSelectors](../interfaces/checkoutselectors.md)>






**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| options | [RequestOptions](../interfaces/requestoptions.md)   |  - |





**Returns:** `Promise`.<[CheckoutSelectors](../interfaces/checkoutselectors.md)>





___

<a id="loadshippingoptions"></a>

###  loadShippingOptions

► **loadShippingOptions**(options?: *[RequestOptions](../interfaces/requestoptions.md)*): `Promise`.<[CheckoutSelectors](../interfaces/checkoutselectors.md)>






**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| options | [RequestOptions](../interfaces/requestoptions.md)   |  - |





**Returns:** `Promise`.<[CheckoutSelectors](../interfaces/checkoutselectors.md)>





___

<a id="notifystate"></a>

###  notifyState

► **notifyState**(): `void`








**Returns:** `void`





___

<a id="removecoupon"></a>

###  removeCoupon

► **removeCoupon**(code: *`string`*, options?: *[RequestOptions](../interfaces/requestoptions.md)*): `Promise`.<[CheckoutSelectors](../interfaces/checkoutselectors.md)>






**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| code | `string`   |  - |
| options | [RequestOptions](../interfaces/requestoptions.md)   |  - |





**Returns:** `Promise`.<[CheckoutSelectors](../interfaces/checkoutselectors.md)>





___

<a id="removegiftcertificate"></a>

###  removeGiftCertificate

► **removeGiftCertificate**(code: *`string`*, options?: *[RequestOptions](../interfaces/requestoptions.md)*): `Promise`.<[CheckoutSelectors](../interfaces/checkoutselectors.md)>






**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| code | `string`   |  - |
| options | [RequestOptions](../interfaces/requestoptions.md)   |  - |





**Returns:** `Promise`.<[CheckoutSelectors](../interfaces/checkoutselectors.md)>





___

<a id="selectshippingoption"></a>

###  selectShippingOption

► **selectShippingOption**(addressId: *`string`*, shippingOptionId: *`string`*, options?: *[ShippingRequestOptions](../interfaces/shippingrequestoptions.md)*): `Promise`.<[CheckoutSelectors](../interfaces/checkoutselectors.md)>






**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| addressId | `string`   |  - |
| shippingOptionId | `string`   |  - |
| options | [ShippingRequestOptions](../interfaces/shippingrequestoptions.md)   |  - |





**Returns:** `Promise`.<[CheckoutSelectors](../interfaces/checkoutselectors.md)>





___

<a id="signincustomer"></a>

###  signInCustomer

► **signInCustomer**(credentials: *[CustomerCredentials](../interfaces/customercredentials.md)*, options?: *[CustomerRequestOptions](../interfaces/customerrequestoptions.md)*): `Promise`.<[CheckoutSelectors](../interfaces/checkoutselectors.md)>






**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| credentials | [CustomerCredentials](../interfaces/customercredentials.md)   |  - |
| options | [CustomerRequestOptions](../interfaces/customerrequestoptions.md)   |  - |





**Returns:** `Promise`.<[CheckoutSelectors](../interfaces/checkoutselectors.md)>





___

<a id="signoutcustomer"></a>

###  signOutCustomer

► **signOutCustomer**(options?: *[CustomerRequestOptions](../interfaces/customerrequestoptions.md)*): `Promise`.<[CheckoutSelectors](../interfaces/checkoutselectors.md)>






**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| options | [CustomerRequestOptions](../interfaces/customerrequestoptions.md)   |  - |





**Returns:** `Promise`.<[CheckoutSelectors](../interfaces/checkoutselectors.md)>





___

<a id="submitorder"></a>

###  submitOrder

► **submitOrder**(payload: *[OrderRequestBody](../interfaces/orderrequestbody.md)*, options?: *[RequestOptions](../interfaces/requestoptions.md)*): `Promise`.<[CheckoutSelectors](../interfaces/checkoutselectors.md)>






**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| payload | [OrderRequestBody](../interfaces/orderrequestbody.md)   |  - |
| options | [RequestOptions](../interfaces/requestoptions.md)   |  - |





**Returns:** `Promise`.<[CheckoutSelectors](../interfaces/checkoutselectors.md)>





___

<a id="subscribe"></a>

###  subscribe

► **subscribe**(subscriber: *`function`*, ...filters: *`Array`.<`function`>*): `function`






**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| subscriber | `function`   |  - |
| filters | `Array`.<`function`>   |  - |





**Returns:** `function`





___

<a id="updatebillingaddress"></a>

###  updateBillingAddress

► **updateBillingAddress**(address: *[InternalAddress](../interfaces/internaladdress.md)*, options?: *[RequestOptions](../interfaces/requestoptions.md)*): `Promise`.<[CheckoutSelectors](../interfaces/checkoutselectors.md)>






**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| address | [InternalAddress](../interfaces/internaladdress.md)   |  - |
| options | [RequestOptions](../interfaces/requestoptions.md)   |  - |





**Returns:** `Promise`.<[CheckoutSelectors](../interfaces/checkoutselectors.md)>





___

<a id="updateshippingaddress"></a>

###  updateShippingAddress

► **updateShippingAddress**(address: *[InternalAddress](../interfaces/internaladdress.md)*, options?: *[ShippingRequestOptions](../interfaces/shippingrequestoptions.md)*): `Promise`.<[CheckoutSelectors](../interfaces/checkoutselectors.md)>






**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| address | [InternalAddress](../interfaces/internaladdress.md)   |  - |
| options | [ShippingRequestOptions](../interfaces/shippingrequestoptions.md)   |  - |





**Returns:** `Promise`.<[CheckoutSelectors](../interfaces/checkoutselectors.md)>





___

<a id="vaultinstrument"></a>

###  vaultInstrument

► **vaultInstrument**(instrument: *`any`*): `Promise`.<[CheckoutSelectors](../interfaces/checkoutselectors.md)>






**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| instrument | `any`   |  - |





**Returns:** `Promise`.<[CheckoutSelectors](../interfaces/checkoutselectors.md)>





___

<a id="verifycart"></a>

###  verifyCart

► **verifyCart**(options?: *[RequestOptions](../interfaces/requestoptions.md)*): `Promise`.<[CheckoutSelectors](../interfaces/checkoutselectors.md)>





*__deprecated__*: 



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| options | [RequestOptions](../interfaces/requestoptions.md)   |  - |





**Returns:** `Promise`.<[CheckoutSelectors](../interfaces/checkoutselectors.md)>





___


