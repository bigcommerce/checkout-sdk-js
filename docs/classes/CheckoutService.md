[**@bigcommerce/checkout-sdk**](../README.md)

***

[@bigcommerce/checkout-sdk](../README.md) / CheckoutService

# Class: CheckoutService

Responsible for completing the checkout process for the current customer.

This object can be used to collect all information that is required for
checkout, such as shipping and billing information. It can also be used to
retrieve the current checkout state and subscribe to its changes.

## Constructors

### Constructor

> **new CheckoutService**(): `CheckoutService`

#### Returns

`CheckoutService`

## Methods

### applyCoupon()

> **applyCoupon**(`code`, `options?`): `Promise`\<[`CheckoutSelectors`](../interfaces/CheckoutSelectors.md)\>

Applies a coupon code to the current checkout.

Once the coupon code gets applied, the quote for the current checkout will
be adjusted accordingly. The same coupon code cannot be applied more than
once.

```js
await service.applyCoupon('COUPON');
```

#### Parameters

##### code

`string`

The coupon code to apply to the current checkout.

##### options?

[`RequestOptions`](../interfaces/RequestOptions.md)\<`object`\>

Options for applying the coupon code.

#### Returns

`Promise`\<[`CheckoutSelectors`](../interfaces/CheckoutSelectors.md)\>

A promise that resolves to the current state.

***

### applyGiftCertificate()

> **applyGiftCertificate**(`code`, `options?`): `Promise`\<[`CheckoutSelectors`](../interfaces/CheckoutSelectors.md)\>

Applies a gift certificate to the current checkout.

Once the gift certificate gets applied, the quote for the current
checkout will be adjusted accordingly.

```js
await service.applyGiftCertificate('GIFT_CERTIFICATE');
```

#### Parameters

##### code

`string`

The gift certificate to apply to the current checkout.

##### options?

[`RequestOptions`](../interfaces/RequestOptions.md)\<`object`\>

Options for applying the gift certificate.

#### Returns

`Promise`\<[`CheckoutSelectors`](../interfaces/CheckoutSelectors.md)\>

A promise that resolves to the current state.

***

### applyStoreCredit()

> **applyStoreCredit**(`useStoreCredit`, `options?`): `Promise`\<[`CheckoutSelectors`](../interfaces/CheckoutSelectors.md)\>

Applies or removes customer's store credit code to the current checkout.

Once the store credit gets applied, the outstanding balance will be adjusted accordingly.

```js
const state = await service.applyStoreCredit(true);

console.log(state.data.getCheckout().outstandingBalance);
```

#### Parameters

##### useStoreCredit

`boolean`

##### options?

[`RequestOptions`](../interfaces/RequestOptions.md)\<`object`\>

Options for applying store credit.

#### Returns

`Promise`\<[`CheckoutSelectors`](../interfaces/CheckoutSelectors.md)\>

A promise that resolves to the current state.

***

### assignItemsToAddress()

> **assignItemsToAddress**(`consignment`, `options?`): `Promise`\<[`CheckoutSelectors`](../interfaces/CheckoutSelectors.md)\>

Convenience method that assigns items to be shipped to a specific address.

Note: this method finds an existing consignment that matches the provided address
and assigns the provided items. If no consignment matches the address, a new one
will be created.

#### Parameters

##### consignment

[`ConsignmentAssignmentRequestBody`](../type-aliases/ConsignmentAssignmentRequestBody.md)

The consignment data that will be used.

##### options?

[`RequestOptions`](../interfaces/RequestOptions.md)\<`object`\>

Options for the request

#### Returns

`Promise`\<[`CheckoutSelectors`](../interfaces/CheckoutSelectors.md)\>

A promise that resolves to the current state.

***

### clearError()

> **clearError**(`error`): `Promise`\<[`CheckoutSelectors`](../interfaces/CheckoutSelectors.md)\>

Clear errors that have been collected from previous calls.

```js
const state = await service.clearError(error);

console.log(state.errors.getError());
```

#### Parameters

##### error

`Error`

Specific error object to clear

#### Returns

`Promise`\<[`CheckoutSelectors`](../interfaces/CheckoutSelectors.md)\>

A promise that resolves to the current state.

***

### clearExtensionCache()

> **clearExtensionCache**(`region`): `void`

**`Alpha`**

Clear cache for a checkout extension when removing it from UI.
This function should be used whenver an extension is removed from the UI.

#### Parameters

##### region

[`ExtensionRegion`](../enumerations/ExtensionRegion.md)

The name of an area where the extension should be presented.

#### Returns

`void`

***

### continueAsGuest()

> **continueAsGuest**(`credentials`, `options?`): `Promise`\<[`CheckoutSelectors`](../interfaces/CheckoutSelectors.md)\>

Continues to check out as a guest.

If your Checkout Settings allow it, your customers could continue the checkout as guests (without signing in).
If you have enabled the checkout setting "Prompt existing accounts to sign in", this information is
exposed as part of the [Customer](../interfaces/customer.md) object.

Once they provide their email address, it will be stored as
part of their [billing address](../interfaces/billingaddress.md).

#### Parameters

##### credentials

[`GuestCredentials`](../type-aliases/GuestCredentials.md)

The guest credentials to use, with optional subscriptions.

##### options?

[`RequestOptions`](../interfaces/RequestOptions.md)\<`object`\>

Options for continuing as a guest.

#### Returns

`Promise`\<[`CheckoutSelectors`](../interfaces/CheckoutSelectors.md)\>

A promise that resolves to the current state.

***

### createConsignments()

> **createConsignments**(`consignments`, `options?`): `Promise`\<[`CheckoutSelectors`](../interfaces/CheckoutSelectors.md)\>

Creates consignments given a list.

Note: this is used when items need to be shipped to multiple addresses,
for single shipping address, use `CheckoutService#updateShippingAddress`.

When consignments are created, an updated list of shipping options will
become available for each consignment, unless no options are available.
If the update is successful, you can call
`CheckoutStoreSelector#getConsignments` to retrieve the updated list of
consignments.'

