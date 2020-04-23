[@bigcommerce/checkout-sdk](../README.md) > [CheckoutStoreErrorSelector](../interfaces/checkoutstoreerrorselector.md)

# CheckoutStoreErrorSelector

Responsible for getting the error of any asynchronous checkout action, if there is any.

This object has a set of getters that would return an error if an action is not executed successfully. For example, if you are unable to submit an order, you can use this object to retrieve the reason for the failure.

## Hierarchy

**CheckoutStoreErrorSelector**

## Index

### Methods

* [getApplyCouponError](checkoutstoreerrorselector.md#getapplycouponerror)
* [getApplyGiftCertificateError](checkoutstoreerrorselector.md#getapplygiftcertificateerror)
* [getApplyStoreCreditError](checkoutstoreerrorselector.md#getapplystorecrediterror)
* [getContinueAsGuestError](checkoutstoreerrorselector.md#getcontinueasguesterror)
* [getCreateConsignmentsError](checkoutstoreerrorselector.md#getcreateconsignmentserror)
* [getDeleteConsignmentError](checkoutstoreerrorselector.md#getdeleteconsignmenterror)
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
* [getSignInEmailError](checkoutstoreerrorselector.md#getsigninemailerror)
* [getSignInError](checkoutstoreerrorselector.md#getsigninerror)
* [getSignOutError](checkoutstoreerrorselector.md#getsignouterror)
* [getSubmitOrderError](checkoutstoreerrorselector.md#getsubmitordererror)
* [getUpdateBillingAddressError](checkoutstoreerrorselector.md#getupdatebillingaddresserror)
* [getUpdateCheckoutError](checkoutstoreerrorselector.md#getupdatecheckouterror)
* [getUpdateConsignmentError](checkoutstoreerrorselector.md#getupdateconsignmenterror)
* [getUpdateShippingAddressError](checkoutstoreerrorselector.md#getupdateshippingaddresserror)
* [getUpdateSubscriptionsError](checkoutstoreerrorselector.md#getupdatesubscriptionserror)

---

## Methods

<a id="getapplycouponerror"></a>

###  getApplyCouponError

▸ **getApplyCouponError**():  [RequestError](../classes/requesterror.md) &#124; `undefined`

Returns an error if unable to apply a coupon code.

**Returns:**  [RequestError](../classes/requesterror.md) &#124; `undefined`

The error object if unable to apply, otherwise undefined.

___
<a id="getapplygiftcertificateerror"></a>

###  getApplyGiftCertificateError

▸ **getApplyGiftCertificateError**():  [RequestError](../classes/requesterror.md) &#124; `undefined`

Returns an error if unable to apply a gift certificate.

**Returns:**  [RequestError](../classes/requesterror.md) &#124; `undefined`

The error object if unable to apply, otherwise undefined.

___
<a id="getapplystorecrediterror"></a>

###  getApplyStoreCreditError

▸ **getApplyStoreCreditError**():  [RequestError](../classes/requesterror.md) &#124; `undefined`

Returns an error if unable to apply store credit.

**Returns:**  [RequestError](../classes/requesterror.md) &#124; `undefined`

The error object if unable to apply, otherwise undefined.

___
<a id="getcontinueasguesterror"></a>

###  getContinueAsGuestError

▸ **getContinueAsGuestError**():  `Error` &#124; `undefined`

Returns an error if unable to continue as guest.

**Returns:**  `Error` &#124; `undefined`

The error object if unable to continue, otherwise undefined.

___
<a id="getcreateconsignmentserror"></a>

###  getCreateConsignmentsError

▸ **getCreateConsignmentsError**():  `Error` &#124; `undefined`

Returns an error if unable to create consignments.

**Returns:**  `Error` &#124; `undefined`

The error object if unable to create, otherwise undefined.

___
<a id="getdeleteconsignmenterror"></a>

###  getDeleteConsignmentError

▸ **getDeleteConsignmentError**(consignmentId?: * `undefined` &#124; `string`*):  `Error` &#124; `undefined`

Returns an error if unable to delete a consignment.

A consignment ID should be provided when checking for an error for a specific consignment, otherwise it will check for all available consignments.

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| `Optional` consignmentId |  `undefined` &#124; `string`|  The identifier of the consignment to be checked. |

**Returns:**  `Error` &#124; `undefined`

The error object if unable to delete, otherwise undefined.

___
<a id="getdeleteinstrumenterror"></a>

###  getDeleteInstrumentError

▸ **getDeleteInstrumentError**(instrumentId?: * `undefined` &#124; `string`*):  `Error` &#124; `undefined`

Returns an error if unable to delete a payment instrument.

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| `Optional` instrumentId |  `undefined` &#124; `string`|  The identifier of the payment instrument to delete. |

**Returns:**  `Error` &#124; `undefined`

The error object if unable to delete, otherwise undefined.

___
<a id="geterror"></a>

###  getError

▸ **getError**():  `Error` &#124; `undefined`

**Returns:**  `Error` &#124; `undefined`

___
<a id="getfinalizeordererror"></a>

###  getFinalizeOrderError

▸ **getFinalizeOrderError**():  `Error` &#124; `undefined`

Returns an error if unable to finalize the current order.

**Returns:**  `Error` &#124; `undefined`

The error object if unable to finalize, otherwise undefined.

___
<a id="getinitializecustomererror"></a>

###  getInitializeCustomerError

▸ **getInitializeCustomerError**(methodId?: * `undefined` &#124; `string`*):  `Error` &#124; `undefined`

Returns an error if unable to initialize the customer step of a checkout process.

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| `Optional` methodId |  `undefined` &#124; `string`|  The identifer of the initialization method to execute. |

**Returns:**  `Error` &#124; `undefined`

The error object if unable to initialize, otherwise undefined.

___
<a id="getinitializepaymenterror"></a>

###  getInitializePaymentError

▸ **getInitializePaymentError**(methodId?: * `undefined` &#124; `string`*):  `Error` &#124; `undefined`

Returns an error if unable to initialize a specific payment method.

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| `Optional` methodId |  `undefined` &#124; `string`|  The identifier of the payment method to initialize. |

**Returns:**  `Error` &#124; `undefined`

The error object if unable to initialize, otherwise undefined.

___
<a id="getinitializeshippingerror"></a>

###  getInitializeShippingError

▸ **getInitializeShippingError**(methodId?: * `undefined` &#124; `string`*):  `Error` &#124; `undefined`

Returns an error if unable to initialize the shipping step of a checkout process.

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| `Optional` methodId |  `undefined` &#124; `string`|  The identifer of the initialization method to execute. |

**Returns:**  `Error` &#124; `undefined`

The error object if unable to initialize, otherwise undefined.

___
<a id="getloadbillingcountrieserror"></a>

###  getLoadBillingCountriesError

▸ **getLoadBillingCountriesError**():  `Error` &#124; `undefined`

Returns an error if unable to load billing countries.

**Returns:**  `Error` &#124; `undefined`

The error object if unable to load, otherwise undefined.

___
<a id="getloadcarterror"></a>

###  getLoadCartError

▸ **getLoadCartError**():  `Error` &#124; `undefined`

Returns an error if unable to load the current cart.

**Returns:**  `Error` &#124; `undefined`

The error object if unable to load, otherwise undefined.

___
<a id="getloadcheckouterror"></a>

###  getLoadCheckoutError

▸ **getLoadCheckoutError**():  `Error` &#124; `undefined`

Returns an error if unable to load the current checkout.

**Returns:**  `Error` &#124; `undefined`

The error object if unable to load, otherwise undefined.

___
<a id="getloadconfigerror"></a>

###  getLoadConfigError

▸ **getLoadConfigError**():  `Error` &#124; `undefined`

Returns an error if unable to load the checkout configuration of a store.

**Returns:**  `Error` &#124; `undefined`

The error object if unable to load, otherwise undefined.

___
<a id="getloadinstrumentserror"></a>

###  getLoadInstrumentsError

▸ **getLoadInstrumentsError**():  `Error` &#124; `undefined`

Returns an error if unable to load payment instruments.

**Returns:**  `Error` &#124; `undefined`

The error object if unable to load, otherwise undefined.

___
<a id="getloadordererror"></a>

###  getLoadOrderError

▸ **getLoadOrderError**():  `Error` &#124; `undefined`

Returns an error if unable to load the current order.

**Returns:**  `Error` &#124; `undefined`

The error object if unable to load, otherwise undefined.

___
<a id="getloadpaymentmethoderror"></a>

###  getLoadPaymentMethodError

▸ **getLoadPaymentMethodError**(methodId?: * `undefined` &#124; `string`*):  `Error` &#124; `undefined`

Returns an error if unable to load a specific payment method.

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| `Optional` methodId |  `undefined` &#124; `string`|  The identifier of the payment method to load. |

**Returns:**  `Error` &#124; `undefined`

The error object if unable to load, otherwise undefined.

___
<a id="getloadpaymentmethodserror"></a>

###  getLoadPaymentMethodsError

▸ **getLoadPaymentMethodsError**():  `Error` &#124; `undefined`

Returns an error if unable to load payment methods.

**Returns:**  `Error` &#124; `undefined`

The error object if unable to load, otherwise undefined.

___
<a id="getloadshippingcountrieserror"></a>

###  getLoadShippingCountriesError

▸ **getLoadShippingCountriesError**():  `Error` &#124; `undefined`

Returns an error if unable to load shipping countries.

**Returns:**  `Error` &#124; `undefined`

The error object if unable to load, otherwise undefined.

___
<a id="getloadshippingoptionserror"></a>

###  getLoadShippingOptionsError

▸ **getLoadShippingOptionsError**():  `Error` &#124; `undefined`

Returns an error if unable to load shipping options.

**Returns:**  `Error` &#124; `undefined`

The error object if unable to load, otherwise undefined.

___
<a id="getremovecouponerror"></a>

###  getRemoveCouponError

▸ **getRemoveCouponError**():  [RequestError](../classes/requesterror.md) &#124; `undefined`

Returns an error if unable to remove a coupon code.

**Returns:**  [RequestError](../classes/requesterror.md) &#124; `undefined`

The error object if unable to remove, otherwise undefined.

___
<a id="getremovegiftcertificateerror"></a>

###  getRemoveGiftCertificateError

▸ **getRemoveGiftCertificateError**():  [RequestError](../classes/requesterror.md) &#124; `undefined`

Returns an error if unable to remove a gift certificate.

**Returns:**  [RequestError](../classes/requesterror.md) &#124; `undefined`

The error object if unable to remove, otherwise undefined.

___
<a id="getselectshippingoptionerror"></a>

###  getSelectShippingOptionError

▸ **getSelectShippingOptionError**(consignmentId?: * `undefined` &#124; `string`*):  `Error` &#124; `undefined`

Returns an error if unable to select a shipping option.

A consignment ID should be provided when checking for an error for a specific consignment, otherwise it will check for all available consignments.

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| `Optional` consignmentId |  `undefined` &#124; `string`|  The identifier of the consignment to be checked. |

**Returns:**  `Error` &#124; `undefined`

The error object if unable to select, otherwise undefined.

___
<a id="getsigninemailerror"></a>

###  getSignInEmailError

▸ **getSignInEmailError**():  `Error` &#124; `undefined`

Returns an error if unable to send sign-in email.

**Returns:**  `Error` &#124; `undefined`

The error object if unable to send email, otherwise undefined.

___
<a id="getsigninerror"></a>

###  getSignInError

▸ **getSignInError**():  `Error` &#124; `undefined`

Returns an error if unable to sign in.

**Returns:**  `Error` &#124; `undefined`

The error object if unable to sign in, otherwise undefined.

___
<a id="getsignouterror"></a>

###  getSignOutError

▸ **getSignOutError**():  `Error` &#124; `undefined`

Returns an error if unable to sign out.

**Returns:**  `Error` &#124; `undefined`

The error object if unable to sign out, otherwise undefined.

___
<a id="getsubmitordererror"></a>

###  getSubmitOrderError

▸ **getSubmitOrderError**():  `Error` &#124; `undefined`

Returns an error if unable to submit the current order.

**Returns:**  `Error` &#124; `undefined`

The error object if unable to submit, otherwise undefined.

___
<a id="getupdatebillingaddresserror"></a>

###  getUpdateBillingAddressError

▸ **getUpdateBillingAddressError**():  `Error` &#124; `undefined`

Returns an error if unable to update billing address.

**Returns:**  `Error` &#124; `undefined`

The error object if unable to update, otherwise undefined.

___
<a id="getupdatecheckouterror"></a>

###  getUpdateCheckoutError

▸ **getUpdateCheckoutError**():  `Error` &#124; `undefined`

Returns an error if unable to update the current checkout.

**Returns:**  `Error` &#124; `undefined`

The error object if unable to update, otherwise undefined.

___
<a id="getupdateconsignmenterror"></a>

###  getUpdateConsignmentError

▸ **getUpdateConsignmentError**(consignmentId?: * `undefined` &#124; `string`*):  `Error` &#124; `undefined`

Returns an error if unable to update a consignment.

A consignment ID should be provided when checking for an error for a specific consignment, otherwise it will check for all available consignments.

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| `Optional` consignmentId |  `undefined` &#124; `string`|  The identifier of the consignment to be checked. |

**Returns:**  `Error` &#124; `undefined`

The error object if unable to update, otherwise undefined.

___
<a id="getupdateshippingaddresserror"></a>

###  getUpdateShippingAddressError

▸ **getUpdateShippingAddressError**():  `Error` &#124; `undefined`

Returns an error if unable to update shipping address.

**Returns:**  `Error` &#124; `undefined`

The error object if unable to update, otherwise undefined.

___
<a id="getupdatesubscriptionserror"></a>

###  getUpdateSubscriptionsError

▸ **getUpdateSubscriptionsError**():  `Error` &#124; `undefined`

Returns an error if unable to update subscriptions.

**Returns:**  `Error` &#124; `undefined`

The error object if unable to update, otherwise undefined.

___

