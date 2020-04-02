[@bigcommerce/checkout-sdk](../README.md) > [CheckoutService](../classes/checkoutservice.md)

# CheckoutService

Responsible for completing the checkout process for the current customer.

This object can be used to collect all information that is required for checkout, such as shipping and billing information. It can also be used to retrieve the current checkout state and subscribe to its changes.

## Hierarchy

**CheckoutService**

## Index

### Methods

* [applyCoupon](checkoutservice.md#applycoupon)
* [applyGiftCertificate](checkoutservice.md#applygiftcertificate)
* [applyStoreCredit](checkoutservice.md#applystorecredit)
* [assignItemsToAddress](checkoutservice.md#assignitemstoaddress)
* [clearError](checkoutservice.md#clearerror)
* [continueAsGuest](checkoutservice.md#continueasguest)
* [createConsignments](checkoutservice.md#createconsignments)
* [deinitializeCustomer](checkoutservice.md#deinitializecustomer)
* [deinitializePayment](checkoutservice.md#deinitializepayment)
* [deinitializeShipping](checkoutservice.md#deinitializeshipping)
* [deleteConsignment](checkoutservice.md#deleteconsignment)
* [deleteInstrument](checkoutservice.md#deleteinstrument)
* [executeSpamCheck](checkoutservice.md#executespamcheck)
* [finalizeOrderIfNeeded](checkoutservice.md#finalizeorderifneeded)
* [getState](checkoutservice.md#getstate)
* [initializeCustomer](checkoutservice.md#initializecustomer)
* [initializePayment](checkoutservice.md#initializepayment)
* [initializeShipping](checkoutservice.md#initializeshipping)
* [initializeSpamProtection](checkoutservice.md#initializespamprotection)
* [loadBillingAddressFields](checkoutservice.md#loadbillingaddressfields)
* [loadBillingCountries](checkoutservice.md#loadbillingcountries)
* [loadCheckout](checkoutservice.md#loadcheckout)
* [loadInstruments](checkoutservice.md#loadinstruments)
* [loadOrder](checkoutservice.md#loadorder)
* [loadPaymentMethods](checkoutservice.md#loadpaymentmethods)
* [loadShippingAddressFields](checkoutservice.md#loadshippingaddressfields)
* [loadShippingCountries](checkoutservice.md#loadshippingcountries)
* [loadShippingOptions](checkoutservice.md#loadshippingoptions)
* [notifyState](checkoutservice.md#notifystate)
* [removeCoupon](checkoutservice.md#removecoupon)
* [removeGiftCertificate](checkoutservice.md#removegiftcertificate)
* [selectConsignmentShippingOption](checkoutservice.md#selectconsignmentshippingoption)
* [selectShippingOption](checkoutservice.md#selectshippingoption)
* [signInCustomer](checkoutservice.md#signincustomer)
* [signOutCustomer](checkoutservice.md#signoutcustomer)
* [submitOrder](checkoutservice.md#submitorder)
* [subscribe](checkoutservice.md#subscribe)
* [unassignItemsToAddress](checkoutservice.md#unassignitemstoaddress)
* [updateBillingAddress](checkoutservice.md#updatebillingaddress)
* [updateCheckout](checkoutservice.md#updatecheckout)
* [updateConsignment](checkoutservice.md#updateconsignment)
* [updateShippingAddress](checkoutservice.md#updateshippingaddress)
* [updateSubscriptions](checkoutservice.md#updatesubscriptions)

---

## Methods

<a id="applycoupon"></a>

###  applyCoupon

▸ **applyCoupon**(code: *`string`*, options?: *[RequestOptions](../interfaces/requestoptions.md)*): `Promise`<[CheckoutSelectors](../interfaces/checkoutselectors.md)>

Applies a coupon code to the current checkout.

Once the coupon code gets applied, the quote for the current checkout will be adjusted accordingly. The same coupon code cannot be applied more than once.

```js
await service.applyCoupon('COUPON');
```

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| code | `string` |  The coupon code to apply to the current checkout. |
| `Optional` options | [RequestOptions](../interfaces/requestoptions.md) |  Options for applying the coupon code. |

**Returns:** `Promise`<[CheckoutSelectors](../interfaces/checkoutselectors.md)>
A promise that resolves to the current state.

___
<a id="applygiftcertificate"></a>

###  applyGiftCertificate

▸ **applyGiftCertificate**(code: *`string`*, options?: *[RequestOptions](../interfaces/requestoptions.md)*): `Promise`<[CheckoutSelectors](../interfaces/checkoutselectors.md)>

Applies a gift certificate to the current checkout.

Once the gift certificate gets applied, the quote for the current checkout will be adjusted accordingly.

```js
await service.applyGiftCertificate('GIFT_CERTIFICATE');
```

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| code | `string` |  The gift certificate to apply to the current checkout. |
| `Optional` options | [RequestOptions](../interfaces/requestoptions.md) |  Options for applying the gift certificate. |

**Returns:** `Promise`<[CheckoutSelectors](../interfaces/checkoutselectors.md)>
A promise that resolves to the current state.

___
<a id="applystorecredit"></a>

###  applyStoreCredit

▸ **applyStoreCredit**(useStoreCredit: *`boolean`*, options?: *[RequestOptions](../interfaces/requestoptions.md)*): `Promise`<[CheckoutSelectors](../interfaces/checkoutselectors.md)>

Applies or removes customer's store credit code to the current checkout.

Once the store credit gets applied, the outstanding balance will be adjusted accordingly.

```js
const state = await service.applyStoreCredit(true);

console.log(state.data.getCheckout().outstandingBalance);
```

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| useStoreCredit | `boolean` |
| `Optional` options | [RequestOptions](../interfaces/requestoptions.md) |  Options for applying store credit. |

**Returns:** `Promise`<[CheckoutSelectors](../interfaces/checkoutselectors.md)>
A promise that resolves to the current state.

___
<a id="assignitemstoaddress"></a>

###  assignItemsToAddress

▸ **assignItemsToAddress**(consignment: *[ConsignmentAssignmentRequestBody](../interfaces/consignmentassignmentrequestbody.md)*, options?: *[RequestOptions](../interfaces/requestoptions.md)*): `Promise`<[CheckoutSelectors](../interfaces/checkoutselectors.md)>

Convenience method that assigns items to be shipped to a specific address.

Note: this method finds an existing consignment that matches the provided address and assigns the provided items. If no consignment matches the address, a new one will be created.

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| consignment | [ConsignmentAssignmentRequestBody](../interfaces/consignmentassignmentrequestbody.md) |  The consignment data that will be used. |
| `Optional` options | [RequestOptions](../interfaces/requestoptions.md) |  Options for the request |

**Returns:** `Promise`<[CheckoutSelectors](../interfaces/checkoutselectors.md)>
A promise that resolves to the current state.

___
<a id="clearerror"></a>

###  clearError

▸ **clearError**(error: *`Error`*): `Promise`<[CheckoutSelectors](../interfaces/checkoutselectors.md)>

Clear errors that have been collected from previous calls.

```js
const state = await service.clearError(error);

console.log(state.errors.getError());
```

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| error | `Error` |  Specific error object to clear |

**Returns:** `Promise`<[CheckoutSelectors](../interfaces/checkoutselectors.md)>
A promise that resolves to the current state.

___
<a id="continueasguest"></a>

###  continueAsGuest

▸ **continueAsGuest**(credentials: *[GuestCredentials](../#guestcredentials)*, options?: *[RequestOptions](../interfaces/requestoptions.md)*): `Promise`<[CheckoutSelectors](../interfaces/checkoutselectors.md)>

Continues to check out as a guest.

The customer is required to provide their email address in order to continue. Once they provide their email address, it will be stored as a part of their billing address.

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| credentials | [GuestCredentials](../#guestcredentials) |  The guest credentials to use, with optional subscriptions. |
| `Optional` options | [RequestOptions](../interfaces/requestoptions.md) |  Options for continuing as a guest. |

**Returns:** `Promise`<[CheckoutSelectors](../interfaces/checkoutselectors.md)>
A promise that resolves to the current state.

___
<a id="createconsignments"></a>

###  createConsignments

▸ **createConsignments**(consignments: *[ConsignmentsRequestBody](../#consignmentsrequestbody)*, options?: *[RequestOptions](../interfaces/requestoptions.md)*): `Promise`<[CheckoutSelectors](../interfaces/checkoutselectors.md)>

Creates consignments given a list.

Note: this is used when items need to be shipped to multiple addresses, for single shipping address, use `CheckoutService#updateShippingAddress`.

When consignments are created, an updated list of shipping options will become available for each consignment, unless no options are available. If the update is successful, you can call `CheckoutStoreSelector#getConsignments` to retrieve the updated list of consignments.'

Beware that if a consignment includes all line items from another consignment, that consignment will be deleted as a valid consignment must include at least one valid line item.

You can submit an address that is partially complete. The address does not get validated until you submit the order.

```js
const state = await service.createConsignments(consignments);

console.log(state.data.getConsignments());
```

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| consignments | [ConsignmentsRequestBody](../#consignmentsrequestbody) |  The list of consignments to be created. |
| `Optional` options | [RequestOptions](../interfaces/requestoptions.md) |  Options for updating the shipping address. |

**Returns:** `Promise`<[CheckoutSelectors](../interfaces/checkoutselectors.md)>
A promise that resolves to the current state.

___
<a id="deinitializecustomer"></a>

###  deinitializeCustomer

▸ **deinitializeCustomer**(options?: *[CustomerRequestOptions](../interfaces/customerrequestoptions.md)*): `Promise`<[CheckoutSelectors](../interfaces/checkoutselectors.md)>

De-initializes the sign-in step of a checkout process.

It should be called once you no longer want to prompt customers to sign in. It can perform any necessary clean-up behind the scene, i.e.: remove DOM nodes or event handlers that are attached as a result of customer initialization.

```js
await service.deinitializeCustomer({
    methodId: 'amazon',
});
```

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| `Optional` options | [CustomerRequestOptions](../interfaces/customerrequestoptions.md) |  Options for deinitializing the customer step of checkout. |

**Returns:** `Promise`<[CheckoutSelectors](../interfaces/checkoutselectors.md)>
A promise that resolves to the current state.

___
<a id="deinitializepayment"></a>

###  deinitializePayment

▸ **deinitializePayment**(options: *[PaymentRequestOptions](../interfaces/paymentrequestoptions.md)*): `Promise`<[CheckoutSelectors](../interfaces/checkoutselectors.md)>

De-initializes the payment step of a checkout process.

The method should be called once you no longer require a payment method to be initialized. It can perform any necessary clean-up behind the scene, i.e.: remove DOM nodes or event handlers that are attached as a result of payment initialization.

```js
await service.deinitializePayment({
    methodId: 'amazon',
});
```

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| options | [PaymentRequestOptions](../interfaces/paymentrequestoptions.md) |  Options for deinitializing the payment step of checkout. |

**Returns:** `Promise`<[CheckoutSelectors](../interfaces/checkoutselectors.md)>
A promise that resolves to the current state.

___
<a id="deinitializeshipping"></a>

###  deinitializeShipping

▸ **deinitializeShipping**(options?: *[ShippingRequestOptions](../interfaces/shippingrequestoptions.md)*): `Promise`<[CheckoutSelectors](../interfaces/checkoutselectors.md)>

De-initializes the shipping step of a checkout process.

It should be called once you no longer need to collect shipping details. It can perform any necessary clean-up behind the scene, i.e.: remove DOM nodes or event handlers that are attached as a result of shipping initialization.

```js
await service.deinitializeShipping({
    methodId: 'amazon',
});
```

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| `Optional` options | [ShippingRequestOptions](../interfaces/shippingrequestoptions.md) |  Options for deinitializing the shipping step of checkout. |

**Returns:** `Promise`<[CheckoutSelectors](../interfaces/checkoutselectors.md)>
A promise that resolves to the current state.

___
<a id="deleteconsignment"></a>

###  deleteConsignment

▸ **deleteConsignment**(consignmentId: *`string`*, options?: *[RequestOptions](../interfaces/requestoptions.md)*): `Promise`<[CheckoutSelectors](../interfaces/checkoutselectors.md)>

Deletes a consignment

```js
const state = await service.deleteConsignment('55c96cda6f04c');

console.log(state.data.getConsignments());
```

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| consignmentId | `string` |  The ID of the consignment to be deleted |
| `Optional` options | [RequestOptions](../interfaces/requestoptions.md) |  Options for the consignment delete request |

**Returns:** `Promise`<[CheckoutSelectors](../interfaces/checkoutselectors.md)>
A promise that resolves to the current state.

___
<a id="deleteinstrument"></a>

###  deleteInstrument

▸ **deleteInstrument**(instrumentId: *`string`*): `Promise`<[CheckoutSelectors](../interfaces/checkoutselectors.md)>

Deletes a payment instrument by an id.

Once an instrument gets removed, it can no longer be retrieved using `CheckoutStoreSelector#getInstruments`.

```js
const state = service.deleteInstrument('123');

console.log(state.data.getInstruments());
```

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| instrumentId | `string` |  The identifier of the payment instrument to delete. |

**Returns:** `Promise`<[CheckoutSelectors](../interfaces/checkoutselectors.md)>
A promise that resolves to the current state.

___
<a id="executespamcheck"></a>

###  executeSpamCheck

▸ **executeSpamCheck**(): `Promise`<[CheckoutSelectors](../interfaces/checkoutselectors.md)>

Verifies whether the current checkout is created by a human.

Note: this method will do the initialization, therefore you do not need to call `CheckoutService#initializeSpamProtection` before calling this method.

With spam protection enabled, the customer has to be verified as a human. The order creation will fail if spam protection is enabled but verification fails.

```js
await service.executeSpamCheck();
```

**Returns:** `Promise`<[CheckoutSelectors](../interfaces/checkoutselectors.md)>
A promise that resolves to the current state.

___
<a id="finalizeorderifneeded"></a>

###  finalizeOrderIfNeeded

▸ **finalizeOrderIfNeeded**(options?: *[RequestOptions](../interfaces/requestoptions.md)*): `Promise`<[CheckoutSelectors](../interfaces/checkoutselectors.md)>

Finalizes the submission process for an order.

This method is only required for certain hosted payment methods that require a customer to enter their credit card details on their website. You need to call this method once the customer has redirected back to checkout in order to complete the checkout process.

If the method is called before order finalization is required or for a payment method that does not require order finalization, an error will be thrown. Conversely, if the method is called successfully, you should immediately redirect the customer to the order confirmation page.

```js
try {
    await service.finalizeOrderIfNeeded();

    window.location.assign('/order-confirmation');
} catch (error) {
    if (error.type !== 'order_finalization_not_required') {
        throw error;
    }
}
```
*__throws__*: `OrderFinalizationNotRequiredError` error if order finalization is not required for the current order at the time of execution.

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| `Optional` options | [RequestOptions](../interfaces/requestoptions.md) |  Options for finalizing the current order. |

**Returns:** `Promise`<[CheckoutSelectors](../interfaces/checkoutselectors.md)>
A promise that resolves to the current state.

___
<a id="getstate"></a>

###  getState

▸ **getState**(): [CheckoutSelectors](../interfaces/checkoutselectors.md)

Returns a snapshot of the current checkout state.

The method returns a new instance every time there is a change in the checkout state. You can query the state by calling any of its getter methods.

```js
const state = service.getState();

console.log(state.data.getOrder());
console.log(state.errors.getSubmitOrderError());
console.log(state.statuses.isSubmittingOrder());
```

**Returns:** [CheckoutSelectors](../interfaces/checkoutselectors.md)
The current customer's checkout state

___
<a id="initializecustomer"></a>

###  initializeCustomer

▸ **initializeCustomer**(options?: *[CustomerInitializeOptions](../interfaces/customerinitializeoptions.md)*): `Promise`<[CheckoutSelectors](../interfaces/checkoutselectors.md)>

Initializes the sign-in step of a checkout process.

Some payment methods, such as Amazon, have their own sign-in flow. In order to support them, this method must be called.

```js
await service.initializeCustomer({
    methodId: 'amazon',
    amazon: {
        container: 'signInButton',
    },
});
```

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| `Optional` options | [CustomerInitializeOptions](../interfaces/customerinitializeoptions.md) |  Options for initializing the customer step of checkout. |

**Returns:** `Promise`<[CheckoutSelectors](../interfaces/checkoutselectors.md)>
A promise that resolves to the current state.

___
<a id="initializepayment"></a>

###  initializePayment

▸ **initializePayment**(options: *[PaymentInitializeOptions](../interfaces/paymentinitializeoptions.md)*): `Promise`<[CheckoutSelectors](../interfaces/checkoutselectors.md)>

Initializes the payment step of a checkout process.

Before a payment method can accept payment details, it must first be initialized. Some payment methods require you to provide additional initialization options. For example, Amazon requires a container ID in order to initialize their payment widget.

```js
await service.initializePayment({
    methodId: 'amazon',
    amazon: {
        container: 'walletWidget',
    },
});
```

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| options | [PaymentInitializeOptions](../interfaces/paymentinitializeoptions.md) |  Options for initializing the payment step of checkout. |

**Returns:** `Promise`<[CheckoutSelectors](../interfaces/checkoutselectors.md)>
A promise that resolves to the current state.

___
<a id="initializeshipping"></a>

###  initializeShipping

▸ **initializeShipping**(options?: *[ShippingInitializeOptions](../interfaces/shippinginitializeoptions.md)*): `Promise`<[CheckoutSelectors](../interfaces/checkoutselectors.md)>

Initializes the shipping step of a checkout process.

Some payment methods, such as Amazon, can provide shipping information to be used for checkout. In order to support them, this method must be called.

```js
await service.initializeShipping({
    methodId: 'amazon',
    amazon: {
        container: 'addressBook',
    },
});
```

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| `Optional` options | [ShippingInitializeOptions](../interfaces/shippinginitializeoptions.md) |  Options for initializing the shipping step of checkout. |

**Returns:** `Promise`<[CheckoutSelectors](../interfaces/checkoutselectors.md)>
A promise that resolves to the current state.

___
<a id="initializespamprotection"></a>

###  initializeSpamProtection

▸ **initializeSpamProtection**(options: *[SpamProtectionOptions](../interfaces/spamprotectionoptions.md)*): `Promise`<[CheckoutSelectors](../interfaces/checkoutselectors.md)>

Initializes the spam protection for order creation.

Note: Use `CheckoutService#executeSpamCheck` instead. You do not need to call this method before calling `CheckoutService#executeSpamCheck`.

With spam protection enabled, the customer has to be verified as a human. The order creation will fail if spam protection is enabled but verification fails.

```js
await service.initializeSpamProtection();
```
*__deprecated__*: *   Use CheckoutService#executeSpamCheck instead.

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| options | [SpamProtectionOptions](../interfaces/spamprotectionoptions.md) |  Options for initializing spam protection. |

**Returns:** `Promise`<[CheckoutSelectors](../interfaces/checkoutselectors.md)>
A promise that resolves to the current state.

___
<a id="loadbillingaddressfields"></a>

###  loadBillingAddressFields

▸ **loadBillingAddressFields**(options?: *[RequestOptions](../interfaces/requestoptions.md)*): `Promise`<[CheckoutSelectors](../interfaces/checkoutselectors.md)>

Loads a set of form fields that should be presented to customers in order to capture their billing address.

Once the method has been executed successfully, you can call `CheckoutStoreSelector#getBillingAddressFields` to retrieve the set of form fields.

```js
const state = service.loadBillingAddressFields();

console.log(state.data.getBillingAddressFields('US'));
```

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| `Optional` options | [RequestOptions](../interfaces/requestoptions.md) |  Options for loading the billing address form fields. |

**Returns:** `Promise`<[CheckoutSelectors](../interfaces/checkoutselectors.md)>
A promise that resolves to the current state.

___
<a id="loadbillingcountries"></a>

###  loadBillingCountries

▸ **loadBillingCountries**(options?: *[RequestOptions](../interfaces/requestoptions.md)*): `Promise`<[CheckoutSelectors](../interfaces/checkoutselectors.md)>

Loads a list of countries available for billing.

Once you make a successful request, you will be able to retrieve the list of countries by calling `CheckoutStoreSelector#getBillingCountries`.

```js
const state = await service.loadBillingCountries();

console.log(state.data.getBillingCountries());
```

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| `Optional` options | [RequestOptions](../interfaces/requestoptions.md) |  Options for loading the available billing countries. |

**Returns:** `Promise`<[CheckoutSelectors](../interfaces/checkoutselectors.md)>
A promise that resolves to the current state.

___
<a id="loadcheckout"></a>

###  loadCheckout

▸ **loadCheckout**(id?: * `undefined` &#124; `string`*, options?: *[RequestOptions](../interfaces/requestoptions.md)<[CheckoutParams](../interfaces/checkoutparams.md)>*): `Promise`<[CheckoutSelectors](../interfaces/checkoutselectors.md)>

Loads the current checkout.

This method can only be called if there is an active checkout. Also, it can only retrieve data that belongs to the current customer. When it is successfully executed, you can retrieve the data by calling `CheckoutStoreSelector#getCheckout`.

```js
const state = await service.loadCheckout('0cfd6c06-57c3-4e29-8d7a-de55cc8a9052');

console.log(state.data.getCheckout());
```

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| `Optional` id |  `undefined` &#124; `string`|  The identifier of the checkout to load, or the default checkout if not provided. |
| `Optional` options | [RequestOptions](../interfaces/requestoptions.md)<[CheckoutParams](../interfaces/checkoutparams.md)> |  Options for loading the current checkout. |

**Returns:** `Promise`<[CheckoutSelectors](../interfaces/checkoutselectors.md)>
A promise that resolves to the current state.

___
<a id="loadinstruments"></a>

###  loadInstruments

▸ **loadInstruments**(): `Promise`<[CheckoutSelectors](../interfaces/checkoutselectors.md)>

Loads a list of payment instruments associated with a customer.

Once the method has been called successfully, you can retrieve the list of payment instruments by calling `CheckoutStoreSelector#getInstruments`. If the customer does not have any payment instruments on record, i.e.: credit card, you will get an empty list instead.

```js
const state = service.loadInstruments();

console.log(state.data.getInstruments());
```

**Returns:** `Promise`<[CheckoutSelectors](../interfaces/checkoutselectors.md)>
A promise that resolves to the current state.

___
<a id="loadorder"></a>

###  loadOrder

▸ **loadOrder**(orderId: *`number`*, options?: *[RequestOptions](../interfaces/requestoptions.md)*): `Promise`<[CheckoutSelectors](../interfaces/checkoutselectors.md)>

Loads an order by an id.

The method can only retrieve an order if the order belongs to the current customer. If it is successfully executed, the data can be retrieved by calling `CheckoutStoreSelector#getOrder`.

```js
const state = await service.loadOrder(123);

console.log(state.data.getOrder());
```

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| orderId | `number` |  The identifier of the order to load. |
| `Optional` options | [RequestOptions](../interfaces/requestoptions.md) |  Options for loading the order. |

**Returns:** `Promise`<[CheckoutSelectors](../interfaces/checkoutselectors.md)>
A promise that resolves to the current state.

___
<a id="loadpaymentmethods"></a>

###  loadPaymentMethods

▸ **loadPaymentMethods**(options?: *[RequestOptions](../interfaces/requestoptions.md)*): `Promise`<[CheckoutSelectors](../interfaces/checkoutselectors.md)>

Loads a list of payment methods available for checkout.

If a customer enters their payment details before navigating to the checkout page (i.e.: using PayPal checkout button on the cart page), only one payment method will be available for the customer - the selected payment method. Otherwise, by default, all payment methods configured by the merchant will be available for the customer.

Once the method is executed successfully, you can call `CheckoutStoreSelector#getPaymentMethods` to retrieve the list of payment methods.

```js
const state = service.loadPaymentMethods();

console.log(state.data.getPaymentMethods());
```

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| `Optional` options | [RequestOptions](../interfaces/requestoptions.md) |  Options for loading the payment methods that are available to the current customer. |

**Returns:** `Promise`<[CheckoutSelectors](../interfaces/checkoutselectors.md)>
A promise that resolves to the current state.

___
<a id="loadshippingaddressfields"></a>

###  loadShippingAddressFields

▸ **loadShippingAddressFields**(options?: *[RequestOptions](../interfaces/requestoptions.md)*): `Promise`<[CheckoutSelectors](../interfaces/checkoutselectors.md)>

Loads a set of form fields that should be presented to customers in order to capture their shipping address.

Once the method has been executed successfully, you can call `CheckoutStoreSelector#getShippingAddressFields` to retrieve the set of form fields.

```js
const state = service.loadShippingAddressFields();

console.log(state.data.getShippingAddressFields('US'));
```

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| `Optional` options | [RequestOptions](../interfaces/requestoptions.md) |  Options for loading the shipping address form fields. |

**Returns:** `Promise`<[CheckoutSelectors](../interfaces/checkoutselectors.md)>
A promise that resolves to the current state.

___
<a id="loadshippingcountries"></a>

###  loadShippingCountries

▸ **loadShippingCountries**(options?: *[RequestOptions](../interfaces/requestoptions.md)*): `Promise`<[CheckoutSelectors](../interfaces/checkoutselectors.md)>

Loads a list of countries available for shipping.

The list is determined based on the shipping zones configured by a merchant. Once you make a successful call, you will be able to retrieve the list of available shipping countries by calling `CheckoutStoreSelector#getShippingCountries`.

```js
const state = await service.loadShippingCountries();

console.log(state.data.getShippingCountries());
```

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| `Optional` options | [RequestOptions](../interfaces/requestoptions.md) |  Options for loading the available shipping countries. |

**Returns:** `Promise`<[CheckoutSelectors](../interfaces/checkoutselectors.md)>
A promise that resolves to the current state.

___
<a id="loadshippingoptions"></a>

###  loadShippingOptions

▸ **loadShippingOptions**(options?: *[RequestOptions](../interfaces/requestoptions.md)*): `Promise`<[CheckoutSelectors](../interfaces/checkoutselectors.md)>

Loads a list of shipping options available for checkout.

Available shipping options can only be determined once a customer provides their shipping address. If the method is executed successfully, `CheckoutStoreSelector#getShippingOptions` can be called to retrieve the list of shipping options.

```js
const state = await service.loadShippingOptions();

console.log(state.data.getShippingOptions());
```

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| `Optional` options | [RequestOptions](../interfaces/requestoptions.md) |  Options for loading the available shipping options. |

**Returns:** `Promise`<[CheckoutSelectors](../interfaces/checkoutselectors.md)>
A promise that resolves to the current state.

___
<a id="notifystate"></a>

###  notifyState

▸ **notifyState**(): `void`

Notifies all subscribers with the current state.

When this method gets called, the subscribers get called regardless if they have any filters applied.

**Returns:** `void`

___
<a id="removecoupon"></a>

###  removeCoupon

▸ **removeCoupon**(code: *`string`*, options?: *[RequestOptions](../interfaces/requestoptions.md)*): `Promise`<[CheckoutSelectors](../interfaces/checkoutselectors.md)>

Removes a coupon code from the current checkout.

Once the coupon code gets removed, the quote for the current checkout will be adjusted accordingly.

```js
await service.removeCoupon('COUPON');
```

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| code | `string` |  The coupon code to remove from the current checkout. |
| `Optional` options | [RequestOptions](../interfaces/requestoptions.md) |  Options for removing the coupon code. |

**Returns:** `Promise`<[CheckoutSelectors](../interfaces/checkoutselectors.md)>
A promise that resolves to the current state.

___
<a id="removegiftcertificate"></a>

###  removeGiftCertificate

▸ **removeGiftCertificate**(code: *`string`*, options?: *[RequestOptions](../interfaces/requestoptions.md)*): `Promise`<[CheckoutSelectors](../interfaces/checkoutselectors.md)>

Removes a gift certificate from an order.

Once the gift certificate gets removed, the quote for the current checkout will be adjusted accordingly.

```js
await service.removeGiftCertificate('GIFT_CERTIFICATE');
```

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| code | `string` |  The gift certificate to remove from the current checkout. |
| `Optional` options | [RequestOptions](../interfaces/requestoptions.md) |  Options for removing the gift certificate. |

**Returns:** `Promise`<[CheckoutSelectors](../interfaces/checkoutselectors.md)>
A promise that resolves to the current state.

___
<a id="selectconsignmentshippingoption"></a>

###  selectConsignmentShippingOption

▸ **selectConsignmentShippingOption**(consignmentId: *`string`*, shippingOptionId: *`string`*, options?: *[ShippingRequestOptions](../interfaces/shippingrequestoptions.md)*): `Promise`<[CheckoutSelectors](../interfaces/checkoutselectors.md)>

Selects a shipping option for a given consignment.

Note: this is used when items need to be shipped to multiple addresses, for single shipping address, use `CheckoutService#updateShippingAddress`.

If a shipping option has an additional cost, the quote for the current order will be adjusted once the option is selected.

```js
const state = await service.selectConsignmentShippingOption(consignmentId, optionId);

console.log(state.data.getConsignments());
```

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| consignmentId | `string` |  The identified of the consignment to be updated. |
| shippingOptionId | `string` |  The identifier of the shipping option to select. |
| `Optional` options | [ShippingRequestOptions](../interfaces/shippingrequestoptions.md) |  Options for selecting the shipping option. |

**Returns:** `Promise`<[CheckoutSelectors](../interfaces/checkoutselectors.md)>
A promise that resolves to the current state.

___
<a id="selectshippingoption"></a>

###  selectShippingOption

▸ **selectShippingOption**(shippingOptionId: *`string`*, options?: *[ShippingRequestOptions](../interfaces/shippingrequestoptions.md)*): `Promise`<[CheckoutSelectors](../interfaces/checkoutselectors.md)>

Selects a shipping option for the current address.

If a shipping option has an additional cost, the quote for the current order will be adjusted once the option is selected.

```js
const state = await service.selectShippingOption('address-id', 'shipping-option-id');

console.log(state.data.getSelectedShippingOption());
```

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| shippingOptionId | `string` |  The identifier of the shipping option to select. |
| `Optional` options | [ShippingRequestOptions](../interfaces/shippingrequestoptions.md) |  Options for selecting the shipping option. |

**Returns:** `Promise`<[CheckoutSelectors](../interfaces/checkoutselectors.md)>
A promise that resolves to the current state.

___
<a id="signincustomer"></a>

###  signInCustomer

▸ **signInCustomer**(credentials: *[CustomerCredentials](../interfaces/customercredentials.md)*, options?: *[CustomerRequestOptions](../interfaces/customerrequestoptions.md)*): `Promise`<[CheckoutSelectors](../interfaces/checkoutselectors.md)>

Signs into a customer's registered account.

Once the customer is signed in successfully, the checkout state will be populated with information associated with the customer, such as their saved addresses. You can call `CheckoutStoreSelector#getCustomer` to retrieve the data.

```js
const state = await service.signInCustomer({
    email: 'foo@bar.com',
    password: 'password123',
});

console.log(state.data.getCustomer());
```

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| credentials | [CustomerCredentials](../interfaces/customercredentials.md) |  The credentials to be used for signing in the customer. |
| `Optional` options | [CustomerRequestOptions](../interfaces/customerrequestoptions.md) |  Options for signing in the customer. |

**Returns:** `Promise`<[CheckoutSelectors](../interfaces/checkoutselectors.md)>
A promise that resolves to the current state.

___
<a id="signoutcustomer"></a>

###  signOutCustomer

▸ **signOutCustomer**(options?: *[CustomerRequestOptions](../interfaces/customerrequestoptions.md)*): `Promise`<[CheckoutSelectors](../interfaces/checkoutselectors.md)>

Signs out the current customer if they are previously signed in.

Once the customer is successfully signed out, the checkout state will be reset automatically.

```js
const state = await service.signOutCustomer();

// The returned object should not contain information about the previously signed-in customer.
console.log(state.data.getCustomer());
```

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| `Optional` options | [CustomerRequestOptions](../interfaces/customerrequestoptions.md) |  Options for signing out the customer. |

**Returns:** `Promise`<[CheckoutSelectors](../interfaces/checkoutselectors.md)>
A promise that resolves to the current state.

___
<a id="submitorder"></a>

###  submitOrder

▸ **submitOrder**(payload: *[OrderRequestBody](../interfaces/orderrequestbody.md)*, options?: *[RequestOptions](../interfaces/requestoptions.md)*): `Promise`<[CheckoutSelectors](../interfaces/checkoutselectors.md)>

Submits an order, thereby completing a checkout process.

Before you can submit an order, you must initialize the payment method chosen by the customer by calling `CheckoutService#initializePayment`.

```js
await service.initializePayment({ methodId: 'braintree' });
await service.submitOrder({
    payment: {
        methodId: 'braintree',
        paymentData: {
            ccExpiry: { month: 10, year: 20 },
            ccName: 'BigCommerce',
            ccNumber: '4111111111111111',
            ccCvv: 123,
        },
    },
});
```

You are not required to include `paymentData` if the order does not require additional payment details. For example, the customer has already entered their payment details on the cart page using one of the hosted payment methods, such as PayPal. Or the customer has applied a gift certificate that exceeds the grand total amount.

If the order is submitted successfully, you can retrieve the newly created order by calling `CheckoutStoreSelector#getOrder`.

```js
const state = await service.submitOrder(payload);

console.log(state.data.getOrder());
```

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| payload | [OrderRequestBody](../interfaces/orderrequestbody.md) |  The request payload to submit for the current order. |
| `Optional` options | [RequestOptions](../interfaces/requestoptions.md) |  Options for submitting the current order. |

**Returns:** `Promise`<[CheckoutSelectors](../interfaces/checkoutselectors.md)>
A promise that resolves to the current state.

___
<a id="subscribe"></a>

###  subscribe

▸ **subscribe**(subscriber: *`function`*, ...filters: *`Array`<`function`>*): `function`

Subscribes to any changes to the current state.

The method registers a callback function and executes it every time there is a change in the checkout state.

```js
service.subscribe(state => {
    console.log(state.data.getCart());
});
```

The method can be configured to notify subscribers only regarding relevant changes, by providing a filter function.

```js
const filter = state => state.data.getCart();

// Only trigger the subscriber when the cart changes.
service.subscribe(state => {
    console.log(state.data.getCart())
}, filter);
```

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| subscriber | `function` |  The function to subscribe to state changes. |
| `Rest` filters | `Array`<`function`> |  One or more functions to filter out irrelevant state changes. If more than one function is provided, the subscriber will only be triggered if all conditions are met. |

**Returns:** `function`
A function, if called, will unsubscribe the subscriber.

___
<a id="unassignitemstoaddress"></a>

###  unassignItemsToAddress

▸ **unassignItemsToAddress**(consignment: *[ConsignmentAssignmentRequestBody](../interfaces/consignmentassignmentrequestbody.md)*, options?: *[RequestOptions](../interfaces/requestoptions.md)*): `Promise`<[CheckoutSelectors](../interfaces/checkoutselectors.md)>

Convenience method that unassigns items from a specific shipping address.

Note: this method finds an existing consignment that matches the provided address and unassigns the specified items. If the consignment ends up with no line items after the unassignment, it will be deleted.

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| consignment | [ConsignmentAssignmentRequestBody](../interfaces/consignmentassignmentrequestbody.md) |  The consignment data that will be used. |
| `Optional` options | [RequestOptions](../interfaces/requestoptions.md) |  Options for the request |

**Returns:** `Promise`<[CheckoutSelectors](../interfaces/checkoutselectors.md)>
A promise that resolves to the current state.

___
<a id="updatebillingaddress"></a>

###  updateBillingAddress

▸ **updateBillingAddress**(address: *`Partial`<[BillingAddressRequestBody](../interfaces/billingaddressrequestbody.md)>*, options?: *[RequestOptions](../interfaces/requestoptions.md)*): `Promise`<[CheckoutSelectors](../interfaces/checkoutselectors.md)>

Updates the billing address for the current checkout.

A customer must provide their billing address before they can proceed to pay for their order.

You can submit an address that is partially complete. The address does not get validated until you submit the order.

```js
const state = await service.updateBillingAddress(address);

console.log(state.data.getBillingAddress());
```

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| address | `Partial`<[BillingAddressRequestBody](../interfaces/billingaddressrequestbody.md)> |  The address to be used for billing. |
| `Optional` options | [RequestOptions](../interfaces/requestoptions.md) |  Options for updating the billing address. |

**Returns:** `Promise`<[CheckoutSelectors](../interfaces/checkoutselectors.md)>
A promise that resolves to the current state.

___
<a id="updatecheckout"></a>

###  updateCheckout

▸ **updateCheckout**(payload: *[CheckoutRequestBody](../interfaces/checkoutrequestbody.md)*, options?: *[RequestOptions](../interfaces/requestoptions.md)*): `Promise`<[CheckoutSelectors](../interfaces/checkoutselectors.md)>

Updates specific properties of the current checkout.

```js
const state = await service.updateCheckout(checkout);

console.log(state.data.getCheckout());
```

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| payload | [CheckoutRequestBody](../interfaces/checkoutrequestbody.md) |  The checkout properties to be updated. |
| `Optional` options | [RequestOptions](../interfaces/requestoptions.md) |  Options for loading the current checkout. |

**Returns:** `Promise`<[CheckoutSelectors](../interfaces/checkoutselectors.md)>
A promise that resolves to the current state.

___
<a id="updateconsignment"></a>

###  updateConsignment

▸ **updateConsignment**(consignment: *[ConsignmentUpdateRequestBody](../interfaces/consignmentupdaterequestbody.md)*, options?: *[RequestOptions](../interfaces/requestoptions.md)*): `Promise`<[CheckoutSelectors](../interfaces/checkoutselectors.md)>

Updates a specific consignment.

Note: this is used when items need to be shipped to multiple addresses, for single shipping address, use `CheckoutService#selectShippingOption`.

When a shipping address for a consignment is updated, an updated list of shipping options will become available for the consignment, unless no options are available. If the update is successful, you can call `CheckoutStoreSelector#getConsignments` to retrieve updated list of consignments.

Beware that if the updated consignment includes all line items from another consignment, that consignment will be deleted as a valid consignment must include at least one valid line item.

If the shipping address changes and the selected shipping option becomes unavailable for the updated address, the shipping option will be deselected.

You can submit an address that is partially complete. The address does not get validated until you submit the order.

```js
const state = await service.updateConsignment(consignment);

console.log(state.data.getConsignments());
```

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| consignment | [ConsignmentUpdateRequestBody](../interfaces/consignmentupdaterequestbody.md) |  The consignment data that will be used. |
| `Optional` options | [RequestOptions](../interfaces/requestoptions.md) |  Options for updating the shipping address. |

**Returns:** `Promise`<[CheckoutSelectors](../interfaces/checkoutselectors.md)>
A promise that resolves to the current state.

___
<a id="updateshippingaddress"></a>

###  updateShippingAddress

▸ **updateShippingAddress**(address: *`Partial`<[AddressRequestBody](../interfaces/addressrequestbody.md)>*, options?: *[ShippingRequestOptions](../interfaces/shippingrequestoptions.md)<[CheckoutParams](../interfaces/checkoutparams.md)>*): `Promise`<[CheckoutSelectors](../interfaces/checkoutselectors.md)>

Updates the shipping address for the current checkout.

When a customer updates their shipping address for an order, they will see an updated list of shipping options and the cost for each option, unless no options are available. If the update is successful, you can call `CheckoutStoreSelector#getShippingAddress` to retrieve the address.

If the shipping address changes and the selected shipping option becomes unavailable for the updated address, the shipping option will be deselected.

You can submit an address that is partially complete. The address does not get validated until you submit the order.

```js
const state = await service.updateShippingAddress(address);

console.log(state.data.getShippingAddress());
```

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| address | `Partial`<[AddressRequestBody](../interfaces/addressrequestbody.md)> |  The address to be used for shipping. |
| `Optional` options | [ShippingRequestOptions](../interfaces/shippingrequestoptions.md)<[CheckoutParams](../interfaces/checkoutparams.md)> |  Options for updating the shipping address. |

**Returns:** `Promise`<[CheckoutSelectors](../interfaces/checkoutselectors.md)>
A promise that resolves to the current state.

___
<a id="updatesubscriptions"></a>

###  updateSubscriptions

▸ **updateSubscriptions**(subscriptions: *[Subscriptions](../interfaces/subscriptions.md)*, options?: *[RequestOptions](../interfaces/requestoptions.md)*): `Promise`<[CheckoutSelectors](../interfaces/checkoutselectors.md)>

Updates the subscriptions associated to an email.

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| subscriptions | [Subscriptions](../interfaces/subscriptions.md) |  The email and associated subscriptions to update. |
| `Optional` options | [RequestOptions](../interfaces/requestoptions.md) |  Options for continuing as a guest. |

**Returns:** `Promise`<[CheckoutSelectors](../interfaces/checkoutselectors.md)>
A promise that resolves to the current state.

___

