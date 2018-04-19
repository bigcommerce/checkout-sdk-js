[@bigcommerce/checkout-sdk](../README.md) > [CheckoutClient](../classes/checkoutclient.md)



# Class: CheckoutClient

## Index

### Methods

* [applyCoupon](checkoutclient.md#applycoupon)
* [applyGiftCertificate](checkoutclient.md#applygiftcertificate)
* [finalizeOrder](checkoutclient.md#finalizeorder)
* [loadCart](checkoutclient.md#loadcart)
* [loadCheckout](checkoutclient.md#loadcheckout)
* [loadConfig](checkoutclient.md#loadconfig)
* [loadCountries](checkoutclient.md#loadcountries)
* [loadOrder](checkoutclient.md#loadorder)
* [loadPaymentMethod](checkoutclient.md#loadpaymentmethod)
* [loadPaymentMethods](checkoutclient.md#loadpaymentmethods)
* [loadShippingCountries](checkoutclient.md#loadshippingcountries)
* [loadShippingOptions](checkoutclient.md#loadshippingoptions)
* [removeCoupon](checkoutclient.md#removecoupon)
* [removeGiftCertificate](checkoutclient.md#removegiftcertificate)
* [selectShippingOption](checkoutclient.md#selectshippingoption)
* [signInCustomer](checkoutclient.md#signincustomer)
* [signOutCustomer](checkoutclient.md#signoutcustomer)
* [submitOrder](checkoutclient.md#submitorder)
* [updateBillingAddress](checkoutclient.md#updatebillingaddress)
* [updateShippingAddress](checkoutclient.md#updateshippingaddress)



---
## Methods
<a id="applycoupon"></a>

###  applyCoupon

► **applyCoupon**(code: *`string`*, options?: *[RequestOptions](../interfaces/requestoptions.md)*): `Promise`.<`Response`>



*Defined in [checkout-sdk.d.ts:34](https://github.com/bigcommerce/checkout-sdk-js/blob/1f51420/dist/checkout-sdk.d.ts#L34)*



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| code | `string`   |  - |
| options | [RequestOptions](../interfaces/requestoptions.md)   |  - |





**Returns:** `Promise`.<`Response`>





___

<a id="applygiftcertificate"></a>

###  applyGiftCertificate

► **applyGiftCertificate**(code: *`string`*, options?: *[RequestOptions](../interfaces/requestoptions.md)*): `Promise`.<`Response`>



*Defined in [checkout-sdk.d.ts:36](https://github.com/bigcommerce/checkout-sdk-js/blob/1f51420/dist/checkout-sdk.d.ts#L36)*



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| code | `string`   |  - |
| options | [RequestOptions](../interfaces/requestoptions.md)   |  - |





**Returns:** `Promise`.<`Response`>





___

<a id="finalizeorder"></a>

###  finalizeOrder

► **finalizeOrder**(orderId: *`number`*, options?: *[RequestOptions](../interfaces/requestoptions.md)*): `Promise`.<`Response`>



*Defined in [checkout-sdk.d.ts:23](https://github.com/bigcommerce/checkout-sdk-js/blob/1f51420/dist/checkout-sdk.d.ts#L23)*



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| orderId | `number`   |  - |
| options | [RequestOptions](../interfaces/requestoptions.md)   |  - |





**Returns:** `Promise`.<`Response`>





___

<a id="loadcart"></a>

###  loadCart

► **loadCart**(options?: *[RequestOptions](../interfaces/requestoptions.md)*): `Promise`.<`Response`>



*Defined in [checkout-sdk.d.ts:20](https://github.com/bigcommerce/checkout-sdk-js/blob/1f51420/dist/checkout-sdk.d.ts#L20)*



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| options | [RequestOptions](../interfaces/requestoptions.md)   |  - |





**Returns:** `Promise`.<`Response`>





___

<a id="loadcheckout"></a>

###  loadCheckout

► **loadCheckout**(options?: *[RequestOptions](../interfaces/requestoptions.md)*): `Promise`.<`Response`>



*Defined in [checkout-sdk.d.ts:19](https://github.com/bigcommerce/checkout-sdk-js/blob/1f51420/dist/checkout-sdk.d.ts#L19)*



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| options | [RequestOptions](../interfaces/requestoptions.md)   |  - |





**Returns:** `Promise`.<`Response`>





___

<a id="loadconfig"></a>

###  loadConfig

► **loadConfig**(options?: *[RequestOptions](../interfaces/requestoptions.md)*): `Promise`.<`Response`>



*Defined in [checkout-sdk.d.ts:38](https://github.com/bigcommerce/checkout-sdk-js/blob/1f51420/dist/checkout-sdk.d.ts#L38)*



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| options | [RequestOptions](../interfaces/requestoptions.md)   |  - |





**Returns:** `Promise`.<`Response`>





___

<a id="loadcountries"></a>

###  loadCountries

► **loadCountries**(options?: *[RequestOptions](../interfaces/requestoptions.md)*): `Promise`.<`Response`>



*Defined in [checkout-sdk.d.ts:26](https://github.com/bigcommerce/checkout-sdk-js/blob/1f51420/dist/checkout-sdk.d.ts#L26)*



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| options | [RequestOptions](../interfaces/requestoptions.md)   |  - |





**Returns:** `Promise`.<`Response`>





___

<a id="loadorder"></a>

###  loadOrder

► **loadOrder**(orderId: *`number`*, options?: *[RequestOptions](../interfaces/requestoptions.md)*): `Promise`.<`Response`>



*Defined in [checkout-sdk.d.ts:21](https://github.com/bigcommerce/checkout-sdk-js/blob/1f51420/dist/checkout-sdk.d.ts#L21)*



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| orderId | `number`   |  - |
| options | [RequestOptions](../interfaces/requestoptions.md)   |  - |





**Returns:** `Promise`.<`Response`>





___

<a id="loadpaymentmethod"></a>

###  loadPaymentMethod

► **loadPaymentMethod**(methodId: *`string`*, options?: *[RequestOptions](../interfaces/requestoptions.md)*): `Promise`.<`Response`>



*Defined in [checkout-sdk.d.ts:25](https://github.com/bigcommerce/checkout-sdk-js/blob/1f51420/dist/checkout-sdk.d.ts#L25)*



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| methodId | `string`   |  - |
| options | [RequestOptions](../interfaces/requestoptions.md)   |  - |





**Returns:** `Promise`.<`Response`>





___

<a id="loadpaymentmethods"></a>

###  loadPaymentMethods

► **loadPaymentMethods**(options?: *[RequestOptions](../interfaces/requestoptions.md)*): `Promise`.<`Response`>



*Defined in [checkout-sdk.d.ts:24](https://github.com/bigcommerce/checkout-sdk-js/blob/1f51420/dist/checkout-sdk.d.ts#L24)*



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| options | [RequestOptions](../interfaces/requestoptions.md)   |  - |





**Returns:** `Promise`.<`Response`>





___

<a id="loadshippingcountries"></a>

###  loadShippingCountries

► **loadShippingCountries**(options?: *[RequestOptions](../interfaces/requestoptions.md)*): `Promise`.<`Response`>



*Defined in [checkout-sdk.d.ts:27](https://github.com/bigcommerce/checkout-sdk-js/blob/1f51420/dist/checkout-sdk.d.ts#L27)*



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| options | [RequestOptions](../interfaces/requestoptions.md)   |  - |





**Returns:** `Promise`.<`Response`>





___

<a id="loadshippingoptions"></a>

###  loadShippingOptions

► **loadShippingOptions**(options?: *[RequestOptions](../interfaces/requestoptions.md)*): `Promise`.<`Response`>



*Defined in [checkout-sdk.d.ts:30](https://github.com/bigcommerce/checkout-sdk-js/blob/1f51420/dist/checkout-sdk.d.ts#L30)*



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| options | [RequestOptions](../interfaces/requestoptions.md)   |  - |





**Returns:** `Promise`.<`Response`>





___

<a id="removecoupon"></a>

###  removeCoupon

► **removeCoupon**(code: *`string`*, options?: *[RequestOptions](../interfaces/requestoptions.md)*): `Promise`.<`Response`>



*Defined in [checkout-sdk.d.ts:35](https://github.com/bigcommerce/checkout-sdk-js/blob/1f51420/dist/checkout-sdk.d.ts#L35)*



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| code | `string`   |  - |
| options | [RequestOptions](../interfaces/requestoptions.md)   |  - |





**Returns:** `Promise`.<`Response`>





___

<a id="removegiftcertificate"></a>

###  removeGiftCertificate

► **removeGiftCertificate**(code: *`string`*, options?: *[RequestOptions](../interfaces/requestoptions.md)*): `Promise`.<`Response`>



*Defined in [checkout-sdk.d.ts:37](https://github.com/bigcommerce/checkout-sdk-js/blob/1f51420/dist/checkout-sdk.d.ts#L37)*



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| code | `string`   |  - |
| options | [RequestOptions](../interfaces/requestoptions.md)   |  - |





**Returns:** `Promise`.<`Response`>





___

<a id="selectshippingoption"></a>

###  selectShippingOption

► **selectShippingOption**(addressId: *`string`*, shippingOptionId: *`string`*, options?: *[RequestOptions](../interfaces/requestoptions.md)*): `Promise`.<`Response`>



*Defined in [checkout-sdk.d.ts:31](https://github.com/bigcommerce/checkout-sdk-js/blob/1f51420/dist/checkout-sdk.d.ts#L31)*



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| addressId | `string`   |  - |
| shippingOptionId | `string`   |  - |
| options | [RequestOptions](../interfaces/requestoptions.md)   |  - |





**Returns:** `Promise`.<`Response`>





___

<a id="signincustomer"></a>

###  signInCustomer

► **signInCustomer**(credentials: *[CustomerCredentials](../interfaces/customercredentials.md)*, options?: *[RequestOptions](../interfaces/requestoptions.md)*): `Promise`.<`Response`>



*Defined in [checkout-sdk.d.ts:32](https://github.com/bigcommerce/checkout-sdk-js/blob/1f51420/dist/checkout-sdk.d.ts#L32)*



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| credentials | [CustomerCredentials](../interfaces/customercredentials.md)   |  - |
| options | [RequestOptions](../interfaces/requestoptions.md)   |  - |





**Returns:** `Promise`.<`Response`>





___

<a id="signoutcustomer"></a>

###  signOutCustomer

► **signOutCustomer**(options?: *[RequestOptions](../interfaces/requestoptions.md)*): `Promise`.<`Response`>



*Defined in [checkout-sdk.d.ts:33](https://github.com/bigcommerce/checkout-sdk-js/blob/1f51420/dist/checkout-sdk.d.ts#L33)*



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| options | [RequestOptions](../interfaces/requestoptions.md)   |  - |





**Returns:** `Promise`.<`Response`>





___

<a id="submitorder"></a>

###  submitOrder

► **submitOrder**(body: *[OrderRequestBody](../interfaces/orderrequestbody.md)*, options?: *[RequestOptions](../interfaces/requestoptions.md)*): `Promise`.<`Response`>



*Defined in [checkout-sdk.d.ts:22](https://github.com/bigcommerce/checkout-sdk-js/blob/1f51420/dist/checkout-sdk.d.ts#L22)*



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| body | [OrderRequestBody](../interfaces/orderrequestbody.md)   |  - |
| options | [RequestOptions](../interfaces/requestoptions.md)   |  - |





**Returns:** `Promise`.<`Response`>





___

<a id="updatebillingaddress"></a>

###  updateBillingAddress

► **updateBillingAddress**(address: *[InternalAddress](../interfaces/internaladdress.md)*, options?: *[RequestOptions](../interfaces/requestoptions.md)*): `Promise`.<`Response`>



*Defined in [checkout-sdk.d.ts:28](https://github.com/bigcommerce/checkout-sdk-js/blob/1f51420/dist/checkout-sdk.d.ts#L28)*



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| address | [InternalAddress](../interfaces/internaladdress.md)   |  - |
| options | [RequestOptions](../interfaces/requestoptions.md)   |  - |





**Returns:** `Promise`.<`Response`>





___

<a id="updateshippingaddress"></a>

###  updateShippingAddress

► **updateShippingAddress**(address: *[InternalAddress](../interfaces/internaladdress.md)*, options?: *[RequestOptions](../interfaces/requestoptions.md)*): `Promise`.<`Response`>



*Defined in [checkout-sdk.d.ts:29](https://github.com/bigcommerce/checkout-sdk-js/blob/1f51420/dist/checkout-sdk.d.ts#L29)*



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| address | [InternalAddress](../interfaces/internaladdress.md)   |  - |
| options | [RequestOptions](../interfaces/requestoptions.md)   |  - |





**Returns:** `Promise`.<`Response`>





___


