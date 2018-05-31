[@bigcommerce/checkout-sdk](../README.md) > [CheckoutStoreSelector](../classes/checkoutstoreselector.md)

# Class: CheckoutStoreSelector

Responsible for getting the state of the current checkout.

This object has a set of methods that allow you to get a specific piece of checkout information, such as shipping and billing details.

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

Gets the billing address of an order.

**Returns:** [InternalAddress](../interfaces/internaladdress.md) |
`undefined`

The billing address object if it is loaded, otherwise undefined.

___
<a id="getbillingaddressfields"></a>

###  getBillingAddressFields

▸ **getBillingAddressFields**(countryCode: *`string`*): [FormField](../interfaces/formfield.md)[]

Gets a set of form fields that should be presented to customers in order to capture their billing address for a specific country.

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| countryCode | `string` |  A 2-letter country code (ISO 3166-1 alpha-2). |

**Returns:** [FormField](../interfaces/formfield.md)[]
The set of billing address form fields if it is loaded,
otherwise undefined.

___
<a id="getbillingcountries"></a>

###  getBillingCountries

▸ **getBillingCountries**(): [Country](../interfaces/country.md)[] |`undefined`

Gets a list of countries available for billing.

**Returns:** [Country](../interfaces/country.md)[] |
`undefined`

The list of countries if it is loaded, otherwise undefined.

___
<a id="getcart"></a>

###  getCart

▸ **getCart**(): [InternalCart](../interfaces/internalcart.md) |`undefined`

Gets the current cart.

**Returns:** [InternalCart](../interfaces/internalcart.md) |
`undefined`

The current cart object if it is loaded, otherwise undefined.

___
<a id="getconfig"></a>

###  getConfig

▸ **getConfig**(): [StoreConfig](../interfaces/storeconfig.md) |`undefined`

Gets the checkout configuration of a store.

**Returns:** [StoreConfig](../interfaces/storeconfig.md) |
`undefined`

The configuration object if it is loaded, otherwise undefined.

___
<a id="getcustomer"></a>

###  getCustomer

▸ **getCustomer**(): [InternalCustomer](../interfaces/internalcustomer.md) |`undefined`

Gets the current customer.

**Returns:** [InternalCustomer](../interfaces/internalcustomer.md) |
`undefined`

The current customer object if it is loaded, otherwise
undefined.

___
<a id="getinstruments"></a>

###  getInstruments

▸ **getInstruments**(): [Instrument](../interfaces/instrument.md)[] |`undefined`

Gets a list of payment instruments associated with the current customer.

**Returns:** [Instrument](../interfaces/instrument.md)[] |
`undefined`

The list of payment instruments if it is loaded, otherwise undefined.

___
<a id="getorder"></a>

###  getOrder

▸ **getOrder**(): [InternalOrder](../interfaces/internalorder.md) |[InternalIncompleteOrder](../interfaces/internalincompleteorder.md) |`undefined`

Gets the current order.

If the order is not submitted, the method returns the order as incomplete. Otherwise, it returns the order as complete with an identifier.

**Returns:** [InternalOrder](../interfaces/internalorder.md) |
[InternalIncompleteOrder](../interfaces/internalincompleteorder.md) |
`undefined`

The current order if it is loaded, otherwise undefined.

___
<a id="getpaymentmethod"></a>

###  getPaymentMethod

▸ **getPaymentMethod**(methodId: *`string`*, gatewayId?: *`undefined` |`string`*): [PaymentMethod](../interfaces/paymentmethod.md) |`undefined`

Gets a payment method by an id.

The method returns undefined if unable to find a payment method with the specified id, either because it is not available for the customer, or it is not loaded.

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| methodId | `string` |  The identifier of the payment method. |
| `Optional` gatewayId | `undefined` |
`string`
 |  The identifier of a payment provider providing the payment method. |

**Returns:** [PaymentMethod](../interfaces/paymentmethod.md) |
`undefined`

The payment method object if loaded and available, otherwise,
undefined.

___
<a id="getpaymentmethods"></a>

###  getPaymentMethods

▸ **getPaymentMethods**(): [PaymentMethod](../interfaces/paymentmethod.md)[] |`undefined`

Gets a list of payment methods available for checkout.

**Returns:** [PaymentMethod](../interfaces/paymentmethod.md)[] |
`undefined`

