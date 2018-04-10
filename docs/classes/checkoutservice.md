[@bigcommerce/checkout-sdk](../README.md) > [CheckoutService](../classes/checkoutservice.md)



# Class: CheckoutService


TODO: Convert this file into TypeScript properly i.e.: Instrument, InitializePaymentOptions etc...

## Index

### Methods

* [applyCoupon](checkoutservice.md#applycoupon)
* [applyGiftCertificate](checkoutservice.md#applygiftcertificate)
* [deinitializeCustomer](checkoutservice.md#deinitializecustomer)
* [deinitializePaymentMethod](checkoutservice.md#deinitializepaymentmethod)
* [deinitializeShipping](checkoutservice.md#deinitializeshipping)
* [deleteInstrument](checkoutservice.md#deleteinstrument)
* [finalizeOrder](checkoutservice.md#finalizeorder)
* [finalizeOrderIfNeeded](checkoutservice.md#finalizeorderifneeded)
* [getState](checkoutservice.md#getstate)
* [initializeCustomer](checkoutservice.md#initializecustomer)
* [initializePaymentMethod](checkoutservice.md#initializepaymentmethod)
* [initializeShipping](checkoutservice.md#initializeshipping)
* [loadBillingAddressFields](checkoutservice.md#loadbillingaddressfields)
* [loadBillingCountries](checkoutservice.md#loadbillingcountries)
* [loadCart](checkoutservice.md#loadcart)
* [loadCheckout](checkoutservice.md#loadcheckout)
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



*Defined in [checkout-sdk.d.ts:212](https://github.com/bigcommerce/checkout-sdk-js/blob/66bc013/dist/checkout-sdk.d.ts#L212)*



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



*Defined in [checkout-sdk.d.ts:214](https://github.com/bigcommerce/checkout-sdk-js/blob/66bc013/dist/checkout-sdk.d.ts#L214)*



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| code | `string`   |  - |
| options | [RequestOptions](../interfaces/requestoptions.md)   |  - |





**Returns:** `Promise`.<[CheckoutSelectors](../interfaces/checkoutselectors.md)>





___

<a id="deinitializecustomer"></a>

###  deinitializeCustomer

► **deinitializeCustomer**(options?: *`any`*): `Promise`.<[CheckoutSelectors](../interfaces/checkoutselectors.md)>



*Defined in [checkout-sdk.d.ts:203](https://github.com/bigcommerce/checkout-sdk-js/blob/66bc013/dist/checkout-sdk.d.ts#L203)*



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| options | `any`   |  - |





**Returns:** `Promise`.<[CheckoutSelectors](../interfaces/checkoutselectors.md)>





___

<a id="deinitializepaymentmethod"></a>

###  deinitializePaymentMethod

► **deinitializePaymentMethod**(methodId: *`string`*, gatewayId?: *`undefined`⎮`string`*, options?: *`any`*): `Promise`.<[CheckoutSelectors](../interfaces/checkoutselectors.md)>



*Defined in [checkout-sdk.d.ts:197](https://github.com/bigcommerce/checkout-sdk-js/blob/66bc013/dist/checkout-sdk.d.ts#L197)*



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| methodId | `string`   |  - |
| gatewayId | `undefined`⎮`string`   |  - |
| options | `any`   |  - |





**Returns:** `Promise`.<[CheckoutSelectors](../interfaces/checkoutselectors.md)>





___

<a id="deinitializeshipping"></a>

###  deinitializeShipping

► **deinitializeShipping**(options?: *`any`*): `Promise`.<[CheckoutSelectors](../interfaces/checkoutselectors.md)>



*Defined in [checkout-sdk.d.ts:208](https://github.com/bigcommerce/checkout-sdk-js/blob/66bc013/dist/checkout-sdk.d.ts#L208)*



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| options | `any`   |  - |





**Returns:** `Promise`.<[CheckoutSelectors](../interfaces/checkoutselectors.md)>





___

<a id="deleteinstrument"></a>

###  deleteInstrument

► **deleteInstrument**(instrumentId: *`string`*): `Promise`.<[CheckoutSelectors](../interfaces/checkoutselectors.md)>



*Defined in [checkout-sdk.d.ts:218](https://github.com/bigcommerce/checkout-sdk-js/blob/66bc013/dist/checkout-sdk.d.ts#L218)*



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| instrumentId | `string`   |  - |





**Returns:** `Promise`.<[CheckoutSelectors](../interfaces/checkoutselectors.md)>





___

<a id="finalizeorder"></a>

###  finalizeOrder

► **finalizeOrder**(orderId: *`number`*, options?: *[RequestOptions](../interfaces/requestoptions.md)*): `Promise`.<[CheckoutSelectors](../interfaces/checkoutselectors.md)>



*Defined in [checkout-sdk.d.ts:192](https://github.com/bigcommerce/checkout-sdk-js/blob/66bc013/dist/checkout-sdk.d.ts#L192)*


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



*Defined in [checkout-sdk.d.ts:193](https://github.com/bigcommerce/checkout-sdk-js/blob/66bc013/dist/checkout-sdk.d.ts#L193)*



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| options | [RequestOptions](../interfaces/requestoptions.md)   |  - |





**Returns:** `Promise`.<[CheckoutSelectors](../interfaces/checkoutselectors.md)>





___

<a id="getstate"></a>

###  getState

► **getState**(): [CheckoutSelectors](../interfaces/checkoutselectors.md)



*Defined in [checkout-sdk.d.ts:178](https://github.com/bigcommerce/checkout-sdk-js/blob/66bc013/dist/checkout-sdk.d.ts#L178)*





**Returns:** [CheckoutSelectors](../interfaces/checkoutselectors.md)





___

<a id="initializecustomer"></a>

###  initializeCustomer

► **initializeCustomer**(options?: *`any`*): `Promise`.<[CheckoutSelectors](../interfaces/checkoutselectors.md)>



*Defined in [checkout-sdk.d.ts:202](https://github.com/bigcommerce/checkout-sdk-js/blob/66bc013/dist/checkout-sdk.d.ts#L202)*



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| options | `any`   |  - |





**Returns:** `Promise`.<[CheckoutSelectors](../interfaces/checkoutselectors.md)>





___

<a id="initializepaymentmethod"></a>

###  initializePaymentMethod

► **initializePaymentMethod**(methodId: *`string`*, gatewayId?: *`undefined`⎮`string`*, options?: *`any`*): `Promise`.<[CheckoutSelectors](../interfaces/checkoutselectors.md)>



*Defined in [checkout-sdk.d.ts:196](https://github.com/bigcommerce/checkout-sdk-js/blob/66bc013/dist/checkout-sdk.d.ts#L196)*



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| methodId | `string`   |  - |
| gatewayId | `undefined`⎮`string`   |  - |
| options | `any`   |  - |





**Returns:** `Promise`.<[CheckoutSelectors](../interfaces/checkoutselectors.md)>





___

<a id="initializeshipping"></a>

###  initializeShipping

► **initializeShipping**(options?: *`any`*): `Promise`.<[CheckoutSelectors](../interfaces/checkoutselectors.md)>



*Defined in [checkout-sdk.d.ts:207](https://github.com/bigcommerce/checkout-sdk-js/blob/66bc013/dist/checkout-sdk.d.ts#L207)*



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| options | `any`   |  - |





**Returns:** `Promise`.<[CheckoutSelectors](../interfaces/checkoutselectors.md)>





___

<a id="loadbillingaddressfields"></a>

###  loadBillingAddressFields

► **loadBillingAddressFields**(options?: *[RequestOptions](../interfaces/requestoptions.md)*): `Promise`.<[CheckoutSelectors](../interfaces/checkoutselectors.md)>



*Defined in [checkout-sdk.d.ts:200](https://github.com/bigcommerce/checkout-sdk-js/blob/66bc013/dist/checkout-sdk.d.ts#L200)*



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| options | [RequestOptions](../interfaces/requestoptions.md)   |  - |





**Returns:** `Promise`.<[CheckoutSelectors](../interfaces/checkoutselectors.md)>





___

<a id="loadbillingcountries"></a>

###  loadBillingCountries

► **loadBillingCountries**(options?: *[RequestOptions](../interfaces/requestoptions.md)*): `Promise`.<[CheckoutSelectors](../interfaces/checkoutselectors.md)>



*Defined in [checkout-sdk.d.ts:198](https://github.com/bigcommerce/checkout-sdk-js/blob/66bc013/dist/checkout-sdk.d.ts#L198)*



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| options | [RequestOptions](../interfaces/requestoptions.md)   |  - |





**Returns:** `Promise`.<[CheckoutSelectors](../interfaces/checkoutselectors.md)>





___

<a id="loadcart"></a>

###  loadCart

► **loadCart**(options?: *[RequestOptions](../interfaces/requestoptions.md)*): `Promise`.<[CheckoutSelectors](../interfaces/checkoutselectors.md)>



*Defined in [checkout-sdk.d.ts:182](https://github.com/bigcommerce/checkout-sdk-js/blob/66bc013/dist/checkout-sdk.d.ts#L182)*



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| options | [RequestOptions](../interfaces/requestoptions.md)   |  - |





**Returns:** `Promise`.<[CheckoutSelectors](../interfaces/checkoutselectors.md)>





___

<a id="loadcheckout"></a>

###  loadCheckout

► **loadCheckout**(options?: *[RequestOptions](../interfaces/requestoptions.md)*): `Promise`.<[CheckoutSelectors](../interfaces/checkoutselectors.md)>



*Defined in [checkout-sdk.d.ts:181](https://github.com/bigcommerce/checkout-sdk-js/blob/66bc013/dist/checkout-sdk.d.ts#L181)*



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| options | [RequestOptions](../interfaces/requestoptions.md)   |  - |





**Returns:** `Promise`.<[CheckoutSelectors](../interfaces/checkoutselectors.md)>





___

<a id="loadinstruments"></a>

###  loadInstruments

► **loadInstruments**(): `Promise`.<[CheckoutSelectors](../interfaces/checkoutselectors.md)>



*Defined in [checkout-sdk.d.ts:216](https://github.com/bigcommerce/checkout-sdk-js/blob/66bc013/dist/checkout-sdk.d.ts#L216)*





**Returns:** `Promise`.<[CheckoutSelectors](../interfaces/checkoutselectors.md)>





___

<a id="loadorder"></a>

###  loadOrder

► **loadOrder**(orderId: *`number`*, options?: *[RequestOptions](../interfaces/requestoptions.md)*): `Promise`.<[CheckoutSelectors](../interfaces/checkoutselectors.md)>



*Defined in [checkout-sdk.d.ts:187](https://github.com/bigcommerce/checkout-sdk-js/blob/66bc013/dist/checkout-sdk.d.ts#L187)*



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



*Defined in [checkout-sdk.d.ts:195](https://github.com/bigcommerce/checkout-sdk-js/blob/66bc013/dist/checkout-sdk.d.ts#L195)*



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



*Defined in [checkout-sdk.d.ts:194](https://github.com/bigcommerce/checkout-sdk-js/blob/66bc013/dist/checkout-sdk.d.ts#L194)*



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| options | [RequestOptions](../interfaces/requestoptions.md)   |  - |





**Returns:** `Promise`.<[CheckoutSelectors](../interfaces/checkoutselectors.md)>





___

<a id="loadshippingaddressfields"></a>

###  loadShippingAddressFields

► **loadShippingAddressFields**(options?: *[RequestOptions](../interfaces/requestoptions.md)*): `Promise`.<[CheckoutSelectors](../interfaces/checkoutselectors.md)>



*Defined in [checkout-sdk.d.ts:201](https://github.com/bigcommerce/checkout-sdk-js/blob/66bc013/dist/checkout-sdk.d.ts#L201)*



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| options | [RequestOptions](../interfaces/requestoptions.md)   |  - |





**Returns:** `Promise`.<[CheckoutSelectors](../interfaces/checkoutselectors.md)>





___

<a id="loadshippingcountries"></a>

###  loadShippingCountries

► **loadShippingCountries**(options?: *[RequestOptions](../interfaces/requestoptions.md)*): `Promise`.<[CheckoutSelectors](../interfaces/checkoutselectors.md)>



*Defined in [checkout-sdk.d.ts:199](https://github.com/bigcommerce/checkout-sdk-js/blob/66bc013/dist/checkout-sdk.d.ts#L199)*



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| options | [RequestOptions](../interfaces/requestoptions.md)   |  - |





**Returns:** `Promise`.<[CheckoutSelectors](../interfaces/checkoutselectors.md)>





___

<a id="loadshippingoptions"></a>

###  loadShippingOptions

► **loadShippingOptions**(options?: *[RequestOptions](../interfaces/requestoptions.md)*): `Promise`.<[CheckoutSelectors](../interfaces/checkoutselectors.md)>



*Defined in [checkout-sdk.d.ts:206](https://github.com/bigcommerce/checkout-sdk-js/blob/66bc013/dist/checkout-sdk.d.ts#L206)*



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| options | [RequestOptions](../interfaces/requestoptions.md)   |  - |





**Returns:** `Promise`.<[CheckoutSelectors](../interfaces/checkoutselectors.md)>





___

<a id="notifystate"></a>

###  notifyState

► **notifyState**(): `void`



*Defined in [checkout-sdk.d.ts:179](https://github.com/bigcommerce/checkout-sdk-js/blob/66bc013/dist/checkout-sdk.d.ts#L179)*





**Returns:** `void`





___

<a id="removecoupon"></a>

###  removeCoupon

► **removeCoupon**(code: *`string`*, options?: *[RequestOptions](../interfaces/requestoptions.md)*): `Promise`.<[CheckoutSelectors](../interfaces/checkoutselectors.md)>



*Defined in [checkout-sdk.d.ts:213](https://github.com/bigcommerce/checkout-sdk-js/blob/66bc013/dist/checkout-sdk.d.ts#L213)*



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



*Defined in [checkout-sdk.d.ts:215](https://github.com/bigcommerce/checkout-sdk-js/blob/66bc013/dist/checkout-sdk.d.ts#L215)*



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| code | `string`   |  - |
| options | [RequestOptions](../interfaces/requestoptions.md)   |  - |





**Returns:** `Promise`.<[CheckoutSelectors](../interfaces/checkoutselectors.md)>





___

<a id="selectshippingoption"></a>

###  selectShippingOption

► **selectShippingOption**(addressId: *`string`*, shippingOptionId: *`string`*, options?: *`any`*): `Promise`.<[CheckoutSelectors](../interfaces/checkoutselectors.md)>



*Defined in [checkout-sdk.d.ts:209](https://github.com/bigcommerce/checkout-sdk-js/blob/66bc013/dist/checkout-sdk.d.ts#L209)*



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| addressId | `string`   |  - |
| shippingOptionId | `string`   |  - |
| options | `any`   |  - |





**Returns:** `Promise`.<[CheckoutSelectors](../interfaces/checkoutselectors.md)>





___

<a id="signincustomer"></a>

###  signInCustomer

► **signInCustomer**(credentials: *[CustomerCredentials](../interfaces/customercredentials.md)*, options?: *`any`*): `Promise`.<[CheckoutSelectors](../interfaces/checkoutselectors.md)>



*Defined in [checkout-sdk.d.ts:204](https://github.com/bigcommerce/checkout-sdk-js/blob/66bc013/dist/checkout-sdk.d.ts#L204)*



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| credentials | [CustomerCredentials](../interfaces/customercredentials.md)   |  - |
| options | `any`   |  - |





**Returns:** `Promise`.<[CheckoutSelectors](../interfaces/checkoutselectors.md)>





___

<a id="signoutcustomer"></a>

###  signOutCustomer

► **signOutCustomer**(options?: *`any`*): `Promise`.<[CheckoutSelectors](../interfaces/checkoutselectors.md)>



*Defined in [checkout-sdk.d.ts:205](https://github.com/bigcommerce/checkout-sdk-js/blob/66bc013/dist/checkout-sdk.d.ts#L205)*



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| options | `any`   |  - |





**Returns:** `Promise`.<[CheckoutSelectors](../interfaces/checkoutselectors.md)>





___

<a id="submitorder"></a>

###  submitOrder

► **submitOrder**(payload: *[OrderRequestBody](../interfaces/orderrequestbody.md)*, options?: *[RequestOptions](../interfaces/requestoptions.md)*): `Promise`.<[CheckoutSelectors](../interfaces/checkoutselectors.md)>



*Defined in [checkout-sdk.d.ts:188](https://github.com/bigcommerce/checkout-sdk-js/blob/66bc013/dist/checkout-sdk.d.ts#L188)*



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



*Defined in [checkout-sdk.d.ts:180](https://github.com/bigcommerce/checkout-sdk-js/blob/66bc013/dist/checkout-sdk.d.ts#L180)*



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



*Defined in [checkout-sdk.d.ts:211](https://github.com/bigcommerce/checkout-sdk-js/blob/66bc013/dist/checkout-sdk.d.ts#L211)*



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| address | [InternalAddress](../interfaces/internaladdress.md)   |  - |
| options | [RequestOptions](../interfaces/requestoptions.md)   |  - |





**Returns:** `Promise`.<[CheckoutSelectors](../interfaces/checkoutselectors.md)>





___

<a id="updateshippingaddress"></a>

###  updateShippingAddress

► **updateShippingAddress**(address: *[InternalAddress](../interfaces/internaladdress.md)*, options?: *`any`*): `Promise`.<[CheckoutSelectors](../interfaces/checkoutselectors.md)>



*Defined in [checkout-sdk.d.ts:210](https://github.com/bigcommerce/checkout-sdk-js/blob/66bc013/dist/checkout-sdk.d.ts#L210)*



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| address | [InternalAddress](../interfaces/internaladdress.md)   |  - |
| options | `any`   |  - |





**Returns:** `Promise`.<[CheckoutSelectors](../interfaces/checkoutselectors.md)>





___

<a id="vaultinstrument"></a>

###  vaultInstrument

► **vaultInstrument**(instrument: *`any`*): `Promise`.<[CheckoutSelectors](../interfaces/checkoutselectors.md)>



*Defined in [checkout-sdk.d.ts:217](https://github.com/bigcommerce/checkout-sdk-js/blob/66bc013/dist/checkout-sdk.d.ts#L217)*



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| instrument | `any`   |  - |





**Returns:** `Promise`.<[CheckoutSelectors](../interfaces/checkoutselectors.md)>





___

<a id="verifycart"></a>

###  verifyCart

► **verifyCart**(options?: *[RequestOptions](../interfaces/requestoptions.md)*): `Promise`.<[CheckoutSelectors](../interfaces/checkoutselectors.md)>



*Defined in [checkout-sdk.d.ts:186](https://github.com/bigcommerce/checkout-sdk-js/blob/66bc013/dist/checkout-sdk.d.ts#L186)*


*__deprecated__*: 



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| options | [RequestOptions](../interfaces/requestoptions.md)   |  - |





**Returns:** `Promise`.<[CheckoutSelectors](../interfaces/checkoutselectors.md)>





___


