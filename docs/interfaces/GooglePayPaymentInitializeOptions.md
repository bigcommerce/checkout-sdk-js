[@bigcommerce/checkout-sdk](../README.md) / GooglePayPaymentInitializeOptions

# Interface: GooglePayPaymentInitializeOptions

A set of options that are required to initialize the GooglePay payment method

If the customer chooses to pay with GooglePay, they will be asked to
enter their payment details via a modal. You can hook into events emitted by
the modal by providing the callbacks listed below.

```html
<!-- This is where the GooglePay button will be inserted -->
<div id="wallet-button"></div>
```

```js
service.initializePayment({
    // Using GooglePay provided by Braintree as an example
    methodId: 'googlepaybraintree',
    googlepaybraintree: {
        walletButton: 'wallet-button'
    },
});
```

Additional event callbacks can be registered.

```js
service.initializePayment({
    methodId: 'googlepaybraintree',
    googlepaybraintree: {
        walletButton: 'wallet-button',
        onError(error) {
            console.log(error);
        },
        onPaymentSelect() {
            console.log('Selected');
        },
    },
});
```

Alternatively, a container-based Google Pay button can be rendered directly
in the payment step (replacing the Place Order button):

```js
service.initializePayment({
    methodId: 'googlepaybraintree',
    googlepaybraintree: {
        container: 'checkout-payment-continue',
        onInit(renderButton) {
            // Hide Place Order, then render the button once container is in DOM
            renderButton();
        },
        onError(error) {
            console.log(error);
        },
    },
});
```

## Table of contents

### Properties

- [buttonColor](GooglePayPaymentInitializeOptions.md#buttoncolor)
- [buttonSizeMode](GooglePayPaymentInitializeOptions.md#buttonsizemode)
- [buttonType](GooglePayPaymentInitializeOptions.md#buttontype)
- [container](GooglePayPaymentInitializeOptions.md#container)
- [loadingContainerId](GooglePayPaymentInitializeOptions.md#loadingcontainerid)
- [walletButton](GooglePayPaymentInitializeOptions.md#walletbutton)

### Methods

- [onError](GooglePayPaymentInitializeOptions.md#onerror)
- [onInit](GooglePayPaymentInitializeOptions.md#oninit)
- [onPaymentSelect](GooglePayPaymentInitializeOptions.md#onpaymentselect)

## Properties

### buttonColor

• `Optional` **buttonColor**: [`GooglePayButtonColor`](../README.md#googlepaybuttoncolor)

The color of the Google Pay button rendered into `container`.
Defaults to `'default'`.

___

### buttonSizeMode

• `Optional` **buttonSizeMode**: [`GooglePayButtonSizeMode`](../README.md#googlepaybuttonsizemode)

The size mode of the Google Pay button rendered into `container`.
Defaults to `'fill'`.

___

### buttonType

• `Optional` **buttonType**: [`GooglePayButtonType`](../README.md#googlepaybuttontype)

The type/label of the Google Pay button rendered into `container`.
Defaults to `'pay'`.

___

### container

• `Optional` **container**: `string`

The ID of the container element where the Google Pay button will be rendered.
When provided, a branded Google Pay button is created inside this container.
Clicking the button opens the Google Pay payment sheet and, on success, submits
the order and redirects to the order confirmation page directly — no separate
"Place Order" step is needed.

___

### loadingContainerId

• `Optional` **loadingContainerId**: `string`

A container for loading spinner.

___

### walletButton

• `Optional` **walletButton**: `string`

This walletButton is used to set an event listener, provide an element ID if you want
users to be able to launch the GooglePay wallet modal by clicking on a button.
It should be an HTML element.

## Methods

### onError

▸ **onError**(`error`): `void`

A callback that gets called when GooglePay fails to initialize or
selects a payment option.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `error` | `Error` | The error object describing the failure. |

#### Returns

`void`

___

### onInit

▸ **onInit**(`renderButton`): `void`

Called after the Google Pay processor is fully initialized, with a
`renderButton` function that — when invoked — creates the Google Pay
button inside `container`.  Use this callback to control timing: hide
the Place Order button first, then call `renderButton()` once the
container element is present in the DOM.

Only used when `container` is provided.

#### Parameters

| Name | Type |
| :------ | :------ |
| `renderButton` | () => `void` |

#### Returns

`void`

___

### onPaymentSelect

▸ **onPaymentSelect**(): `void`

A callback that gets called when the customer selects a payment option.

#### Returns

`void`
