[@bigcommerce/checkout-sdk](../README.md) > [CheckoutSelector](../classes/checkoutselector.md)



# Class: CheckoutSelector


TODO: Convert this file into TypeScript properly i.e.: CheckoutMeta, Config, Country, Instrument, Field

## Index

### Methods

* [getBillingAddress](checkoutselector.md#getbillingaddress)
* [getBillingAddressFields](checkoutselector.md#getbillingaddressfields)
* [getBillingCountries](checkoutselector.md#getbillingcountries)
* [getCart](checkoutselector.md#getcart)
* [getCheckoutMeta](checkoutselector.md#getcheckoutmeta)
* [getConfig](checkoutselector.md#getconfig)
* [getCustomer](checkoutselector.md#getcustomer)
* [getInstruments](checkoutselector.md#getinstruments)
* [getOrder](checkoutselector.md#getorder)
* [getPaymentMethod](checkoutselector.md#getpaymentmethod)
* [getPaymentMethods](checkoutselector.md#getpaymentmethods)
* [getQuote](checkoutselector.md#getquote)
* [getSelectedPaymentMethod](checkoutselector.md#getselectedpaymentmethod)
* [getSelectedShippingOption](checkoutselector.md#getselectedshippingoption)
* [getShippingAddress](checkoutselector.md#getshippingaddress)
* [getShippingAddressFields](checkoutselector.md#getshippingaddressfields)
* [getShippingCountries](checkoutselector.md#getshippingcountries)
* [getShippingOptions](checkoutselector.md#getshippingoptions)
* [isPaymentDataRequired](checkoutselector.md#ispaymentdatarequired)
* [isPaymentDataSubmitted](checkoutselector.md#ispaymentdatasubmitted)



---
## Methods
<a id="getbillingaddress"></a>

###  getBillingAddress

► **getBillingAddress**(): [InternalAddress](../interfaces/internaladdress.md)⎮`undefined`



*Defined in [checkout-sdk.d.ts:125](https://github.com/bigcommerce/checkout-sdk-js/blob/66bc013/dist/checkout-sdk.d.ts#L125)*





**Returns:** [InternalAddress](../interfaces/internaladdress.md)⎮`undefined`





___

<a id="getbillingaddressfields"></a>

###  getBillingAddressFields

► **getBillingAddressFields**(countryCode: *`string`*): `any`[]



*Defined in [checkout-sdk.d.ts:144](https://github.com/bigcommerce/checkout-sdk-js/blob/66bc013/dist/checkout-sdk.d.ts#L144)*




**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| countryCode | `string`   |  - |





**Returns:** `any`[]







___

<a id="getbillingcountries"></a>

###  getBillingCountries

► **getBillingCountries**(): `any`[]



*Defined in [checkout-sdk.d.ts:129](https://github.com/bigcommerce/checkout-sdk-js/blob/66bc013/dist/checkout-sdk.d.ts#L129)*






**Returns:** `any`[]







___

<a id="getcart"></a>

###  getCart

► **getCart**(): [InternalCart](../interfaces/internalcart.md)⎮`undefined`



*Defined in [checkout-sdk.d.ts:133](https://github.com/bigcommerce/checkout-sdk-js/blob/66bc013/dist/checkout-sdk.d.ts#L133)*





**Returns:** [InternalCart](../interfaces/internalcart.md)⎮`undefined`





___

<a id="getcheckoutmeta"></a>

###  getCheckoutMeta

► **getCheckoutMeta**(): `any`



*Defined in [checkout-sdk.d.ts:111](https://github.com/bigcommerce/checkout-sdk-js/blob/66bc013/dist/checkout-sdk.d.ts#L111)*






**Returns:** `any`







___

<a id="getconfig"></a>

###  getConfig

► **getConfig**(): `any`



*Defined in [checkout-sdk.d.ts:117](https://github.com/bigcommerce/checkout-sdk-js/blob/66bc013/dist/checkout-sdk.d.ts#L117)*






**Returns:** `any`







___

<a id="getcustomer"></a>

###  getCustomer

► **getCustomer**(): [InternalCustomer](../interfaces/internalcustomer.md)⎮`undefined`



*Defined in [checkout-sdk.d.ts:134](https://github.com/bigcommerce/checkout-sdk-js/blob/66bc013/dist/checkout-sdk.d.ts#L134)*





**Returns:** [InternalCustomer](../interfaces/internalcustomer.md)⎮`undefined`





___

<a id="getinstruments"></a>

###  getInstruments

► **getInstruments**(): `any`[]



*Defined in [checkout-sdk.d.ts:140](https://github.com/bigcommerce/checkout-sdk-js/blob/66bc013/dist/checkout-sdk.d.ts#L140)*






**Returns:** `any`[]







___

<a id="getorder"></a>

###  getOrder

► **getOrder**(): [InternalOrder](../interfaces/internalorder.md)⎮`undefined`



*Defined in [checkout-sdk.d.ts:112](https://github.com/bigcommerce/checkout-sdk-js/blob/66bc013/dist/checkout-sdk.d.ts#L112)*





**Returns:** [InternalOrder](../interfaces/internalorder.md)⎮`undefined`





___

<a id="getpaymentmethod"></a>

###  getPaymentMethod

► **getPaymentMethod**(methodId: *`string`*, gatewayId?: *`undefined`⎮`string`*): [PaymentMethod](../interfaces/paymentmethod.md)⎮`undefined`



*Defined in [checkout-sdk.d.ts:131](https://github.com/bigcommerce/checkout-sdk-js/blob/66bc013/dist/checkout-sdk.d.ts#L131)*



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| methodId | `string`   |  - |
| gatewayId | `undefined`⎮`string`   |  - |





**Returns:** [PaymentMethod](../interfaces/paymentmethod.md)⎮`undefined`





___

<a id="getpaymentmethods"></a>

###  getPaymentMethods

► **getPaymentMethods**(): [PaymentMethod](../interfaces/paymentmethod.md)[]⎮`undefined`



*Defined in [checkout-sdk.d.ts:130](https://github.com/bigcommerce/checkout-sdk-js/blob/66bc013/dist/checkout-sdk.d.ts#L130)*





**Returns:** [PaymentMethod](../interfaces/paymentmethod.md)[]⎮`undefined`





___

<a id="getquote"></a>

###  getQuote

► **getQuote**(): [InternalQuote](../interfaces/internalquote.md)⎮`undefined`



*Defined in [checkout-sdk.d.ts:113](https://github.com/bigcommerce/checkout-sdk-js/blob/66bc013/dist/checkout-sdk.d.ts#L113)*





**Returns:** [InternalQuote](../interfaces/internalquote.md)⎮`undefined`





___

<a id="getselectedpaymentmethod"></a>

###  getSelectedPaymentMethod

► **getSelectedPaymentMethod**(): [PaymentMethod](../interfaces/paymentmethod.md)⎮`undefined`



*Defined in [checkout-sdk.d.ts:132](https://github.com/bigcommerce/checkout-sdk-js/blob/66bc013/dist/checkout-sdk.d.ts#L132)*





**Returns:** [PaymentMethod](../interfaces/paymentmethod.md)⎮`undefined`





___

<a id="getselectedshippingoption"></a>

###  getSelectedShippingOption

► **getSelectedShippingOption**(): [InternalShippingOption](../interfaces/internalshippingoption.md)⎮`undefined`



*Defined in [checkout-sdk.d.ts:120](https://github.com/bigcommerce/checkout-sdk-js/blob/66bc013/dist/checkout-sdk.d.ts#L120)*





**Returns:** [InternalShippingOption](../interfaces/internalshippingoption.md)⎮`undefined`





___

<a id="getshippingaddress"></a>

###  getShippingAddress

► **getShippingAddress**(): [InternalAddress](../interfaces/internaladdress.md)⎮`undefined`



*Defined in [checkout-sdk.d.ts:118](https://github.com/bigcommerce/checkout-sdk-js/blob/66bc013/dist/checkout-sdk.d.ts#L118)*





**Returns:** [InternalAddress](../interfaces/internaladdress.md)⎮`undefined`





___

<a id="getshippingaddressfields"></a>

###  getShippingAddressFields

► **getShippingAddressFields**(countryCode: *`string`*): `any`[]



*Defined in [checkout-sdk.d.ts:148](https://github.com/bigcommerce/checkout-sdk-js/blob/66bc013/dist/checkout-sdk.d.ts#L148)*




**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| countryCode | `string`   |  - |





**Returns:** `any`[]







___

<a id="getshippingcountries"></a>

###  getShippingCountries

► **getShippingCountries**(): `any`[]



*Defined in [checkout-sdk.d.ts:124](https://github.com/bigcommerce/checkout-sdk-js/blob/66bc013/dist/checkout-sdk.d.ts#L124)*






**Returns:** `any`[]







___

<a id="getshippingoptions"></a>

###  getShippingOptions

► **getShippingOptions**(): [InternalShippingOptionList](../interfaces/internalshippingoptionlist.md)⎮`undefined`



*Defined in [checkout-sdk.d.ts:119](https://github.com/bigcommerce/checkout-sdk-js/blob/66bc013/dist/checkout-sdk.d.ts#L119)*





**Returns:** [InternalShippingOptionList](../interfaces/internalshippingoptionlist.md)⎮`undefined`





___

<a id="ispaymentdatarequired"></a>

###  isPaymentDataRequired

► **isPaymentDataRequired**(useStoreCredit?: *`undefined`⎮`true`⎮`false`*): `boolean`



*Defined in [checkout-sdk.d.ts:135](https://github.com/bigcommerce/checkout-sdk-js/blob/66bc013/dist/checkout-sdk.d.ts#L135)*



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| useStoreCredit | `undefined`⎮`true`⎮`false`   |  - |





**Returns:** `boolean`





___

<a id="ispaymentdatasubmitted"></a>

###  isPaymentDataSubmitted

► **isPaymentDataSubmitted**(methodId: *`string`*, gatewayId?: *`undefined`⎮`string`*): `boolean`



*Defined in [checkout-sdk.d.ts:136](https://github.com/bigcommerce/checkout-sdk-js/blob/66bc013/dist/checkout-sdk.d.ts#L136)*



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| methodId | `string`   |  - |
| gatewayId | `undefined`⎮`string`   |  - |





**Returns:** `boolean`





___


