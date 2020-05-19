[@bigcommerce/checkout-sdk](../README.md) > [CheckoutStoreSelector](../interfaces/checkoutstoreselector.md)

# CheckoutStoreSelector

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
* [getFlashMessages](checkoutstoreselector.md#getflashmessages)
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

**Returns:**  [BillingAddress](billingaddress.md) &#124; `undefined`

The billing address object if it is loaded, otherwise undefined.

___
<a id="getbillingaddressfields"></a>

###  getBillingAddressFields

▸ **getBillingAddressFields**(countryCode: *`string`*): [FormField](formfield.md)[]

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

**Returns:**  [Country](country.md)[] &#124; `undefined`

The list of countries if it is loaded, otherwise undefined.

___
<a id="getcart"></a>

###  getCart

▸ **getCart**():  [Cart](cart.md) &#124; `undefined`

**Returns:**  [Cart](cart.md) &#124; `undefined`

The current cart object if it is loaded, otherwise undefined.

___
<a id="getcheckout"></a>

###  getCheckout

▸ **getCheckout**():  [Checkout](checkout.md) &#124; `undefined`

**Returns:**  [Checkout](checkout.md) &#124; `undefined`

The current checkout if it is loaded, otherwise undefined.

___
<a id="getconfig"></a>

###  getConfig

▸ **getConfig**():  [StoreConfig](storeconfig.md) &#124; `undefined`

**Returns:**  [StoreConfig](storeconfig.md) &#124; `undefined`

The configuration object if it is loaded, otherwise undefined.

___
<a id="getconsignments"></a>

###  getConsignments

▸ **getConsignments**():  [Consignment](consignment.md)[] &#124; `undefined`

**Returns:**  [Consignment](consignment.md)[] &#124; `undefined`

The list of consignments if any, otherwise undefined.

___
<a id="getcoupons"></a>

###  getCoupons

▸ **getCoupons**():  [Coupon](coupon.md)[] &#124; `undefined`

**Returns:**  [Coupon](coupon.md)[] &#124; `undefined`

The list of applied coupons if there is any, otherwise undefined.

___
<a id="getcustomer"></a>

###  getCustomer

▸ **getCustomer**():  [Customer](customer.md) &#124; `undefined`

**Returns:**  [Customer](customer.md) &#124; `undefined`

The current customer object if it is loaded, otherwise
undefined.

___
<a id="getflashmessages"></a>

###  getFlashMessages

▸ **getFlashMessages**(type?: *[FlashMessageType](../#flashmessagetype)*):  [FlashMessage](flashmessage.md)[] &#124; `undefined`

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| `Optional` type | [FlashMessageType](../#flashmessagetype) |  The type of flash messages to be returned. Optional |

**Returns:**  [FlashMessage](flashmessage.md)[] &#124; `undefined`

The flash messages if available, otherwise undefined.

___
<a id="getgiftcertificates"></a>

###  getGiftCertificates

▸ **getGiftCertificates**():  [GiftCertificate](giftcertificate.md)[] &#124; `undefined`

**Returns:**  [GiftCertificate](giftcertificate.md)[] &#124; `undefined`

The list of applied gift certificates if there is any, otherwise undefined.

___
<a id="getinstruments"></a>

###  getInstruments

▸ **getInstruments**():  [Instrument](../#instrument)[] &#124; `undefined`

▸ **getInstruments**(paymentMethod: *[PaymentMethod](paymentmethod.md)*):  [PaymentInstrument](../#paymentinstrument)[] &#124; `undefined`

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

**Returns:**  [Order](order.md) &#124; `undefined`

The current order if it is loaded, otherwise undefined.

___
<a id="getpaymentmethod"></a>

###  getPaymentMethod

▸ **getPaymentMethod**(methodId: *`string`*, gatewayId?: * `undefined` &#124; `string`*):  [PaymentMethod](paymentmethod.md) &#124; `undefined`

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

**Returns:**  [PaymentMethod](paymentmethod.md)[] &#124; `undefined`

The list of payment methods if it is loaded, otherwise undefined.

___
<a id="getselectedpaymentmethod"></a>

###  getSelectedPaymentMethod

▸ **getSelectedPaymentMethod**():  [PaymentMethod](paymentmethod.md) &#124; `undefined`

**Returns:**  [PaymentMethod](paymentmethod.md) &#124; `undefined`

The payment method object if there is a selected method;
undefined if otherwise.

___
<a id="getselectedshippingoption"></a>

###  getSelectedShippingOption

▸ **getSelectedShippingOption**():  [ShippingOption](shippingoption.md) &#124; `undefined`

**Returns:**  [ShippingOption](shippingoption.md) &#124; `undefined`

The shipping option object if there is a selected option,
otherwise undefined.

___
<a id="getshippingaddress"></a>

###  getShippingAddress

▸ **getShippingAddress**():  [Address](address.md) &#124; `undefined`

**Returns:**  [Address](address.md) &#124; `undefined`

The shipping address object if it is loaded, otherwise
undefined.

___
<a id="getshippingaddressfields"></a>

###  getShippingAddressFields

▸ **getShippingAddressFields**(countryCode: *`string`*): [FormField](formfield.md)[]

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

**Returns:**  [Country](country.md)[] &#124; `undefined`

The list of countries if it is loaded, otherwise undefined.

___
<a id="getshippingoptions"></a>

###  getShippingOptions

▸ **getShippingOptions**():  [ShippingOption](shippingoption.md)[] &#124; `undefined`

**Returns:**  [ShippingOption](shippingoption.md)[] &#124; `undefined`

The list of shipping options if any, otherwise undefined.

___
<a id="getsigninemail"></a>

###  getSignInEmail

▸ **getSignInEmail**():  [SignInEmail](signinemail.md) &#124; `undefined`

**Returns:**  [SignInEmail](signinemail.md) &#124; `undefined`

The sign-in email object if sent, otherwise undefined

___
<a id="ispaymentdatarequired"></a>

###  isPaymentDataRequired

▸ **isPaymentDataRequired**(useStoreCredit?: * `undefined` &#124; `false` &#124; `true`*): `boolean`

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

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| methodId | `string` |  The identifier of the payment method. |
| `Optional` gatewayId |  `undefined` &#124; `string`|  The identifier of a payment provider providing the payment method. |

**Returns:** `boolean`
True if payment data is submitted, otherwise false.

___

