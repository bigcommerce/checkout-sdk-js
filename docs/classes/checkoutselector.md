[@bigcommerce/checkout-sdk](../README.md) > [CheckoutSelector](../classes/checkoutselector.md)



# Class: CheckoutSelector


TODO: Convert this file into TypeScript properly i.e.: CheckoutMeta, Config, Country, Instrument, Field

## Index

### Methods

* [getBillingAddress](checkoutselector.md#getbillingaddress)
* [getBillingAddressFields](checkoutselector.md#getbillingaddressfields)
* [getBillingCountries](checkoutselector.md#getbillingcountries)
* [getCart](checkoutselector.md#getcart)
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








**Returns:** [InternalAddress](../interfaces/internaladdress.md)⎮`undefined`





___

<a id="getbillingaddressfields"></a>

###  getBillingAddressFields

► **getBillingAddressFields**(countryCode: *`string`*): `any`[]







**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| countryCode | `string`   |  - |





**Returns:** `any`[]







___

<a id="getbillingcountries"></a>

###  getBillingCountries

► **getBillingCountries**(): `any`[]









**Returns:** `any`[]







___

<a id="getcart"></a>

###  getCart

► **getCart**(): [InternalCart](../interfaces/internalcart.md)⎮`undefined`








**Returns:** [InternalCart](../interfaces/internalcart.md)⎮`undefined`





___

<a id="getconfig"></a>

###  getConfig

► **getConfig**(): [StoreConfig](../interfaces/storeconfig.md)⎮`undefined`








**Returns:** [StoreConfig](../interfaces/storeconfig.md)⎮`undefined`





___

<a id="getcustomer"></a>

###  getCustomer

► **getCustomer**(): [InternalCustomer](../interfaces/internalcustomer.md)⎮`undefined`








**Returns:** [InternalCustomer](../interfaces/internalcustomer.md)⎮`undefined`





___

<a id="getinstruments"></a>

###  getInstruments

► **getInstruments**(): `any`[]









**Returns:** `any`[]







___

<a id="getorder"></a>

###  getOrder

► **getOrder**(): [InternalOrder](../interfaces/internalorder.md)⎮`undefined`








**Returns:** [InternalOrder](../interfaces/internalorder.md)⎮`undefined`





___

<a id="getpaymentmethod"></a>

###  getPaymentMethod

► **getPaymentMethod**(methodId: *`string`*, gatewayId?: *`undefined`⎮`string`*): [PaymentMethod](../interfaces/paymentmethod.md)⎮`undefined`






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








**Returns:** [PaymentMethod](../interfaces/paymentmethod.md)[]⎮`undefined`





___

<a id="getquote"></a>

###  getQuote

► **getQuote**(): [InternalQuote](../interfaces/internalquote.md)⎮`undefined`








**Returns:** [InternalQuote](../interfaces/internalquote.md)⎮`undefined`





___

<a id="getselectedpaymentmethod"></a>

###  getSelectedPaymentMethod

► **getSelectedPaymentMethod**(): [PaymentMethod](../interfaces/paymentmethod.md)⎮`undefined`








**Returns:** [PaymentMethod](../interfaces/paymentmethod.md)⎮`undefined`





___

<a id="getselectedshippingoption"></a>

###  getSelectedShippingOption

► **getSelectedShippingOption**(): [InternalShippingOption](../interfaces/internalshippingoption.md)⎮`undefined`








**Returns:** [InternalShippingOption](../interfaces/internalshippingoption.md)⎮`undefined`





___

<a id="getshippingaddress"></a>

###  getShippingAddress

► **getShippingAddress**(): [InternalAddress](../interfaces/internaladdress.md)⎮`undefined`








**Returns:** [InternalAddress](../interfaces/internaladdress.md)⎮`undefined`





___

<a id="getshippingaddressfields"></a>

###  getShippingAddressFields

► **getShippingAddressFields**(countryCode: *`string`*): `any`[]







**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| countryCode | `string`   |  - |





**Returns:** `any`[]







___

<a id="getshippingcountries"></a>

###  getShippingCountries

► **getShippingCountries**(): `any`[]









**Returns:** `any`[]







___

<a id="getshippingoptions"></a>

###  getShippingOptions

► **getShippingOptions**(): [InternalShippingOptionList](../interfaces/internalshippingoptionlist.md)⎮`undefined`








**Returns:** [InternalShippingOptionList](../interfaces/internalshippingoptionlist.md)⎮`undefined`





___

<a id="ispaymentdatarequired"></a>

###  isPaymentDataRequired

► **isPaymentDataRequired**(useStoreCredit?: *`undefined`⎮`true`⎮`false`*): `boolean`






**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| useStoreCredit | `undefined`⎮`true`⎮`false`   |  - |





**Returns:** `boolean`





___

<a id="ispaymentdatasubmitted"></a>

###  isPaymentDataSubmitted

► **isPaymentDataSubmitted**(methodId: *`string`*, gatewayId?: *`undefined`⎮`string`*): `boolean`






**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| methodId | `string`   |  - |
| gatewayId | `undefined`⎮`string`   |  - |





**Returns:** `boolean`





___


