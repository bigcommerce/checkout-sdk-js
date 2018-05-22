[@bigcommerce/checkout-sdk](../README.md) > [CheckoutStoreSelector](../classes/checkoutstoreselector.md)

# Class: CheckoutStoreSelector

TODO: Convert this file into TypeScript properly i.e.: Instrument

## Hierarchy

**CheckoutStoreSelector**

## Index

### Methods

* [getBillingAddress](checkoutstoreselector.md#getbillingaddress)
* [getBillingAddressFields](checkoutstoreselector.md#getbillingaddressfields)
* [getBillingCountries](checkoutstoreselector.md#getbillingcountries)
* [getCart](checkoutstoreselector.md#getcart)
* [getConfig](checkoutstoreselector.md#getconfig)
* [getCustomer](checkoutstoreselector.md#getcustomer)
* [getInstruments](checkoutstoreselector.md#getinstruments)
* [getOrder](checkoutstoreselector.md#getorder)
* [getPaymentMethod](checkoutstoreselector.md#getpaymentmethod)
* [getPaymentMethods](checkoutstoreselector.md#getpaymentmethods)
* [getQuote](checkoutstoreselector.md#getquote)
* [getSelectedPaymentMethod](checkoutstoreselector.md#getselectedpaymentmethod)
* [getSelectedShippingOption](checkoutstoreselector.md#getselectedshippingoption)
* [getShippingAddress](checkoutstoreselector.md#getshippingaddress)
* [getShippingAddressFields](checkoutstoreselector.md#getshippingaddressfields)
* [getShippingCountries](checkoutstoreselector.md#getshippingcountries)
* [getShippingOptions](checkoutstoreselector.md#getshippingoptions)
* [isPaymentDataRequired](checkoutstoreselector.md#ispaymentdatarequired)
* [isPaymentDataSubmitted](checkoutstoreselector.md#ispaymentdatasubmitted)

---

## Methods

<a id="getbillingaddress"></a>

###  getBillingAddress

▸ **getBillingAddress**(): [InternalAddress](../interfaces/internaladdress.md) |`undefined`

**Returns:** [InternalAddress](../interfaces/internaladdress.md) |
`undefined`

___
<a id="getbillingaddressfields"></a>

###  getBillingAddressFields

▸ **getBillingAddressFields**(countryCode: *`string`*): [FormField](../interfaces/formfield.md)[]

**Parameters:**

| Param | Type |
| ------ | ------ |
| countryCode | `string` | 

**Returns:** [FormField](../interfaces/formfield.md)[]

___
<a id="getbillingcountries"></a>

###  getBillingCountries

▸ **getBillingCountries**(): [Country](../interfaces/country.md)[] |`undefined`

**Returns:** [Country](../interfaces/country.md)[] |
`undefined`

___
<a id="getcart"></a>

###  getCart

▸ **getCart**(): [InternalCart](../interfaces/internalcart.md) |`undefined`

**Returns:** [InternalCart](../interfaces/internalcart.md) |
`undefined`

___
<a id="getconfig"></a>

###  getConfig

▸ **getConfig**(): [StoreConfig](../interfaces/storeconfig.md) |`undefined`

**Returns:** [StoreConfig](../interfaces/storeconfig.md) |
`undefined`

___
<a id="getcustomer"></a>

###  getCustomer

▸ **getCustomer**(): [InternalCustomer](../interfaces/internalcustomer.md) |`undefined`

**Returns:** [InternalCustomer](../interfaces/internalcustomer.md) |
`undefined`

___
<a id="getinstruments"></a>

###  getInstruments

▸ **getInstruments**(): [Instrument](../interfaces/instrument.md)[] |`undefined`

**Returns:** [Instrument](../interfaces/instrument.md)[] |
`undefined`

___
<a id="getorder"></a>

###  getOrder

▸ **getOrder**(): [InternalOrder](../interfaces/internalorder.md) |[InternalIncompleteOrder](../interfaces/internalincompleteorder.md) |`undefined`

**Returns:** [InternalOrder](../interfaces/internalorder.md) |
[InternalIncompleteOrder](../interfaces/internalincompleteorder.md) |
`undefined`

___
<a id="getpaymentmethod"></a>

###  getPaymentMethod

▸ **getPaymentMethod**(methodId: *`string`*, gatewayId?: *`undefined` |`string`*): [PaymentMethod](../interfaces/paymentmethod.md) |`undefined`

**Parameters:**

| Param | Type |
| ------ | ------ |
| methodId | `string` | 
| `Optional` gatewayId | `undefined` |
`string`
 | 

**Returns:** [PaymentMethod](../interfaces/paymentmethod.md) |
`undefined`

___
<a id="getpaymentmethods"></a>

###  getPaymentMethods

▸ **getPaymentMethods**(): [PaymentMethod](../interfaces/paymentmethod.md)[] |`undefined`

**Returns:** [PaymentMethod](../interfaces/paymentmethod.md)[] |
`undefined`

___
<a id="getquote"></a>

###  getQuote

▸ **getQuote**(): [InternalQuote](../interfaces/internalquote.md) |`undefined`

**Returns:** [InternalQuote](../interfaces/internalquote.md) |
`undefined`

___
<a id="getselectedpaymentmethod"></a>

###  getSelectedPaymentMethod

▸ **getSelectedPaymentMethod**(): [PaymentMethod](../interfaces/paymentmethod.md) |`undefined`

**Returns:** [PaymentMethod](../interfaces/paymentmethod.md) |
`undefined`

___
<a id="getselectedshippingoption"></a>

###  getSelectedShippingOption

▸ **getSelectedShippingOption**(): [InternalShippingOption](../interfaces/internalshippingoption.md) |`undefined`

**Returns:** [InternalShippingOption](../interfaces/internalshippingoption.md) |
`undefined`

___
<a id="getshippingaddress"></a>

###  getShippingAddress

▸ **getShippingAddress**(): [InternalAddress](../interfaces/internaladdress.md) |`undefined`

**Returns:** [InternalAddress](../interfaces/internaladdress.md) |
`undefined`

___
<a id="getshippingaddressfields"></a>

###  getShippingAddressFields

▸ **getShippingAddressFields**(countryCode: *`string`*): [FormField](../interfaces/formfield.md)[]

**Parameters:**

| Param | Type |
| ------ | ------ |
| countryCode | `string` | 

**Returns:** [FormField](../interfaces/formfield.md)[]

___
<a id="getshippingcountries"></a>

###  getShippingCountries

▸ **getShippingCountries**(): [Country](../interfaces/country.md)[] |`undefined`

**Returns:** [Country](../interfaces/country.md)[] |
`undefined`

___
<a id="getshippingoptions"></a>

###  getShippingOptions

▸ **getShippingOptions**(): [InternalShippingOptionList](../interfaces/internalshippingoptionlist.md) |`undefined`

**Returns:** [InternalShippingOptionList](../interfaces/internalshippingoptionlist.md) |
`undefined`

___
<a id="ispaymentdatarequired"></a>

###  isPaymentDataRequired

▸ **isPaymentDataRequired**(useStoreCredit?: *`undefined` |`true` |`false`*): `boolean`

**Parameters:**

| Param | Type |
| ------ | ------ |
| `Optional` useStoreCredit | `undefined` |
`true` |
`false`
 | 

**Returns:** `boolean`

___
<a id="ispaymentdatasubmitted"></a>

###  isPaymentDataSubmitted

▸ **isPaymentDataSubmitted**(methodId: *`string`*, gatewayId?: *`undefined` |`string`*): `boolean`

**Parameters:**

| Param | Type |
| ------ | ------ |
| methodId | `string` | 
| `Optional` gatewayId | `undefined` |
`string`
 | 

**Returns:** `boolean`

___

