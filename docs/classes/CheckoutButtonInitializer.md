[@bigcommerce/checkout-sdk](../README.md) / CheckoutButtonInitializer

# Class: CheckoutButtonInitializer

## Table of contents

### Constructors

- [constructor](CheckoutButtonInitializer.md#constructor)

### Methods

- [deinitializeButton](CheckoutButtonInitializer.md#deinitializebutton)
- [getState](CheckoutButtonInitializer.md#getstate)
- [initializeButton](CheckoutButtonInitializer.md#initializebutton)
- [subscribe](CheckoutButtonInitializer.md#subscribe)

## Constructors

### constructor

• **new CheckoutButtonInitializer**()

## Methods

### deinitializeButton

▸ **deinitializeButton**(`options`): `Promise`<[`CheckoutButtonSelectors`](../interfaces/CheckoutButtonSelectors.md)\>

De-initializes the checkout button by performing any necessary clean-ups.

```js
await service.deinitializeButton({
    methodId: 'braintreepaypal',
});
```

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `options` | [`CheckoutButtonOptions`](../interfaces/CheckoutButtonOptions.md) | Options for deinitializing the checkout button. |

#### Returns

`Promise`<[`CheckoutButtonSelectors`](../interfaces/CheckoutButtonSelectors.md)\>

A promise that resolves to the current state.

___

### getState

▸ **getState**(): [`CheckoutButtonSelectors`](../interfaces/CheckoutButtonSelectors.md)

Returns a snapshot of the current state.

The method returns a new instance every time there is a change in the
state. You can query the state by calling any of its getter methods.

```js
const state = service.getState();

console.log(state.errors.getInitializeButtonError());
console.log(state.statuses.isInitializingButton());
```

#### Returns

[`CheckoutButtonSelectors`](../interfaces/CheckoutButtonSelectors.md)

The current customer's checkout state

___

### initializeButton

▸ **initializeButton**(`options`): `Promise`<[`CheckoutButtonSelectors`](../interfaces/CheckoutButtonSelectors.md)\>

Initializes the checkout button of a payment method.

When the checkout button is initialized, it will be inserted into the DOM,
ready to be interacted with by the customer.

```js
initializer.initializeButton({
    methodId: 'braintreepaypal',
    containerId: 'checkoutButton',
    braintreepaypal: {
    },
});
```

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `options` | [`CheckoutButtonInitializeOptions`](../README.md#checkoutbuttoninitializeoptions) | Options for initializing the checkout button. |

#### Returns

`Promise`<[`CheckoutButtonSelectors`](../interfaces/CheckoutButtonSelectors.md)\>

A promise that resolves to the current state.

___

### subscribe

▸ **subscribe**(`subscriber`, ...`filters`): () => `void`

Subscribes to any changes to the current state.

The method registers a callback function and executes it every time there
is a change in the current state.

```js
service.subscribe(state => {
    console.log(state.statuses.isInitializingButton());
});
```

The method can be configured to notify subscribers only regarding
relevant changes, by providing a filter function.

```js
const filter = state => state.errors.getInitializeButtonError();

// Only trigger the subscriber when the cart changes.
service.subscribe(state => {
    console.log(state.errors.getInitializeButtonError())
}, filter);
```

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `subscriber` | (`state`: [`CheckoutButtonSelectors`](../interfaces/CheckoutButtonSelectors.md)) => `void` | The function to subscribe to state changes. |
| `...filters` | (`state`: [`CheckoutButtonSelectors`](../interfaces/CheckoutButtonSelectors.md)) => `any`[] | One or more functions to filter out irrelevant state changes. If more than one function is provided, the subscriber will only be triggered if all conditions are met. |

#### Returns

`fn`

A function, if called, will unsubscribe the subscriber.

▸ (): `void`

Subscribes to any changes to the current state.

The method registers a callback function and executes it every time there
is a change in the current state.

```js
service.subscribe(state => {
    console.log(state.statuses.isInitializingButton());
});
```

The method can be configured to notify subscribers only regarding
relevant changes, by providing a filter function.

```js
const filter = state => state.errors.getInitializeButtonError();

// Only trigger the subscriber when the cart changes.
service.subscribe(state => {
    console.log(state.errors.getInitializeButtonError())
}, filter);
```

##### Returns

`void`

A function, if called, will unsubscribe the subscriber.