Beware that if a consignment includes all line items from another
consignment, that consignment will be deleted as a valid consignment must
include at least one valid line item.

You can submit an address that is partially complete. The address does
not get validated until you submit the order.

```js
const state = await service.createConsignments(consignments);

console.log(state.data.getConsignments());
```

#### Parameters

##### consignments

[`ConsignmentsRequestBody`](../type-aliases/ConsignmentsRequestBody.md)

The list of consignments to be created.

##### options?

[`RequestOptions`](../interfaces/RequestOptions.md)\<`object`\>

Options for updating the shipping address.

#### Returns

`Promise`\<[`CheckoutSelectors`](../interfaces/CheckoutSelectors.md)\>

A promise that resolves to the current state.

***

### createCustomerAccount()

> **createCustomerAccount**(`customerAccount`, `options?`): `Promise`\<[`CheckoutSelectors`](../interfaces/CheckoutSelectors.md)\>

**`Alpha`**

Creates a customer account.

#### Parameters

##### customerAccount

[`CustomerAccountRequestBody`](../interfaces/CustomerAccountRequestBody.md)

The customer account data.

##### options?

[`RequestOptions`](../interfaces/RequestOptions.md)\<`object`\>

Options for creating customer account.

#### Returns

`Promise`\<[`CheckoutSelectors`](../interfaces/CheckoutSelectors.md)\>

A promise that resolves to the current state.

#### Remarks

```js
checkoutService.createCustomerAccount({
  email: 'foo@bar.com',
  firstName: 'Foo',
  lastName: 'Bar',
  password: 'password',
  acceptsMarketingEmails: true,
  customFields: [],
});
```
Please note that `createCustomerAccount` is currently in an early stage
of development. Therefore the API is unstable and not ready for public
consumption.

***

### createCustomerAddress()

> **createCustomerAddress**(`customerAddress`, `options?`): `Promise`\<[`CheckoutSelectors`](../interfaces/CheckoutSelectors.md)\>

**`Alpha`**

Creates a customer account address.

#### Parameters

##### customerAddress

[`AddressRequestBody`](../interfaces/AddressRequestBody.md)

The customer account data.

##### options?

[`RequestOptions`](../interfaces/RequestOptions.md)\<`object`\>

Options for creating customer account.

#### Returns

`Promise`\<[`CheckoutSelectors`](../interfaces/CheckoutSelectors.md)\>

A promise that resolves to the current state.

#### Remarks

```js
checkoutService.createCustomerAddress({
  firstName: 'Foo',
  lastName: 'Bar',
  address1: '55 Market St',
  stateOrProvinceCode: 'CA',
  countryCode: 'US',
  postalCode: '90110',
  customFields: [],
});
```
Please note that `createCustomerAccountAddress` is currently in an early stage
of development. Therefore the API is unstable and not ready for public
consumption.

***

### deinitializeCustomer()

> **deinitializeCustomer**(`options?`): `Promise`\<[`CheckoutSelectors`](../interfaces/CheckoutSelectors.md)\>

De-initializes the sign-in step of a checkout process.

It should be called once you no longer want to prompt customers to sign
in. It can perform any necessary clean-up behind the scene, i.e.: remove
DOM nodes or event handlers that are attached as a result of customer
initialization.

```js
await service.deinitializeCustomer({
    methodId: 'amazonpay',
});
```

#### Parameters

##### options?

[`CustomerRequestOptions`](../interfaces/CustomerRequestOptions.md)

Options for deinitializing the customer step of checkout.

#### Returns

`Promise`\<[`CheckoutSelectors`](../interfaces/CheckoutSelectors.md)\>

A promise that resolves to the current state.

***

### deinitializePayment()

> **deinitializePayment**(`options`): `Promise`\<[`CheckoutSelectors`](../interfaces/CheckoutSelectors.md)\>

De-initializes the payment step of a checkout process.

The method should be called once you no longer require a payment method
to be initialized. It can perform any necessary clean-up behind the
scene, i.e.: remove DOM nodes or event handlers that are attached as a
result of payment initialization.

```js
await service.deinitializePayment({
    methodId: 'amazonpay',
});
```

#### Parameters

##### options

[`PaymentRequestOptions`](../interfaces/PaymentRequestOptions.md)

Options for deinitializing the payment step of checkout.

#### Returns

`Promise`\<[`CheckoutSelectors`](../interfaces/CheckoutSelectors.md)\>

A promise that resolves to the current state.

***

### deinitializeShipping()

> **deinitializeShipping**(`options?`): `Promise`\<[`CheckoutSelectors`](../interfaces/CheckoutSelectors.md)\>

De-initializes the shipping step of a checkout process.

It should be called once you no longer need to collect shipping details.
It can perform any necessary clean-up behind the scene, i.e.: remove DOM
nodes or event handlers that are attached as a result of shipping
initialization.

```js
await service.deinitializeShipping({
    methodId: 'amazonpay',
});
```

#### Parameters

##### options?

[`ShippingRequestOptions`](../interfaces/ShippingRequestOptions.md)\<`object`\>

Options for deinitializing the shipping step of checkout.

#### Returns

`Promise`\<[`CheckoutSelectors`](../interfaces/CheckoutSelectors.md)\>

A promise that resolves to the current state.

***

### deleteConsignment()

> **deleteConsignment**(`consignmentId`, `options?`): `Promise`\<[`CheckoutSelectors`](../interfaces/CheckoutSelectors.md)\>

Deletes a consignment

```js
const state = await service.deleteConsignment('55c96cda6f04c');

console.log(state.data.getConsignments());
```

#### Parameters

##### consignmentId

`string`

The ID of the consignment to be deleted

##### options?

[`RequestOptions`](../interfaces/RequestOptions.md)\<`object`\>

Options for the consignment delete request

#### Returns

`Promise`\<[`CheckoutSelectors`](../interfaces/CheckoutSelectors.md)\>

A promise that resolves to the current state.

***

### deleteInstrument()

> **deleteInstrument**(`instrumentId`): `Promise`\<[`CheckoutSelectors`](../interfaces/CheckoutSelectors.md)\>

