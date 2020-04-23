[@bigcommerce/checkout-sdk](../README.md) > [CheckoutStoreSelector](../interfaces/checkoutstoreselector.md)

# CheckoutStoreSelector

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
* [getCheckout](checkoutstoreselector.md#getcheckout)
* [getConfig](checkoutstoreselector.md#getconfig)
* [getConsignments](checkoutstoreselector.md#getconsignments)
* [getCoupons](checkoutstoreselector.md#getcoupons)
* [getCustomer](checkoutstoreselector.md#getcustomer)
* [getGiftCertificates](checkoutstoreselector.md#getgiftcertificates)
* [getInstruments](checkoutstoreselector.md#getinstruments)
* [getOrder](checkoutstoreselector.md#getorder)
* [getPaymentMethod](checkoutstoreselector.md#getpaymentmethod)
* [getPaymentMethods](checkoutstoreselector.md#getpaymentmethods)
* [getSelectedPaymentMethod](checkoutstoreselector.md#getselectedpaymentmethod)
* [getSelectedShippingOption](checkoutstoreselector.md#getselectedshippingoption)
* [getShippingAddress](checkoutstoreselector.md#getshippingaddress)
* [getShippingAddressFields](checkoutstoreselector.md#getshippingaddressfields)
* [getShippingCountries](checkoutstoreselector.md#getshippingcountries)
* [getShippingOptions](checkoutstoreselector.md#getshippingoptions)
* [getSignInEmail](checkoutstoreselector.md#getsigninemail)
* [isPaymentDataRequired](checkoutstoreselector.md#ispaymentdatarequired)
* [isPaymentDataSubmitted](checkoutstoreselector.md#ispaymentdatasubmitted)

---

## Methods

<a id="getbillingaddress"></a>

###  getBillingAddress

▸ **getBillingAddress**():  [BillingAddress](billingaddress.md) &#124; `undefined`

Gets the billing address of an order.

**Returns:**  [BillingAddress](billingaddress.md) &#124; `undefined`

The billing address object if it is loaded, otherwise undefined.

___
<a id="getbillingaddressfields"></a>

###  getBillingAddressFields

▸ **getBillingAddressFields**(countryCode: *`string`*): [FormField](formfield.md)[]

Gets a set of form fields that should be presented to customers in order to capture their billing address for a specific country.

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| countryCode | `string` |  A 2-letter country code (ISO 3166-1 alpha-2). |

**Returns:** [FormField](formfield.md)[]
The set of billing address form fields if it is loaded,
otherwise undefined.

___
<a id="getbillingcountries"></a>

###  getBillingCountries

▸ **getBillingCountries**():  [Country](country.md)[] &#124; `undefined`

Gets a list of countries available for billing.

**Returns:**  [Country](country.md)[] &#124; `undefined`

The list of countries if it is loaded, otherwise undefined.

___
<a id="getcart"></a>

###  getCart

▸ **getCart**():  [Cart](cart.md) &#124; `undefined`

Gets the current cart.

**Returns:**  [Cart](cart.md) &#124; `undefined`

The current cart object if it is loaded, otherwise undefined.

___
<a id="getcheckout"></a>

###  getCheckout

▸ **getCheckout**():  [Checkout](checkout.md) &#124; `undefined`

Gets the current checkout.

**Returns:**  [Checkout](checkout.md) &#124; `undefined`

The current checkout if it is loaded, otherwise undefined.

___
<a id="getconfig"></a>

###  getConfig

▸ **getConfig**():  [StoreConfig](storeconfig.md) &#124; `undefined`

Gets the checkout configuration of a store.

**Returns:**  [StoreConfig](storeconfig.md) &#124; `undefined`

The configuration object if it is loaded, otherwise undefined.

___
<a id="getconsignments"></a>

###  getConsignments

▸ **getConsignments**():  [Consignment](consignment.md)[] &#124; `undefined`

Gets a list of consignments.

If there are no consignments created for to the current checkout, the list will be empty.

**Returns:**  [Consignment](consignment.md)[] &#124; `undefined`

The list of consignments if any, otherwise undefined.

___
<a id="getcoupons"></a>

###  getCoupons

▸ **getCoupons**():  [Coupon](coupon.md)[] &#124; `undefined`

Gets a list of coupons that are applied to the current checkout.

**Returns:**  [Coupon](coupon.md)[] &#124; `undefined`

The list of applied coupons if there is any, otherwise undefined.

___
<a id="getcustomer"></a>

###  getCustomer

▸ **getCustomer**():  [Customer](customer.md) &#124; `undefined`

Gets the current customer.

**Returns:**  [Customer](customer.md) &#124; `undefined`

The current customer object if it is loaded, otherwise
undefined.

___
<a id="getgiftcertificates"></a>

###  getGiftCertificates

▸ **getGiftCertificates**():  [GiftCertificate](giftcertificate.md)[] &#124; `undefined`

Gets a list of gift certificates that are applied to the current checkout.

**Returns:**  [GiftCertificate](giftcertificate.md)[] &#124; `undefined`

The list of applied gift certificates if there is any, otherwise undefined.

___
<a id="getinstruments"></a>

###  getInstruments

▸ **getInstruments**():  [Instrument](../#instrument)[] &#124; `undefined`

▸ **getInstruments**(paymentMethod: *[PaymentMethod](paymentmethod.md)*):  [PaymentInstrument](../#paymentinstrument)[] &#124; `undefined`

Gets a list of payment instruments associated with the current customer.

**Returns:**  [Instrument](../#instrument)[] &#124; `undefined`

The list of payment instruments if it is loaded, otherwise undefined.

**Parameters:**

| Param | Type |
| ------ | ------ |
| paymentMethod | [PaymentMethod](paymentmethod.md) |

**Returns:**  [PaymentInstrument](../#paymentinstrument)[] &#124; `undefined`

___
<a id="getorder"></a>

###  getOrder

▸ **getOrder**():  [Order](order.md) &#124; `undefined`

Gets the current order.

**Returns:**  [Order](order.md) &#124; `undefined`

The current order if it is loaded, otherwise undefined.

___
<a id="getpaymentmethod"></a>

###  getPaymentMethod

▸ **getPaymentMethod**(methodId: *`string`*, gatewayId?: * `undefined` &#124; `string`*):  [PaymentMethod](paymentmethod.md) &#124; `undefined`

Gets a payment method by an id.

The method returns undefined if unable to find a payment method with the specified id, either because it is not available for the customer, or it is not loaded.

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| methodId | `string` |  The identifier of the payment method. |
| `Optional` gatewayId |  `undefined` &#124; `string`|  The identifier of a payment provider providing the payment method. |

**Returns:**  [PaymentMethod](paymentmethod.md) &#124; `undefined`

The payment method object if loaded and available, otherwise,
undefined.

___
<a id="getpaymentmethods"></a>

###  getPaymentMethods

▸ **getPaymentMethods**():  [PaymentMethod](paymentmethod.md)[] &#124; `undefined`

Gets a list of payment methods available for checkout.

**Returns:**  [PaymentMethod](paymentmethod.md)[] &#124; `undefined`

The list of payment methods if it is loaded, otherwise undefined.

___
<a id="getselectedpaymentmethod"></a>

###  getSelectedPaymentMethod

▸ **getSelectedPaymentMethod**():  [PaymentMethod](paymentmethod.md) &#124; `undefined`

Gets the payment method that is selected for checkout.

**Returns:**  [PaymentMethod](paymentmethod.md) &#124; `undefined`

The payment method object if there is a selected method;
undefined if otherwise.

___
<a id="getselectedshippingoption"></a>

###  getSelectedShippingOption

▸ **getSelectedShippingOption**():  [ShippingOption](shippingoption.md) &#124; `undefined`

Gets the selected shipping option for the current checkout.

**Returns:**  [ShippingOption](shippingoption.md) &#124; `undefined`

The shipping option object if there is a selected option,
otherwise undefined.

___
<a id="getshippingaddress"></a>

###  getShippingAddress

▸ **getShippingAddress**():  [Address](address.md) &#124; `undefined`

Gets the shipping address of the current checkout.

If the address is partially complete, it may not have shipping options associated with it.

**Returns:**  [Address](address.md) &#124; `undefined`

The shipping address object if it is loaded, otherwise
undefined.

___
<a id="getshippingaddressfields"></a>

###  getShippingAddressFields

▸ **getShippingAddressFields**(countryCode: *`string`*): [FormField](formfield.md)[]

Gets a set of form fields that should be presented to customers in order to capture their shipping address for a specific country.

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| countryCode | `string` |  A 2-letter country code (ISO 3166-1 alpha-2). |

**Returns:** [FormField](formfield.md)[]
The set of shipping address form fields if it is loaded,
otherwise undefined.

___
<a id="getshippingcountries"></a>

###  getShippingCountries

▸ **getShippingCountries**():  [Country](country.md)[] &#124; `undefined`

Gets a list of countries available for shipping.

**Returns:**  [Country](country.md)[] &#124; `undefined`

The list of countries if it is loaded, otherwise undefined.

___
<a id="getshippingoptions"></a>

###  getShippingOptions

▸ **getShippingOptions**():  [ShippingOption](shippingoption.md)[] &#124; `undefined`

Gets a list of shipping options available for the shipping address.

If there is no shipping address assigned to the current checkout, the list of shipping options will be empty.

**Returns:**  [ShippingOption](shippingoption.md)[] &#124; `undefined`

The list of shipping options if any, otherwise undefined.

___
<a id="getsigninemail"></a>

###  getSignInEmail

▸ **getSignInEmail**():  [SignInEmail](signinemail.md) &#124; `undefined`

Gets the sign-in email.

**Returns:**  [SignInEmail](signinemail.md) &#124; `undefined`

The sign-in email object if sent, otherwise undefined

___
<a id="ispaymentdatarequired"></a>

###  isPaymentDataRequired

▸ **isPaymentDataRequired**(useStoreCredit?: * `undefined` &#124; `false` &#124; `true`*): `boolean`

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
| `Optional` useStoreCredit |  `undefined` &#124; `false` &#124; `true`|  If true, check whether payment data is required with store credit applied; otherwise, check without store credit. |

**Returns:** `boolean`
True if payment data is required, otherwise false.

___
<a id="ispaymentdatasubmitted"></a>

###  isPaymentDataSubmitted

▸ **isPaymentDataSubmitted**(methodId: *`string`*, gatewayId?: * `undefined` &#124; `string`*): `boolean`

Checks if payment data is submitted or not.

If payment data is already submitted using a payment method, customers should not be prompted to enter their payment details again.

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| methodId | `string` |  The identifier of the payment method. |
| `Optional` gatewayId |  `undefined` &#124; `string`|  The identifier of a payment provider providing the payment method. |

**Returns:** `boolean`
True if payment data is submitted, otherwise false.

___

