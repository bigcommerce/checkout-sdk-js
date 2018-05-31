[@bigcommerce/checkout-sdk](../README.md) > [CheckoutStoreErrorSelector](../classes/checkoutstoreerrorselector.md)

# Class: CheckoutStoreErrorSelector

Responsible for getting the error of any asynchronous checkout action, if there is any.

This object has a set of getters that would return an error if an action is not executed successfully. For example, if you are unable to submit an order, you can use this object to retrieve the reason for the failure.

## Hierarchy

**CheckoutStoreErrorSelector**

## Index

### Methods

* [getApplyCouponError](checkoutstoreerrorselector.md#getapplycouponerror)
* [getApplyGiftCertificateError](checkoutstoreerrorselector.md#getapplygiftcertificateerror)
* [getDeleteInstrumentError](checkoutstoreerrorselector.md#getdeleteinstrumenterror)
* [getError](checkoutstoreerrorselector.md#geterror)
* [getFinalizeOrderError](checkoutstoreerrorselector.md#getfinalizeordererror)
* [getInitializeCustomerError](checkoutstoreerrorselector.md#getinitializecustomererror)
* [getInitializePaymentError](checkoutstoreerrorselector.md#getinitializepaymenterror)
* [getInitializeShippingError](checkoutstoreerrorselector.md#getinitializeshippingerror)
* [getLoadBillingCountriesError](checkoutstoreerrorselector.md#getloadbillingcountrieserror)
* [getLoadCartError](checkoutstoreerrorselector.md#getloadcarterror)
* [getLoadCheckoutError](checkoutstoreerrorselector.md#getloadcheckouterror)
* [getLoadConfigError](checkoutstoreerrorselector.md#getloadconfigerror)
* [getLoadInstrumentsError](checkoutstoreerrorselector.md#getloadinstrumentserror)
* [getLoadOrderError](checkoutstoreerrorselector.md#getloadordererror)
* [getLoadPaymentMethodError](checkoutstoreerrorselector.md#getloadpaymentmethoderror)
* [getLoadPaymentMethodsError](checkoutstoreerrorselector.md#getloadpaymentmethodserror)
* [getLoadShippingCountriesError](checkoutstoreerrorselector.md#getloadshippingcountrieserror)
* [getLoadShippingOptionsError](checkoutstoreerrorselector.md#getloadshippingoptionserror)
* [getRemoveCouponError](checkoutstoreerrorselector.md#getremovecouponerror)
* [getRemoveGiftCertificateError](checkoutstoreerrorselector.md#getremovegiftcertificateerror)
* [getSelectShippingOptionError](checkoutstoreerrorselector.md#getselectshippingoptionerror)
* [getSignInError](checkoutstoreerrorselector.md#getsigninerror)
* [getSignOutError](checkoutstoreerrorselector.md#getsignouterror)
* [getSubmitOrderError](checkoutstoreerrorselector.md#getsubmitordererror)
* [getUpdateBillingAddressError](checkoutstoreerrorselector.md#getupdatebillingaddresserror)
* [getUpdateShippingAddressError](checkoutstoreerrorselector.md#getupdateshippingaddresserror)
* [getVerifyCartError](checkoutstoreerrorselector.md#getverifycarterror)

---

## Methods

<a id="getapplycouponerror"></a>

###  getApplyCouponError

▸ **getApplyCouponError**(): `Error` |`undefined`

Returns an error if unable to apply a coupon code.

**Returns:** `Error` |
`undefined`

The error object if unable to apply, otherwise undefined.

___
<a id="getapplygiftcertificateerror"></a>

###  getApplyGiftCertificateError

▸ **getApplyGiftCertificateError**(): `Error` |`undefined`

Returns an error if unable to apply a gift certificate.

**Returns:** `Error` |
`undefined`

The error object if unable to apply, otherwise undefined.

___
<a id="getdeleteinstrumenterror"></a>

###  getDeleteInstrumentError

▸ **getDeleteInstrumentError**(instrumentId?: *`undefined` |`string`*): `Error` |`undefined`

Returns an error if unable to delete a payment instrument.

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| `Optional` instrumentId | `undefined` |
`string`
 |  The identifier of the payment instrument to delete. |

**Returns:** `Error` |
`undefined`

The error object if unable to delete, otherwise undefined.

___
<a id="geterror"></a>

###  getError

▸ **getError**(): `Error` |`undefined`

Gets the error of any checkout action that has failed.

**Returns:** `Error` |
`undefined`

The error object if unable to perform any checkout action,
otherwise undefined.

___
<a id="getfinalizeordererror"></a>

###  getFinalizeOrderError

▸ **getFinalizeOrderError**(): `Error` |`undefined`

Returns an error if unable to finalize the current order.

**Returns:** `Error` |
`undefined`

The error object if unable to finalize, otherwise undefined.

___
<a id="getinitializecustomererror"></a>

###  getInitializeCustomerError

▸ **getInitializeCustomerError**(methodId?: *`undefined` |`string`*): `Error` |`undefined`

Returns an error if unable to initialize the customer step of a checkout process.

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| `Optional` methodId | `undefined` |
`string`
 |  The identifer of the initialization method to execute. |

**Returns:** `Error` |
`undefined`

The error object if unable to initialize, otherwise undefined.

___
<a id="getinitializepaymenterror"></a>

###  getInitializePaymentError

▸ **getInitializePaymentError**(methodId?: *`undefined` |`string`*): `Error` |`undefined`

Returns an error if unable to initialize a specific payment method.

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| `Optional` methodId | `undefined` |
`string`
 |  The identifier of the payment method to initialize. |

**Returns:** `Error` |
`undefined`

The error object if unable to initialize, otherwise undefined.

___
<a id="getinitializeshippingerror"></a>

###  getInitializeShippingError

▸ **getInitializeShippingError**(methodId?: *`undefined` |`string`*): `Error` |`undefined`

Returns an error if unable to initialize the shipping step of a checkout process.

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| `Optional` methodId | `undefined` |
`string`
 |  The identifer of the initialization method to execute. |

**Returns:** `Error` |
`undefined`

The error object if unable to initialize, otherwise undefined.

___
<a id="getloadbillingcountrieserror"></a>

###  getLoadBillingCountriesError

▸ **getLoadBillingCountriesError**(): `Error` |`undefined`

Returns an error if unable to load billing countries.

**Returns:** `Error` |
`undefined`

The error object if unable to load, otherwise undefined.

___
<a id="getloadcarterror"></a>

###  getLoadCartError

▸ **getLoadCartError**(): `Error` |`undefined`

Returns an error if unable to load the current cart.

**Returns:** `Error` |
`undefined`

The error object if unable to load, otherwise undefined.

___
<a id="getloadcheckouterror"></a>

###  getLoadCheckoutError

▸ **getLoadCheckoutError**(): `Error` |`undefined`

Returns an error if unable to load the current checkout.

**Returns:** `Error` |
`undefined`

The error object if unable to load, otherwise undefined.

___
<a id="getloadconfigerror"></a>

###  getLoadConfigError

▸ **getLoadConfigError**(): `Error` |`undefined`

Returns an error if unable to load the checkout configuration of a store.

**Returns:** `Error` |
`undefined`

The error object if unable to load, otherwise undefined.

___
<a id="getloadinstrumentserror"></a>

###  getLoadInstrumentsError

▸ **getLoadInstrumentsError**(): `Error` |`undefined`

Returns an error if unable to load payment instruments.

**Returns:** `Error` |
`undefined`

The error object if unable to load, otherwise undefined.

___
<a id="getloadordererror"></a>

###  getLoadOrderError

▸ **getLoadOrderError**(): `Error` |`undefined`

Returns an error if unable to load the current order.

**Returns:** `Error` |
`undefined`

The error object if unable to load, otherwise undefined.

___
<a id="getloadpaymentmethoderror"></a>

###  getLoadPaymentMethodError

▸ **getLoadPaymentMethodError**(methodId?: *`undefined` |`string`*): `Error` |`undefined`

Returns an error if unable to load a specific payment method.

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| `Optional` methodId | `undefined` |
`string`
 |  The identifier of the payment method to load. |

**Returns:** `Error` |
`undefined`

The error object if unable to load, otherwise undefined.

___
<a id="getloadpaymentmethodserror"></a>

###  getLoadPaymentMethodsError

▸ **getLoadPaymentMethodsError**(): `Error` |`undefined`

Returns an error if unable to load payment methods.

**Returns:** `Error` |
`undefined`

The error object if unable to load, otherwise undefined.

___
<a id="getloadshippingcountrieserror"></a>

###  getLoadShippingCountriesError

▸ **getLoadShippingCountriesError**(): `Error` |`undefined`

Returns an error if unable to load shipping countries.

**Returns:** `Error` |
`undefined`

The error object if unable to load, otherwise undefined.

___
<a id="getloadshippingoptionserror"></a>

###  getLoadShippingOptionsError

▸ **getLoadShippingOptionsError**(): `Error` |`undefined`

Returns an error if unable to load shipping options.

**Returns:** `Error` |
`undefined`

The error object if unable to load, otherwise undefined.

___
<a id="getremovecouponerror"></a>

###  getRemoveCouponError

▸ **getRemoveCouponError**(): `Error` |`undefined`

Returns an error if unable to remove a coupon code.

**Returns:** `Error` |
`undefined`

The error object if unable to remove, otherwise undefined.

___
<a id="getremovegiftcertificateerror"></a>

###  getRemoveGiftCertificateError

▸ **getRemoveGiftCertificateError**(): `Error` |`undefined`

Returns an error if unable to remove a gift certificate.

**Returns:** `Error` |
`undefined`

The error object if unable to remove, otherwise undefined.

___
<a id="getselectshippingoptionerror"></a>

###  getSelectShippingOptionError

▸ **getSelectShippingOptionError**(): `Error` |`undefined`

Returns an error if unable to select a shipping option.

**Returns:** `Error` |
`undefined`

The error object if unable to select, otherwise undefined.

___
<a id="getsigninerror"></a>

###  getSignInError

▸ **getSignInError**(): `Error` |`undefined`

Returns an error if unable to sign in.

**Returns:** `Error` |
`undefined`

The error object if unable to sign in, otherwise undefined.

___
<a id="getsignouterror"></a>

###  getSignOutError

▸ **getSignOutError**(): `Error` |`undefined`

Returns an error if unable to sign out.

**Returns:** `Error` |
`undefined`

The error object if unable to sign out, otherwise undefined.

___
<a id="getsubmitordererror"></a>

###  getSubmitOrderError

▸ **getSubmitOrderError**(): `Error` |`undefined`

Returns an error if unable to submit the current order.

**Returns:** `Error` |
`undefined`

The error object if unable to submit, otherwise undefined.

___
<a id="getupdatebillingaddresserror"></a>

###  getUpdateBillingAddressError

▸ **getUpdateBillingAddressError**(): `Error` |`undefined`

Returns an error if unable to update a billing address.

**Returns:** `Error` |
`undefined`

The error object if unable to update, otherwise undefined.

___
<a id="getupdateshippingaddresserror"></a>

###  getUpdateShippingAddressError

▸ **getUpdateShippingAddressError**(): `Error` |`undefined`

Returns an error if unable to update a shipping address.

**Returns:** `Error` |
`undefined`

The error object if unable to update, otherwise undefined.

___
<a id="getverifycarterror"></a>

###  getVerifyCartError

▸ **getVerifyCartError**(): `Error` |`undefined`

Returns an error if unable to verify the current cart.

This method is deprecated because cart verification is an internal process, therefore should not be referred externally.
*__deprecated__*: 

**Returns:** `Error` |
`undefined`

The error object if unable to verify, otherwise undefined.

___

