[@bigcommerce/checkout-sdk](../README.md) / BraintreePaymentInitializeOptions

# Interface: BraintreePaymentInitializeOptions

A set of options that are required to initialize the Braintree payment
method. You need to provide the options if you want to support 3D Secure
authentication flow.

```html
<!-- These containers are where the hosted (iframed) credit card fields will be inserted -->
<div id="card-number"></div>
<div id="card-name"></div>
<div id="card-expiry"></div>
<div id="card-code"></div>
```

```js
service.initializePayment({
    methodId: 'braintree',
    braintree: {
        form: {
            fields: {
                cardNumber: { containerId: 'card-number' },
                cardName: { containerId: 'card-name' },
                cardExpiry: { containerId: 'card-expiry' },
                cardCode: { containerId: 'card-code' },
            },
        },
    },
});
```

Additional options can be passed in to customize the fields and register
event callbacks.

```js
service.initializePayment({
    methodId: 'braintree',
    creditCard: {
        form: {
            fields: {
                cardNumber: { containerId: 'card-number' },
                cardName: { containerId: 'card-name' },
                cardExpiry: { containerId: 'card-expiry' },
                cardCode: { containerId: 'card-code' },
            },
            styles: {
                default: {
                    color: '#000',
                },
                error: {
                    color: '#f00',
                },
                focus: {
                    color: '#0f0',
                },
            },
            onBlur({ fieldType }) {
                console.log(fieldType);
            },
            onFocus({ fieldType }) {
                console.log(fieldType);
            },
            onEnter({ fieldType }) {
                console.log(fieldType);
            },
            onCardTypeChange({ cardType }) {
                console.log(cardType);
            },
            onValidate({ errors, isValid }) {
                console.log(errors);
                console.log(isValid);
            },
        },
    },
});
```

## Table of contents

### Properties

- [bannerContainerId](BraintreePaymentInitializeOptions.md#bannercontainerid)
- [containerId](BraintreePaymentInitializeOptions.md#containerid)
- [form](BraintreePaymentInitializeOptions.md#form)
- [threeDSecure](BraintreePaymentInitializeOptions.md#threedsecure)

### Methods

- [onError](BraintreePaymentInitializeOptions.md#onerror)
- [onPaymentError](BraintreePaymentInitializeOptions.md#onpaymenterror)
- [onRenderButton](BraintreePaymentInitializeOptions.md#onrenderbutton)
- [submitForm](BraintreePaymentInitializeOptions.md#submitform)

## Properties

### bannerContainerId

• `Optional` **bannerContainerId**: `string`

The location to insert the Pay Later Messages.

___

### containerId

• `Optional` **containerId**: `string`

The CSS selector of a container where the payment widget should be inserted into.

___

### form

• `Optional` **form**: [`BraintreeFormOptions`](BraintreeFormOptions.md)

**`alpha`**
Please note that this option is currently in an early stage of
development. Therefore the API is unstable and not ready for public
consumption.

___

### threeDSecure

• `Optional` **threeDSecure**: [`BraintreeThreeDSecureOptions`](BraintreeThreeDSecureOptions.md)

## Methods

### onError

▸ `Optional` **onError**(`error`): `void`

A callback for displaying error popup. This callback requires error object as parameter.

#### Parameters

| Name | Type |
| :------ | :------ |
| `error` | `unknown` |

#### Returns

`void`

___

### onPaymentError

▸ `Optional` **onPaymentError**(`error`): `void`

A callback that gets called if unable to submit payment.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `error` | `BraintreeError` \| `default` | The error object describing the failure. |

#### Returns

`void`

___

### onRenderButton

▸ `Optional` **onRenderButton**(): `void`

A callback right before render Smart Payment Button that gets called when
Smart Payment Button is eligible. This callback can be used to hide the standard submit button.

#### Returns

`void`

___

### submitForm

▸ `Optional` **submitForm**(): `void`

A callback for submitting payment form that gets called
when buyer approved PayPal account.

#### Returns

`void`