Deletes a payment instrument by an id.

Once an instrument gets removed, it can no longer be retrieved using
`CheckoutStoreSelector#getInstruments`.

```js
const state = service.deleteInstrument('123');

console.log(state.data.getInstruments());
```

#### Parameters

##### instrumentId

`string`

The identifier of the payment instrument to delete.

#### Returns

`Promise`\<[`CheckoutSelectors`](../interfaces/CheckoutSelectors.md)\>

A promise that resolves to the current state.

***

### executePaymentMethodCheckout()

> **executePaymentMethodCheckout**(`options?`): `Promise`\<[`CheckoutSelectors`](../interfaces/CheckoutSelectors.md)\>

Executes custom checkout of the priority payment method.

Some payment methods, such as Bolt, can use their own checkout
with autofilled customers data, to make checkout passing process
easier and faster for customers with Bolt account.

```js
await service.executePaymentMethodCheckout({
    methodId: 'bolt',
    fallback: () => {},
});
```

#### Parameters

##### options?

[`ExecutePaymentMethodCheckoutOptions`](../interfaces/ExecutePaymentMethodCheckoutOptions.md)

Options for executing payment method checkout.

#### Returns

`Promise`\<[`CheckoutSelectors`](../interfaces/CheckoutSelectors.md)\>

A promise that resolves to the current state.

***

### executeSpamCheck()

> **executeSpamCheck**(): `Promise`\<[`CheckoutSelectors`](../interfaces/CheckoutSelectors.md)\>

Verifies whether the current checkout is created by a human.

Note: this method will do the initialization, therefore you do not
need to call `CheckoutService#initializeSpamProtection`
before calling this method.

With spam protection enabled, the customer has to be verified as
a human. The order creation will fail if spam protection
is enabled but verification fails. You should call this method before
`submitOrder` method is called (i.e.: when the shopper
first gets to the payment step).

**Note**: You need to enable Google ReCAPTCHA bot protection in your Checkout Settings.

```js
await service.executeSpamCheck();
```

#### Returns

`Promise`\<[`CheckoutSelectors`](../interfaces/CheckoutSelectors.md)\>

A promise that resolves to the current state.

***

### finalizeOrderIfNeeded()

> **finalizeOrderIfNeeded**(`options?`): `Promise`\<[`CheckoutSelectors`](../interfaces/CheckoutSelectors.md)\>

Finalizes the submission process for an order.

This method is only required for certain hosted payment methods that
require a customer to enter their credit card details on their website.
You need to call this method once the customer has redirected back to
checkout in order to complete the checkout process.

If the method is called before order finalization is required or for a
payment method that does not require order finalization, an error will be
thrown. Conversely, if the method is called successfully, you should
immediately redirect the customer to the order confirmation page.

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

#### Parameters

##### options?

[`OrderFinalizeOptions`](../interfaces/OrderFinalizeOptions.md)

Options for finalizing the current order.

#### Returns

`Promise`\<[`CheckoutSelectors`](../interfaces/CheckoutSelectors.md)\>

A promise that resolves to the current state.

#### Throws

`OrderFinalizationNotRequiredError` error if order finalization
is not required for the current order at the time of execution.

***

### getB2BToken()

> **getB2BToken**(`options?`): `Promise`\<[`CheckoutSelectors`](../interfaces/CheckoutSelectors.md)\>

Retrieves a B2B authentication token for the current customer.

The token can be used to authenticate requests to B2B REST and GraphQL
endpoints. The customer must be signed in for this method to succeed.
The B2B base URL and client ID are read from the checkout settings config.

```js
const state = await service.getB2BToken();

console.log(state.data.getB2BToken());
```

#### Parameters

##### options?

[`RequestOptions`](../interfaces/RequestOptions.md)\<`object`\>

Options for the request.

#### Returns

`Promise`\<[`CheckoutSelectors`](../interfaces/CheckoutSelectors.md)\>

A promise that resolves to the current state.

***

### getState()

> **getState**(): [`CheckoutSelectors`](../interfaces/CheckoutSelectors.md)

Returns a snapshot of the current checkout state.

The method returns a new instance every time there is a change in the
checkout state. You can query the state by calling any of its getter
methods.

```js
const state = service.getState();

console.log(state.data.getOrder());
console.log(state.errors.getSubmitOrderError());
console.log(state.statuses.isSubmittingOrder());
```

#### Returns

[`CheckoutSelectors`](../interfaces/CheckoutSelectors.md)

The current customer's checkout state

***

### handleExtensionCommand()

> **handleExtensionCommand**\<`T`\>(`extensionId`, `command`, `handler`): () => `void`

**`Alpha`**

Manages the command handler for an extension.

#### Type Parameters

##### T

`T` *extends* keyof [`ExtensionCommandMap`](../interfaces/ExtensionCommandMap.md)

#### Parameters

##### extensionId

`string`

The ID of the extension sending the command.

##### command

`T`

The command to be handled.

##### handler

(`command`) => `void` \| `Promise`\<`void`\>

The handler function for the extension command.

#### Returns

A function that, when called, will deregister the command handler.

() => `void`

***

### handleExtensionQuery()

> **handleExtensionQuery**\<`T`\>(`extensionId`, `query`, `handler`): () => `void`

**`Alpha`**

Manages the query handler for an extension.

#### Type Parameters

##### T

