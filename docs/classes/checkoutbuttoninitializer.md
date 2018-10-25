[@bigcommerce/checkout-sdk](../README.md) > [CheckoutButtonInitializer](../classes/checkoutbuttoninitializer.md)

# CheckoutButtonInitializer

## Hierarchy

**CheckoutButtonInitializer**

## Index

### Methods

* [deinitializeButton](checkoutbuttoninitializer.md#deinitializebutton)
* [getState](checkoutbuttoninitializer.md#getstate)
* [initializeButton](checkoutbuttoninitializer.md#initializebutton)
* [subscribe](checkoutbuttoninitializer.md#subscribe)

---

## Methods

<a id="deinitializebutton"></a>

###  deinitializeButton

▸ **deinitializeButton**(options: *[CheckoutButtonOptions](../interfaces/checkoutbuttonoptions.md)*): `Promise`<[CheckoutButtonSelectors](../interfaces/checkoutbuttonselectors.md)>

De-initializes the checkout button by performing any necessary clean-ups.

```js
await service.deinitializeButton({
    methodId: 'braintreepaypal',
});
```

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| options | [CheckoutButtonOptions](../interfaces/checkoutbuttonoptions.md) |  Options for deinitializing the checkout button. |

**Returns:** `Promise`<[CheckoutButtonSelectors](../interfaces/checkoutbuttonselectors.md)>
A promise that resolves to the current state.

___
<a id="getstate"></a>

###  getState

▸ **getState**(): [CheckoutButtonSelectors](../interfaces/checkoutbuttonselectors.md)

Returns a snapshot of the current state.

The method returns a new instance every time there is a change in the state. You can query the state by calling any of its getter methods.

```js
const state = service.getState();

console.log(state.errors.getInitializeButtonError());
console.log(state.statuses.isInitializingButton());
```

**Returns:** [CheckoutButtonSelectors](../interfaces/checkoutbuttonselectors.md)
The current customer's checkout state

___
<a id="initializebutton"></a>

###  initializeButton

▸ **initializeButton**(options: *[CheckoutButtonInitializeOptions](../interfaces/checkoutbuttoninitializeoptions.md)*): `Promise`<[CheckoutButtonSelectors](../interfaces/checkoutbuttonselectors.md)>

Initializes the checkout button of a payment method.

When the checkout button is initialized, it will be inserted into the DOM, ready to be interacted with by the customer.

```js
initializer.initializeButton({
    methodId: 'braintreepaypal',
    containerId: 'checkoutButton',
    braintreepaypal: {
    },
});
```

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| options | [CheckoutButtonInitializeOptions](../interfaces/checkoutbuttoninitializeoptions.md) |  Options for initializing the checkout button. |

**Returns:** `Promise`<[CheckoutButtonSelectors](../interfaces/checkoutbuttonselectors.md)>
A promise that resolves to the current state.

___
<a id="subscribe"></a>

###  subscribe

▸ **subscribe**(subscriber: *`function`*, ...filters: *`Array`<`function`>*): `function`

Subscribes to any changes to the current state.

The method registers a callback function and executes it every time there is a change in the current state.

```js
service.subscribe(state => {
    console.log(state.statuses.isInitializingButton());
});
```

The method can be configured to notify subscribers only regarding relevant changes, by providing a filter function.

```js
const filter = state => state.errors.getInitializeButtonError();

// Only trigger the subscriber when the cart changes.
service.subscribe(state => {
    console.log(state.errors.getInitializeButtonError())
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

