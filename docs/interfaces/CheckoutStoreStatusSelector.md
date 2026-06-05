[**@bigcommerce/checkout-sdk**](../README.md)

***

[@bigcommerce/checkout-sdk](../README.md) / CheckoutStoreStatusSelector

# Interface: CheckoutStoreStatusSelector

Responsible for checking the statuses of various asynchronous actions related
to checkout.

This object has a set of getters that return true if an action is in
progress. For example, you can check whether a customer is submitting an
order and waiting for the request to complete.

## Methods

### isApplyingCoupon()

> **isApplyingCoupon**(): `boolean`

Checks whether the current customer is applying a coupon code.

#### Returns

`boolean`

True if applying a coupon code, otherwise false.

***

### isApplyingGiftCertificate()

> **isApplyingGiftCertificate**(): `boolean`

Checks whether the current customer is applying a gift certificate.

#### Returns

`boolean`

True if applying a gift certificate, otherwise false.

***

### isApplyingStoreCredit()

> **isApplyingStoreCredit**(): `boolean`

Checks whether the current customer is applying store credit.

#### Returns

`boolean`

True if applying store credit, otherwise false.

***

### isContinuingAsGuest()

> **isContinuingAsGuest**(): `boolean`

Checks whether the shopper is continuing out as a guest.

#### Returns

`boolean`

True if continuing as guest, otherwise false.

***

### isCreatingConsignments()

> **isCreatingConsignments**(): `boolean`

Checks whether a given/any consignment is being updated.

A consignment ID should be provided when checking for a specific consignment,
otherwise it will check for any consignment.

#### Returns

`boolean`

True if creating consignments, otherwise false.

***

### isCreatingCustomerAccount()

> **isCreatingCustomerAccount**(): `boolean`

Checks whether a customer account is being created

#### Returns

`boolean`

True if creating, otherwise false.

***

### isCreatingCustomerAddress()

> **isCreatingCustomerAddress**(): `boolean`

Checks whether a customer address is being created

#### Returns

`boolean`

True if creating, otherwise false.

***

### isCustomerStepPending()

> **isCustomerStepPending**(): `boolean`

Checks whether the customer step of a checkout is in a pending state.

The customer step is considered to be pending if it is in the process of
initializing, signing in, signing out, and/or interacting with a customer
widget.

#### Returns

`boolean`

True if the customer step is pending, otherwise false.

***

### isDeletingConsignment()

> **isDeletingConsignment**(`consignmentId?`): `boolean`

Checks whether a given/any consignment is being deleted.

A consignment ID should be provided when checking for a specific consignment,
otherwise it will check for any consignment.

#### Parameters

##### consignmentId?

`string`

The identifier of the consignment to be checked.

#### Returns

`boolean`

True if deleting consignment(s), otherwise false.

***

### isDeletingInstrument()

> **isDeletingInstrument**(`instrumentId?`): `boolean`

Checks whether the current customer is deleting a payment instrument.

#### Parameters

##### instrumentId?

`string`

#### Returns

`boolean`

True if deleting a payment instrument, otherwise false.

***

### isExecutingPaymentMethodCheckout()

> **isExecutingPaymentMethodCheckout**(`methodId?`): `boolean`

Checks whether the current customer is executing payment method checkout.

If an ID is provided, the method also checks whether the customer is
executing payment method checkout using a specific customer method with the same ID.

#### Parameters

##### methodId?

`string`

The identifier of the method used for continuing the
current customer.

#### Returns

`boolean`

True if the customer is executing payment method checkout, otherwise false.

***

### isExecutingSpamCheck()

> **isExecutingSpamCheck**(): `boolean`

Checks whether spam check is executing.

#### Returns

`boolean`

True if the current checkout is being updated, otherwise false.

***

### isFinalizingOrder()

> **isFinalizingOrder**(): `boolean`

Checks whether the current order is finalizing.

#### Returns

`boolean`

True if the current order is finalizing, otherwise false.

***

### isInitializedCustomer()

> **isInitializedCustomer**(`methodId?`): `boolean`

Checks whether a wallet button is initialized.

#### Parameters

##### methodId?

`string`