`T` *extends* [`GetConsignments`](../enumerations/ExtensionQueryType.md#getconsignments)

#### Parameters

##### extensionId

`string`

The ID of the extension sending the query.

##### query

`T`

The query to be handled.

##### handler

(`command`) => `void` \| `Promise`\<`void`\>

The handler function for the extension query.

#### Returns

A function that, when called, will deregister the query handler.

() => `void`

***

### hydrateInitialState()

> **hydrateInitialState**(`state`): `Promise`\<[`CheckoutSelectors`](../interfaces/CheckoutSelectors.md)\>

**`Alpha`**

Hydrates the checkout service with an initial state.

The initial state can contain various checkout data such as cart items,
customer information, and other relevant state.

```js
const initialState = {
    // ... initial checkout state data
};

const state = await service.hydrateInitialState(initialState);

console.log(state.data.getCheckout());
```

#### Parameters

##### state

[`CheckoutInitialState`](../interfaces/CheckoutInitialState.md)

The initial state data to hydrate the checkout service with.

#### Returns

`Promise`\<[`CheckoutSelectors`](../interfaces/CheckoutSelectors.md)\>

A promise that resolves to the current state after hydration.

***

### initializeCustomer()

> **initializeCustomer**(`options?`): `Promise`\<[`CheckoutSelectors`](../interfaces/CheckoutSelectors.md)\>

Initializes the sign-in step of a checkout process.

Some payment methods, such as Amazon Pay, have their own sign-in flow. In
order to support them, this method must be called.

```js
await service.initializeCustomer({
    methodId: 'amazonpay',
    amazonpay: {
        container: 'signInButton',
    },
});
```

#### Parameters

##### options?

[`CustomerInitializeOptions`](../type-aliases/CustomerInitializeOptions.md)

Options for initializing the customer step of checkout.

#### Returns

`Promise`\<[`CheckoutSelectors`](../interfaces/CheckoutSelectors.md)\>

A promise that resolves to the current state.

***

### initializePayment()

> **initializePayment**(`options`): `Promise`\<[`CheckoutSelectors`](../interfaces/CheckoutSelectors.md)\>

Initializes the payment step of a checkout process.

Before a payment method can accept payment details, it must first be
initialized. Some payment methods require you to provide additional
initialization options. For example, you can provide an element ID for
Amazon Pay if you want users to be able to select a different payment
method by clicking on the element.

```js
await service.initializePayment({
    methodId: 'amazonpay',
    amazonpay: {
        editButtonId: 'edit-button',
    },
});
```

#### Parameters

##### options

[`PaymentInitializeOptions`](../type-aliases/PaymentInitializeOptions.md)

Options for initializing the payment step of checkout.

#### Returns

`Promise`\<[`CheckoutSelectors`](../interfaces/CheckoutSelectors.md)\>

A promise that resolves to the current state.

***

### initializeShipping()

> **initializeShipping**(`options?`): `Promise`\<[`CheckoutSelectors`](../interfaces/CheckoutSelectors.md)\>

Initializes the shipping step of a checkout process.

Some payment methods, such as Amazon Pay, can provide shipping
information to be used for checkout. In order to support them, this
method must be called.

```js
await service.initializeShipping({
    methodId: 'amazonpay',
    amazonpay: {
        editAddressButtonId: 'changeAddressButton',
    },
});
```

#### Parameters

##### options?

[`ShippingInitializeOptions`](../interfaces/ShippingInitializeOptions.md)\<`object`\>

Options for initializing the shipping step of checkout.

#### Returns

`Promise`\<[`CheckoutSelectors`](../interfaces/CheckoutSelectors.md)\>

A promise that resolves to the current state.

***

### ~~initializeSpamProtection()~~

> **initializeSpamProtection**(`options`): `Promise`\<[`CheckoutSelectors`](../interfaces/CheckoutSelectors.md)\>

Initializes the spam protection for order creation.

Note: Use `CheckoutService#executeSpamCheck` instead.
You do not need to call this method before calling
`CheckoutService#executeSpamCheck`.

With spam protection enabled, the customer has to be verified as
a human. The order creation will fail if spam protection
is enabled but verification fails.

```js
await service.initializeSpamProtection();
```

#### Parameters

##### options

[`SpamProtectionOptions`](../interfaces/SpamProtectionOptions.md)

Options for initializing spam protection.

#### Returns

`Promise`\<[`CheckoutSelectors`](../interfaces/CheckoutSelectors.md)\>

A promise that resolves to the current state.

#### Deprecated

- Use CheckoutService#executeSpamCheck instead.

***

### loadBillingAddressFields()

> **loadBillingAddressFields**(`options?`): `Promise`\<[`CheckoutSelectors`](../interfaces/CheckoutSelectors.md)\>

Loads a set of form fields that should be presented to customers in order
to capture their billing address.

Once the method has been executed successfully, you can call
`CheckoutStoreSelector#getBillingAddressFields` to retrieve the set of
form fields.

```js
const state = service.loadBillingAddressFields();

console.log(state.data.getBillingAddressFields('US'));
```

#### Parameters

##### options?

[`RequestOptions`](../interfaces/RequestOptions.md)\<`object`\>

Options for loading the billing address form fields.

#### Returns

`Promise`\<[`CheckoutSelectors`](../interfaces/CheckoutSelectors.md)\>

A promise that resolves to the current state.

***

### loadBillingCountries()

> **loadBillingCountries**(`options?`): `Promise`\<[`CheckoutSelectors`](../interfaces/CheckoutSelectors.md)\>

Loads a list of countries available for billing.

Once you make a successful request, you will be able to retrieve the list
of countries by calling `CheckoutStoreSelector#getBillingCountries`.

```js
const state = await service.loadBillingCountries();

console.log(state.data.getBillingCountries());
```

#### Parameters

##### options?

[`RequestOptions`](../interfaces/RequestOptions.md)\<`object`\>

Options for loading the available billing countries.

#### Returns

`Promise`\<[`CheckoutSelectors`](../interfaces/CheckoutSelectors.md)\>

A promise that resolves to the current state.

***

### loadCheckout()

> **loadCheckout**(`id?`, `options?`): `Promise`\<[`CheckoutSelectors`](../interfaces/CheckoutSelectors.md)\>

Loads the current checkout.

This method can only be called if there is an active checkout. Also, it
can only retrieve data that belongs to the current customer. When it is
successfully executed, you can retrieve the data by calling
`CheckoutStoreSelector#getCheckout`.

```js
const state = await service.loadCheckout('0cfd6c06-57c3-4e29-8d7a-de55cc8a9052');

console.log(state.data.getCheckout());
```

#### Parameters

##### id?

`string`

The identifier of the checkout to load, or the default checkout if not provided.

##### options?

[`RequestOptions`](../interfaces/RequestOptions.md)\<[`CheckoutParams`](../interfaces/CheckoutParams.md)\>

Options for loading the current checkout.

#### Returns

`Promise`\<[`CheckoutSelectors`](../interfaces/CheckoutSelectors.md)\>

A promise that resolves to the current state.

***

### loadExtensions()

> **loadExtensions**(`options?`): `Promise`\<[`CheckoutSelectors`](../interfaces/CheckoutSelectors.md)\>

**`Alpha`**

Loads a list of extensions available for checkout.

```js
const state = await service.loadExtensions();

console.log(state.data.getExtensions());
```

#### Parameters

##### options?

[`RequestOptions`](../interfaces/RequestOptions.md)\<`object`\>

Options for loading the extensions that are
available to the current customer.

#### Returns

`Promise`\<[`CheckoutSelectors`](../interfaces/CheckoutSelectors.md)\>

A promise that resolves to the current state.

***

### loadInstruments()

> **loadInstruments**(): `Promise`\<[`CheckoutSelectors`](../interfaces/CheckoutSelectors.md)\>

Loads a list of payment instruments associated with a customer.

Once the method has been called successfully, you can retrieve the list
of payment instruments by calling `CheckoutStoreSelector#getInstruments`.
If the customer does not have any payment instruments on record, i.e.:
credit card, you will get an empty list instead.

```js
const state = service.loadInstruments();

console.log(state.data.getInstruments());
```

#### Returns

`Promise`\<[`CheckoutSelectors`](../interfaces/CheckoutSelectors.md)\>

A promise that resolves to the current state.

***

### loadOrder()

> **loadOrder**(`orderId`, `options?`): `Promise`\<[`CheckoutSelectors`](../interfaces/CheckoutSelectors.md)\>

Loads an order by an id.

The method can only retrieve an order if the order belongs to the current
customer. If it is successfully executed, the data can be retrieved by
calling `CheckoutStoreSelector#getOrder`.

```js
const state = await service.loadOrder(123);

console.log(state.data.getOrder());
```

#### Parameters

##### orderId

`number`

The identifier of the order to load.

##### options?

[`RequestOptions`](../interfaces/RequestOptions.md)\<`object`\>

Options for loading the order.

#### Returns

`Promise`\<[`CheckoutSelectors`](../interfaces/CheckoutSelectors.md)\>

A promise that resolves to the current state.

***

### loadPaymentMethodByIds()

> **loadPaymentMethodByIds**(`methodIds`, `options?`): `Promise`\<[`CheckoutSelectors`](../interfaces/CheckoutSelectors.md)\>

Loads a list of payment methods for given ids.

Once the method is executed successfully, you can call
`CheckoutStoreSelector#getPaymentMethods` to retrieve the list of payment
methods.

```js
const state = service.loadPaymentMethodsById(['applepay']);

console.log(state.data.getPaymentMethodOrThrow('applepay'));
```

#### Parameters

##### methodIds

`string`[]

The identifier for the payment methods to load.

##### options?

[`RequestOptions`](../interfaces/RequestOptions.md)\<`object`\>

Options for loading the payment methods that are
available to the current customer.

#### Returns

`Promise`\<[`CheckoutSelectors`](../interfaces/CheckoutSelectors.md)\>

A promise that resolves to the current state.

***

### loadPaymentMethods()

> **loadPaymentMethods**(`options?`): `Promise`\<[`CheckoutSelectors`](../interfaces/CheckoutSelectors.md)\>

Loads a list of payment methods available for checkout.

If a customer enters their payment details before navigating to the
checkout page (i.e.: using PayPal checkout button on the cart page), only
one payment method will be available for the customer - the selected
payment method. Otherwise, by default, all payment methods configured by
the merchant will be available for the customer.

Once the method is executed successfully, you can call
`CheckoutStoreSelector#getPaymentMethods` to retrieve the list of payment
methods.

```js
const state = service.loadPaymentMethods();

console.log(state.data.getPaymentMethods());
```

#### Parameters

##### options?

[`RequestOptions`](../interfaces/RequestOptions.md)\<`object`\>

Options for loading the payment methods that are
available to the current customer.

#### Returns

`Promise`\<[`CheckoutSelectors`](../interfaces/CheckoutSelectors.md)\>

A promise that resolves to the current state.

***

### loadPickupOptions()

> **loadPickupOptions**(`query`): `Promise`\<[`CheckoutSelectors`](../interfaces/CheckoutSelectors.md)\>

**`Alpha`**

Loads a list of pickup options for a given criteria.

```js
const consignmentId = '1';
const searchArea = {
    radius: {
        value: 1.4,
        unit: 'KM'
    },
    coordinates: {
        latitude: 1.4,
        longitude: 0
    },
};
const state = await service.loadPickupOptions({ consignmentId, searchArea });

console.log(state.data.getPickupOptions(consignmentId, searchArea));
```

#### Parameters

##### query

[`PickupOptionRequestBody`](../interfaces/PickupOptionRequestBody.md)

Options for loading the available shipping countries.

#### Returns

`Promise`\<[`CheckoutSelectors`](../interfaces/CheckoutSelectors.md)\>

A promise that resolves to the current state.

***

### loadShippingAddressFields()

> **loadShippingAddressFields**(`options?`): `Promise`\<[`CheckoutSelectors`](../interfaces/CheckoutSelectors.md)\>

Loads a set of form fields that should be presented to customers in order
to capture their shipping address.

Once the method has been executed successfully, you can call
`CheckoutStoreSelector#getShippingAddressFields` to retrieve the set of
form fields.

```js
const state = service.loadShippingAddressFields();

console.log(state.data.getShippingAddressFields('US'));
```

#### Parameters

##### options?

[`RequestOptions`](../interfaces/RequestOptions.md)\<`object`\>

Options for loading the shipping address form fields.

#### Returns

`Promise`\<[`CheckoutSelectors`](../interfaces/CheckoutSelectors.md)\>

A promise that resolves to the current state.

***

### loadShippingCountries()

> **loadShippingCountries**(`options?`): `Promise`\<[`CheckoutSelectors`](../interfaces/CheckoutSelectors.md)\>

Loads a list of countries available for shipping.

The list is determined based on the shipping zones configured by a
merchant. Once you make a successful call, you will be able to retrieve
the list of available shipping countries by calling
`CheckoutStoreSelector#getShippingCountries`.

```js
const state = await service.loadShippingCountries();

console.log(state.data.getShippingCountries());
```

#### Parameters

##### options?

[`RequestOptions`](../interfaces/RequestOptions.md)\<`object`\>

Options for loading the available shipping countries.

#### Returns

`Promise`\<[`CheckoutSelectors`](../interfaces/CheckoutSelectors.md)\>

A promise that resolves to the current state.

***

### loadShippingOptions()

> **loadShippingOptions**(`options?`): `Promise`\<[`CheckoutSelectors`](../interfaces/CheckoutSelectors.md)\>

Loads a list of shipping options available for checkout.

Available shipping options can only be determined once a customer
provides their shipping address. If the method is executed successfully,
`CheckoutStoreSelector#getShippingOptions` can be called to retrieve the
list of shipping options.

```js
const state = await service.loadShippingOptions();

console.log(state.data.getShippingOptions());
```

#### Parameters

##### options?

[`RequestOptions`](../interfaces/RequestOptions.md)\<`object`\>

Options for loading the available shipping options.

#### Returns

`Promise`\<[`CheckoutSelectors`](../interfaces/CheckoutSelectors.md)\>

A promise that resolves to the current state.

***

### notifyState()

> **notifyState**(): `void`

Notifies all subscribers with the current state.

When this method gets called, the subscribers get called regardless if
they have any filters applied.

#### Returns

`void`

***

### persistB2BMetadata()

> **persistB2BMetadata**(`PersistB2BMetadataOptions`): `Promise`\<[`CheckoutSelectors`](../interfaces/CheckoutSelectors.md)\>

Persists B2B order metadata (e.g. invoice comment) after an order is placed

```js
const state = await service.persistB2BMetadata(comment);
```

#### Parameters

##### PersistB2BMetadataOptions

[`PersistB2BMetadataOptions`](../interfaces/PersistB2BMetadataOptions.md)

Passing an object to prepare the payload for the request.

#### Returns

`Promise`\<[`CheckoutSelectors`](../interfaces/CheckoutSelectors.md)\>

A promise that resolves to the current state.

***

### postMessageToExtension()

> **postMessageToExtension**(`extensionId`, `message`): `void`

**`Alpha`**

Posts a message to a checkout extension.

#### Parameters

##### extensionId

`string`

The ID of an extension to post the event to.

##### message

[`ExtensionMessage`](../type-aliases/ExtensionMessage.md)

The message to post to an extension.

#### Returns

`void`

***

### refreshB2BPaymentMethods()

> **refreshB2BPaymentMethods**(`options?`): `Promise`\<[`CheckoutSelectors`](../interfaces/CheckoutSelectors.md)\>

Refreshes the B2B payment methods cache for the current customer.

```js
await service.refreshB2BPaymentMethods();
```

#### Parameters

##### options?

[`RequestOptions`](../interfaces/RequestOptions.md)\<`object`\>

Options for the request.

#### Returns

`Promise`\<[`CheckoutSelectors`](../interfaces/CheckoutSelectors.md)\>

A promise that resolves to the current state.

***

### removeCoupon()

> **removeCoupon**(`code`, `options?`): `Promise`\<[`CheckoutSelectors`](../interfaces/CheckoutSelectors.md)\>

Removes a coupon code from the current checkout.

Once the coupon code gets removed, the quote for the current checkout will
be adjusted accordingly.

```js
await service.removeCoupon('COUPON');
```

#### Parameters

##### code

`string`

The coupon code to remove from the current checkout.

##### options?

[`RequestOptions`](../interfaces/RequestOptions.md)\<`object`\>

Options for removing the coupon code.

#### Returns

`Promise`\<[`CheckoutSelectors`](../interfaces/CheckoutSelectors.md)\>

A promise that resolves to the current state.

***

### removeGiftCertificate()

> **removeGiftCertificate**(`code`, `options?`): `Promise`\<[`CheckoutSelectors`](../interfaces/CheckoutSelectors.md)\>

Removes a gift certificate from an order.

Once the gift certificate gets removed, the quote for the current
checkout will be adjusted accordingly.

```js
await service.removeGiftCertificate('GIFT_CERTIFICATE');
```

#### Parameters

##### code

`string`

The gift certificate to remove from the current checkout.

##### options?

[`RequestOptions`](../interfaces/RequestOptions.md)\<`object`\>

Options for removing the gift certificate.

#### Returns

`Promise`\<[`CheckoutSelectors`](../interfaces/CheckoutSelectors.md)\>

A promise that resolves to the current state.

***

### renderExtension()

> **renderExtension**(`container`, `region`): `Promise`\<[`CheckoutSelectors`](../interfaces/CheckoutSelectors.md)\>

**`Alpha`**

Renders an extension for a checkout extension region.
Currently, only one extension is allowed per region.

#### Parameters

##### container

`string`

The ID of a container which the extension should be inserted.

##### region

[`ExtensionRegion`](../enumerations/ExtensionRegion.md)

The name of an area where the extension should be presented.

#### Returns

`Promise`\<[`CheckoutSelectors`](../interfaces/CheckoutSelectors.md)\>

A promise that resolves to the current state.

***

### selectConsignmentShippingOption()

> **selectConsignmentShippingOption**(`consignmentId`, `shippingOptionId`, `options?`): `Promise`\<[`CheckoutSelectors`](../interfaces/CheckoutSelectors.md)\>

Selects a shipping option for a given consignment.

Note: this is used when items need to be shipped to multiple addresses,
for single shipping address, use `CheckoutService#updateShippingAddress`.

If a shipping option has an additional cost, the quote for the current
order will be adjusted once the option is selected.

```js
const state = await service.selectConsignmentShippingOption(consignmentId, optionId);

console.log(state.data.getConsignments());
```

#### Parameters

##### consignmentId

`string`

The identified of the consignment to be updated.

##### shippingOptionId

`string`

The identifier of the shipping option to
select.

##### options?

[`ShippingRequestOptions`](../interfaces/ShippingRequestOptions.md)\<`object`\>

Options for selecting the shipping option.

#### Returns

`Promise`\<[`CheckoutSelectors`](../interfaces/CheckoutSelectors.md)\>

A promise that resolves to the current state.

***

### selectShippingOption()

> **selectShippingOption**(`shippingOptionId`, `options?`): `Promise`\<[`CheckoutSelectors`](../interfaces/CheckoutSelectors.md)\>

Selects a shipping option for the current address.

If a shipping option has an additional cost, the quote for the current
order will be adjusted once the option is selected.

```js
const state = await service.selectShippingOption('address-id', 'shipping-option-id');

console.log(state.data.getSelectedShippingOption());
```

#### Parameters

##### shippingOptionId

`string`

The identifier of the shipping option to
select.

##### options?

[`ShippingRequestOptions`](../interfaces/ShippingRequestOptions.md)\<`object`\>

Options for selecting the shipping option.

#### Returns

`Promise`\<[`CheckoutSelectors`](../interfaces/CheckoutSelectors.md)\>

A promise that resolves to the current state.

***

### sendSignInEmail()

> **sendSignInEmail**(`signInEmailRequest`, `options?`): `Promise`\<[`CheckoutSelectors`](../interfaces/CheckoutSelectors.md)\>

Sends a email that contains a single-use sign-in link. When a valid links is clicked,
signs in the customer without requiring any password, redirecting them to the account page if no redirectUrl is provided.

```js
checkoutService.sendSignInEmail({ email: 'foo@bar.com', redirectUrl: 'checkout' });
```

#### Parameters

##### signInEmailRequest

[`SignInEmailRequestBody`](../interfaces/SignInEmailRequestBody.md)

The sign-in email request values.

##### options?

[`RequestOptions`](../interfaces/RequestOptions.md)\<`object`\>

Options for the send email request.

#### Returns

`Promise`\<[`CheckoutSelectors`](../interfaces/CheckoutSelectors.md)\>

A promise that resolves to the current state.

***

### signInCustomer()

> **signInCustomer**(`credentials`, `options?`): `Promise`\<[`CheckoutSelectors`](../interfaces/CheckoutSelectors.md)\>

Signs into a customer's registered account.

Once the customer is signed in successfully, the checkout state will be
populated with information associated with the customer, such as their
saved addresses. You can call `CheckoutStoreSelector#getCustomer` to
retrieve the data.

```js
const state = await service.signInCustomer({
    email: 'foo@bar.com',
    password: 'password123',
});

console.log(state.data.getCustomer());
```

#### Parameters

##### credentials

[`CustomerCredentials`](../interfaces/CustomerCredentials.md)

The credentials to be used for signing in the customer.

##### options?

[`CustomerRequestOptions`](../interfaces/CustomerRequestOptions.md)

Options for signing in the customer.

#### Returns

`Promise`\<[`CheckoutSelectors`](../interfaces/CheckoutSelectors.md)\>

A promise that resolves to the current state.

***

### signOutCustomer()

> **signOutCustomer**(`options?`): `Promise`\<[`CheckoutSelectors`](../interfaces/CheckoutSelectors.md)\>

Signs out the current customer if they are previously signed in.

Once the customer is successfully signed out, the checkout state will be
reset automatically.

```js
const state = await service.signOutCustomer();

// The returned object should not contain information about the previously signed-in customer.
console.log(state.data.getCustomer());
```

When a store has "Allow customers to access their cart across multiple devices" enabled, signing out
will remove the cart/checkout data from the current session. An error with type="checkout_not_available" will be thrown.

```js
try {
  await service.signOutCustomer();
} catch (error) {
  if (error.type === 'checkout_not_available') {
    window.top.location.assign('/');
  }
}
```

#### Parameters

##### options?

[`CustomerRequestOptions`](../interfaces/CustomerRequestOptions.md)

Options for signing out the customer.

#### Returns

`Promise`\<[`CheckoutSelectors`](../interfaces/CheckoutSelectors.md)\>

A promise that resolves to the current state.

***

### submitOrder()

> **submitOrder**(`payload`, `options?`): `Promise`\<[`CheckoutSelectors`](../interfaces/CheckoutSelectors.md)\>

Submits an order, thereby completing a checkout process.

Before you can submit an order, you must initialize the payment method
chosen by the customer by calling `CheckoutService#initializePayment`.

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

You are not required to include `paymentData` if the order does not
require additional payment details. For example, the customer has already
entered their payment details on the cart page using one of the hosted
payment methods, such as PayPal. Or the customer has applied a gift
certificate that exceeds the grand total amount.

If the order is submitted successfully, you can retrieve the newly
created order by calling `CheckoutStoreSelector#getOrder`.

```js
const state = await service.submitOrder(payload);

console.log(state.data.getOrder());
```

#### Parameters

##### payload

[`OrderRequestBody`](../interfaces/OrderRequestBody.md)

The request payload to submit for the current order.

##### options?

[`RequestOptions`](../interfaces/RequestOptions.md)\<`object`\>

Options for submitting the current order.

#### Returns

`Promise`\<[`CheckoutSelectors`](../interfaces/CheckoutSelectors.md)\>

A promise that resolves to the current state.

***

### subscribe()

> **subscribe**(`subscriber`, ...`filters`): () => `void`

Subscribes to any changes to the current state.

The method registers a callback function and executes it every time there
is a change in the checkout state.

```js
service.subscribe(state => {
    console.log(state.data.getCart());
});
```

The method can be configured to notify subscribers only regarding
relevant changes, by providing a filter function.

```js
const filter = state => state.data.getCart();

// Only trigger the subscriber when the cart changes.
service.subscribe(state => {
    console.log(state.data.getCart())
}, filter);
```

#### Parameters

##### subscriber

(`state`) => `void`

The function to subscribe to state changes.

##### filters

...(`state`) => `any`[]

One or more functions to filter out irrelevant state
changes. If more than one function is provided, the subscriber will only
be triggered if all conditions are met.

#### Returns

A function, if called, will unsubscribe the subscriber.

() => `void`

***

### unassignItemsToAddress()

> **unassignItemsToAddress**(`consignment`, `options?`): `Promise`\<[`CheckoutSelectors`](../interfaces/CheckoutSelectors.md)\>

Convenience method that unassigns items from a specific shipping address.

Note: this method finds an existing consignment that matches the provided address
and unassigns the specified items. If the consignment ends up with no line items
after the unassignment, it will be deleted.

#### Parameters

##### consignment

[`ConsignmentAssignmentRequestBody`](../type-aliases/ConsignmentAssignmentRequestBody.md)

The consignment data that will be used.

##### options?

[`RequestOptions`](../interfaces/RequestOptions.md)\<`object`\>

Options for the request

#### Returns

`Promise`\<[`CheckoutSelectors`](../interfaces/CheckoutSelectors.md)\>

A promise that resolves to the current state.

***

### updateBillingAddress()

> **updateBillingAddress**(`address`, `options?`): `Promise`\<[`CheckoutSelectors`](../interfaces/CheckoutSelectors.md)\>

Updates the billing address for the current checkout.

A customer must provide their billing address before they can proceed to
pay for their order.

You can submit an address that is partially complete. The address does
not get validated until you submit the order.

```js
const state = await service.updateBillingAddress(address);

console.log(state.data.getBillingAddress());
```

#### Parameters

##### address

`Partial`\<[`BillingAddressRequestBody`](../interfaces/BillingAddressRequestBody.md)\>

The address to be used for billing.

##### options?

[`RequestOptions`](../interfaces/RequestOptions.md)\<`object`\>

Options for updating the billing address.

#### Returns

`Promise`\<[`CheckoutSelectors`](../interfaces/CheckoutSelectors.md)\>

A promise that resolves to the current state.

***

### updateCheckout()

> **updateCheckout**(`payload`, `options?`): `Promise`\<[`CheckoutSelectors`](../interfaces/CheckoutSelectors.md)\>

Updates specific properties of the current checkout.

```js
const state = await service.updateCheckout(checkout);

console.log(state.data.getCheckout());
```

#### Parameters

##### payload

[`CheckoutRequestBody`](../interfaces/CheckoutRequestBody.md)

The checkout properties to be updated.

##### options?

[`RequestOptions`](../interfaces/RequestOptions.md)\<`object`\>

Options for loading the current checkout.

#### Returns

`Promise`\<[`CheckoutSelectors`](../interfaces/CheckoutSelectors.md)\>

A promise that resolves to the current state.

***

### updateConsignment()

> **updateConsignment**(`consignment`, `options?`): `Promise`\<[`CheckoutSelectors`](../interfaces/CheckoutSelectors.md)\>

Updates a specific consignment.

Note: this is used when items need to be shipped to multiple addresses,
for single shipping address, use `CheckoutService#selectShippingOption`.

When a shipping address for a consignment is updated, an updated list of
shipping options will become available for the consignment, unless no
options are available. If the update is successful, you can call
`CheckoutStoreSelector#getConsignments` to retrieve updated list of
consignments.

Beware that if the updated consignment includes all line items from another
consignment, that consignment will be deleted as a valid consignment must
include at least one valid line item.

If the shipping address changes and the selected shipping option becomes
unavailable for the updated address, the shipping option will be
deselected.

You can submit an address that is partially complete. The address does
not get validated until you submit the order.

```js
const state = await service.updateConsignment(consignment);

console.log(state.data.getConsignments());
```

#### Parameters

##### consignment

[`ConsignmentUpdateRequestBody`](../interfaces/ConsignmentUpdateRequestBody.md)

The consignment data that will be used.

##### options?

[`RequestOptions`](../interfaces/RequestOptions.md)\<`object`\>

Options for updating the shipping address.

#### Returns

`Promise`\<[`CheckoutSelectors`](../interfaces/CheckoutSelectors.md)\>

A promise that resolves to the current state.

***

### updateShippingAddress()

> **updateShippingAddress**(`address`, `options?`): `Promise`\<[`CheckoutSelectors`](../interfaces/CheckoutSelectors.md)\>

Updates the shipping address for the current checkout.

When a customer updates their shipping address for an order, they will
see an updated list of shipping options and the cost for each option,
unless no options are available. If the update is successful, you can
call `CheckoutStoreSelector#getShippingAddress` to retrieve the address.

If the shipping address changes and the selected shipping option becomes
unavailable for the updated address, the shipping option will be
deselected.

You can submit an address that is partially complete. The address does
not get validated until you submit the order.

```js
const state = await service.updateShippingAddress(address);

console.log(state.data.getShippingAddress());
```

#### Parameters

##### address

`Partial`\<[`AddressRequestBody`](../interfaces/AddressRequestBody.md)\>

The address to be used for shipping.

##### options?

[`ShippingRequestOptions`](../interfaces/ShippingRequestOptions.md)\<[`CheckoutParams`](../interfaces/CheckoutParams.md)\>

Options for updating the shipping address.

#### Returns

`Promise`\<[`CheckoutSelectors`](../interfaces/CheckoutSelectors.md)\>

A promise that resolves to the current state.

***

### updateSubscriptions()

> **updateSubscriptions**(`subscriptions`, `options?`): `Promise`\<[`CheckoutSelectors`](../interfaces/CheckoutSelectors.md)\>

Updates the subscriptions associated to an email.

#### Parameters

##### subscriptions

[`Subscriptions`](../interfaces/Subscriptions.md)

The email and associated subscriptions to update.

##### options?

[`RequestOptions`](../interfaces/RequestOptions.md)\<`object`\>

Options for continuing as a guest.

#### Returns

`Promise`\<[`CheckoutSelectors`](../interfaces/CheckoutSelectors.md)\>

A promise that resolves to the current state.
