[@bigcommerce/checkout-sdk](../README.md) > [ChasePayInitializeOptions](../interfaces/chasepayinitializeoptions.md)

# ChasePayInitializeOptions

## Hierarchy

**ChasePayInitializeOptions**

## Index

### Properties

* [logoContainer](chasepayinitializeoptions.md#logocontainer)
* [walletButton](chasepayinitializeoptions.md#walletbutton)

### Methods

* [onCancel](chasepayinitializeoptions.md#oncancel)
* [onPaymentSelect](chasepayinitializeoptions.md#onpaymentselect)

---

## Properties

<a id="logocontainer"></a>

### `<Optional>` logoContainer

**● logoContainer**: * `undefined` &#124; `string`
*

This container is used to host the chasepay branding logo. It should be an HTML element.

___
<a id="walletbutton"></a>

### `<Optional>` walletButton

**● walletButton**: * `undefined` &#124; `string`
*

This walletButton is used to set an event listener, provide an element ID if you want users to be able to launch the ChasePay wallet modal by clicking on a button. It should be an HTML element.

___

## Methods

<a id="oncancel"></a>

### `<Optional>` onCancel

▸ **onCancel**(): `void`

A callback that gets called when the customer cancels their payment selection.

**Returns:** `void`

___
<a id="onpaymentselect"></a>

### `<Optional>` onPaymentSelect

▸ **onPaymentSelect**(): `void`

A callback that gets called when the customer selects a payment option.

**Returns:** `void`

___