The identifier of the payment method to check.

#### Returns

`boolean`

True if the wallet button method is initialized, otherwise false.

***

### isInitializingCustomer()

> **isInitializingCustomer**(`methodId?`): `boolean`

Checks whether the customer step is initializing.

If an ID is provided, the method also checks whether the customer step is
initializing using a specific customer method with the same ID.

#### Parameters

##### methodId?

`string`

The identifier of the method used for initializing the
customer step of checkout.

#### Returns

`boolean`

True if the customer step is initializing, otherwise false.

***

### isInitializingPayment()

> **isInitializingPayment**(`methodId?`): `boolean`

Checks whether a specific or any payment method is initializing.

The method returns true if no ID is provided and at least one payment
method is initializing.

#### Parameters

##### methodId?

`string`

The identifier of the payment method to check.

#### Returns

`boolean`

True if the payment method is initializing, otherwise false.

***

### isInitializingShipping()

> **isInitializingShipping**(`methodId?`): `boolean`

Checks whether the shipping step of a checkout process is initializing.

If an identifier is provided, the method also checks whether the shipping
step is initializing using a specific shipping method with the same
identifier.

#### Parameters

##### methodId?

`string`

The identifer of the initialization method to check.

#### Returns

`boolean`

True if the shipping step is initializing, otherwise false.

***

### isLoadingB2BToken()

> **isLoadingB2BToken**(): `boolean`

Checks whether a B2B token is being loaded.

#### Returns

`boolean`

True if a B2B token is being loaded, otherwise false.

***

### isLoadingBillingCountries()

> **isLoadingBillingCountries**(): `boolean`

Checks whether billing countries are loading.

#### Returns

`boolean`

True if billing countries are loading, otherwise false.

***

### isLoadingCart()

> **isLoadingCart**(): `boolean`

Checks whether the current cart is loading.

#### Returns

`boolean`

True if the current cart is loading, otherwise false.

***

### isLoadingCheckout()

> **isLoadingCheckout**(): `boolean`

Checks whether the current checkout is loading.

#### Returns

`boolean`

True if the current checkout is loading, otherwise false.

***

### isLoadingConfig()

> **isLoadingConfig**(): `boolean`

Checks whether the checkout configuration of a store is loading.

#### Returns

`boolean`

True if the configuration is loading, otherwise false.

***

### isLoadingInstruments()

> **isLoadingInstruments**(): `boolean`

Checks whether the current customer's payment instruments are loading.

#### Returns

`boolean`

True if payment instruments are loading, otherwise false.

***

### isLoadingOrder()

> **isLoadingOrder**(): `boolean`

Checks whether the current order is loading.

#### Returns

`boolean`

True if the current order is loading, otherwise false.

***

### isLoadingPaymentMethod()

> **isLoadingPaymentMethod**(`methodId?`): `boolean`

Checks whether a specific or any payment method is loading.

The method returns true if no ID is provided and at least one payment
method is loading.

#### Parameters

##### methodId?

`string`

The identifier of the payment method to check.

#### Returns

`boolean`

True if the payment method is loading, otherwise false.

***

### isLoadingPaymentMethods()

> **isLoadingPaymentMethods**(): `boolean`

Checks whether payment methods are loading.

#### Returns

`boolean`

True if payment methods are loading, otherwise false.

***

### isLoadingPickupOptions()

> **isLoadingPickupOptions**(): `boolean`

Checks whether pickup options are loading.

#### Returns

`boolean`

True if pickup options are loading, otherwise false.

***

### isLoadingShippingCountries()

> **isLoadingShippingCountries**(): `boolean`

Checks whether shipping countries are loading.

#### Returns

`boolean`

True if shipping countries are loading, otherwise false.

***

### isLoadingShippingOptions()

> **isLoadingShippingOptions**(): `boolean`

Checks whether shipping options are loading.

#### Returns

`boolean`

True if shipping options are loading, otherwise false.

***

### isPaymentStepPending()

> **isPaymentStepPending**(): `boolean`

Checks whether the payment step of a checkout is in a pending state.

The payment step is considered to be pending if it is in the process of
initializing, submitting an order, finalizing an order, and/or
interacting with a payment widget.

