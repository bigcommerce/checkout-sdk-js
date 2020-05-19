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

**Returns:** [CheckoutButtonSelectors](../interfaces/checkoutbuttonselectors.md)
The current customer's checkout state

___
<a id="initializebutton"></a>

###  initializeButton

▸ **initializeButton**(options: *[CheckoutButtonInitializeOptions](../interfaces/checkoutbuttoninitializeoptions.md)*): `Promise`<[CheckoutButtonSelectors](../interfaces/checkoutbuttonselectors.md)>

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

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| subscriber | `function` |  The function to subscribe to state changes. |
| `Rest` filters | `Array`<`function`> |  One or more functions to filter out irrelevant state changes. If more than one function is provided, the subscriber will only be triggered if all conditions are met. |

**Returns:** `function`
A function, if called, will unsubscribe the subscriber.

___