The list of payment methods if it is loaded, otherwise undefined.

___
<a id="getquote"></a>

###  getQuote

▸ **getQuote**(): [InternalQuote](../interfaces/internalquote.md) |`undefined`

Gets the current quote.
*__deprecated__*: This method will be replaced in the future.

**Returns:** [InternalQuote](../interfaces/internalquote.md) |
`undefined`

The current quote if it is loaded, otherwise undefined.

___
<a id="getselectedpaymentmethod"></a>

###  getSelectedPaymentMethod

▸ **getSelectedPaymentMethod**(): [PaymentMethod](../interfaces/paymentmethod.md) |`undefined`

Gets the payment method that is selected for checkout.

**Returns:** [PaymentMethod](../interfaces/paymentmethod.md) |
`undefined`

The payment method object if there is a selected method;
undefined if otherwise.

___
<a id="getselectedshippingoption"></a>

###  getSelectedShippingOption

▸ **getSelectedShippingOption**(): [InternalShippingOption](../interfaces/internalshippingoption.md) |`undefined`

Gets the selected shipping option for the current checkout.

**Returns:** [InternalShippingOption](../interfaces/internalshippingoption.md) |
`undefined`

The shipping option object if there is a selected option,
otherwise undefined.

___
<a id="getshippingaddress"></a>

###  getShippingAddress

▸ **getShippingAddress**(): [InternalAddress](../interfaces/internaladdress.md) |`undefined`

Gets the shipping address of the current checkout.

If the address is partially complete, it may not have shipping options associated with it.

**Returns:** [InternalAddress](../interfaces/internaladdress.md) |
`undefined`

The shipping address object if it is loaded, otherwise
undefined.

___
<a id="getshippingaddressfields"></a>

###  getShippingAddressFields

▸ **getShippingAddressFields**(countryCode: *`string`*): [FormField](../interfaces/formfield.md)[]

Gets a set of form fields that should be presented to customers in order to capture their shipping address for a specific country.

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| countryCode | `string` |  A 2-letter country code (ISO 3166-1 alpha-2). |

**Returns:** [FormField](../interfaces/formfield.md)[]
The set of shipping address form fields if it is loaded,
otherwise undefined.

___
<a id="getshippingcountries"></a>

###  getShippingCountries

▸ **getShippingCountries**(): [Country](../interfaces/country.md)[] |`undefined`

Gets a list of countries available for shipping.

**Returns:** [Country](../interfaces/country.md)[] |
`undefined`

The list of countries if it is loaded, otherwise undefined.

___
<a id="getshippingoptions"></a>

###  getShippingOptions

▸ **getShippingOptions**(): [InternalShippingOptionList](../interfaces/internalshippingoptionlist.md) |`undefined`

Gets a list of shipping options available for each shipping address.

If there is no shipping address assigned to the current checkout, the list of shipping options will be empty.

**Returns:** [InternalShippingOptionList](../interfaces/internalshippingoptionlist.md) |
`undefined`

The list of shipping options per address if loaded, otherwise
undefined.

___
<a id="ispaymentdatarequired"></a>

###  isPaymentDataRequired

▸ **isPaymentDataRequired**(useStoreCredit?: *`undefined` |`true` |`false`*): `boolean`

Checks if payment data is required or not.

If payment data is required, customers should be prompted to enter their payment details.

```js
if (state.checkout.isPaymentDataRequired()) {
    // Render payment form
} else {
    // Render "Payment is not required for this order" message
}
```

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| `Optional` useStoreCredit | `undefined` |
`true` |
`false`
 |  If true, check whether payment data is required with store credit applied; otherwise, check without store credit. |

**Returns:** `boolean`
True if payment data is required, otherwise false.

___
<a id="ispaymentdatasubmitted"></a>

###  isPaymentDataSubmitted

▸ **isPaymentDataSubmitted**(methodId: *`string`*, gatewayId?: *`undefined` |`string`*): `boolean`

Checks if payment data is submitted or not.

If payment data is already submitted using a payment method, customers should not be prompted to enter their payment details again.

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| methodId | `string` |  The identifier of the payment method. |
| `Optional` gatewayId | `undefined` |
`string`
 |  The identifier of a payment provider providing the payment method. |

**Returns:** `boolean`
True if payment data is submitted, otherwise false.

___