#### Returns

`boolean`

True if the payment step is pending, otherwise false.

***

### isPending()

> **isPending**(): `boolean`

Checks whether any checkout action is pending.

#### Returns

`boolean`

True if there is a pending action, otherwise false.

***

### isPersistingB2BMetadata()

> **isPersistingB2BMetadata**(): `boolean`

Checks whether B2B order metadata is being persisted.

#### Returns

`boolean`

True if B2B order metadata is being persisted, otherwise false.

***

### isRemovingCoupon()

> **isRemovingCoupon**(): `boolean`

Checks whether the current customer is removing a coupon code.

#### Returns

`boolean`

True if removing a coupon code, otherwise false.

***

### isRemovingGiftCertificate()

> **isRemovingGiftCertificate**(): `boolean`

Checks whether the current customer is removing a gift certificate.

#### Returns

`boolean`

True if removing a gift certificate, otherwise false.

***

### isSelectingShippingOption()

> **isSelectingShippingOption**(`consignmentId?`): `boolean`

Checks whether a shipping option is being selected.

A consignment ID should be provided when checking if a shipping option
is being selected for a specific consignment, otherwise it will check
for all consignments.

#### Parameters

##### consignmentId?

`string`

The identifier of the consignment to be checked.

#### Returns

`boolean`

True if selecting a shipping option, otherwise false.

***

### isSendingSignInEmail()

> **isSendingSignInEmail**(): `boolean`

Checks whether a sign-in email is being sent.

#### Returns

`boolean`

True if sending a sign-in email, otherwise false

***

### isShippingStepPending()

> **isShippingStepPending**(): `boolean`

Checks whether the shipping step of a checkout is in a pending state.

The shipping step is considered to be pending if it is in the process of
initializing, updating address, selecting a shipping option, and/or
interacting with a shipping widget.

#### Returns

`boolean`

True if the shipping step is pending, otherwise false.

***

### isSigningIn()

> **isSigningIn**(`methodId?`): `boolean`

Checks whether the current customer is signing in.

If an ID is provided, the method also checks whether the customer is
signing in using a specific customer method with the same ID.

#### Parameters

##### methodId?

`string`

The identifier of the method used for signing in the
current customer.

#### Returns

`boolean`

True if the customer is signing in, otherwise false.

***

### isSigningOut()

> **isSigningOut**(`methodId?`): `boolean`

Checks whether the current customer is signing out.

If an ID is provided, the method also checks whether the customer is
signing out using a specific customer method with the same ID.

#### Parameters

##### methodId?

`string`

The identifier of the method used for signing out the
current customer.

#### Returns

`boolean`

True if the customer is signing out, otherwise false.

***

### isSubmittingOrder()

> **isSubmittingOrder**(): `boolean`

Checks whether the current order is submitting.

#### Returns

`boolean`

True if the current order is submitting, otherwise false.

***

### isUpdatingBillingAddress()

> **isUpdatingBillingAddress**(): `boolean`

Checks whether the billing address is being updated.

#### Returns

`boolean`

True if updating their billing address, otherwise false.

***

### isUpdatingCheckout()

> **isUpdatingCheckout**(): `boolean`

Checks whether the current checkout is being updated.

#### Returns

`boolean`

True if the current checkout is being updated, otherwise false.

***

### isUpdatingConsignment()

> **isUpdatingConsignment**(`consignmentId?`): `boolean`

Checks whether a given/any consignment is being updated.

A consignment ID should be provided when checking for a specific consignment,
otherwise it will check for any consignment.

#### Parameters

##### consignmentId?

`string`

The identifier of the consignment to be checked.

#### Returns

`boolean`

True if updating consignment(s), otherwise false.

***

### isUpdatingShippingAddress()

> **isUpdatingShippingAddress**(): `boolean`

Checks the shipping address is being updated.

#### Returns

`boolean`

True if updating their shipping address, otherwise false.

***

### isUpdatingSubscriptions()

> **isUpdatingSubscriptions**(): `boolean`

Checks whether the subscriptions are being updated.

#### Returns

`boolean`

True if updating subscriptions, otherwise false.
