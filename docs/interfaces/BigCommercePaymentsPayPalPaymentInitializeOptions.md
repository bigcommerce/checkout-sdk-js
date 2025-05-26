[@bigcommerce/checkout-sdk](../README.md) / BigCommercePaymentsPayPalPaymentInitializeOptions

# Interface: BigCommercePaymentsPayPalPaymentInitializeOptions

A set of options that are required to initialize the BigCommercePayments payment
method for presenting its PayPal button.

Please note that the minimum version of checkout-sdk is 1.100

Also, PayPal (also known as BigCommercePayments Platform) requires specific options to initialize the PayPal Smart Payment Button on checkout page that substitutes a standard submit button
```html
<!-- This is where the PayPal button will be inserted -->
<div id="container"></div>
```

```js
service.initializePayment({
    methodId: 'bigcommerce_payments_paypal',
    bigcommerce_payments_paypal: {
        container: '#container',
// Callback for submitting payment form that gets called when a buyer approves PayPal payment
        submitForm: () => {
        // Example function
            this.submitOrder(
               {
                  payment: { methodId: 'bigcommerce_payments_paypal', }
              }
           );
        },
// Callback is used to define the state of the payment form, validate if it is applicable for submit.
        onValidate: (resolve, reject) => {
        // Example function
            const isValid = this.validatePaymentForm();
            if (isValid) {
                return resolve();
            }
            return reject();
        },
// Callback that is called right before render of a Smart Payment Button. It gets called when a buyer is eligible for use of the particular PayPal method. This callback can be used to hide the standard submit button.
        onRenderButton: () => {
        // Example function
            this.hidePaymentSubmitButton();
        }
    },
});
```

## Table of contents

### Properties

- [container](BigCommercePaymentsPayPalPaymentInitializeOptions.md#container)
- [shouldRenderPayPalButtonOnInitialization](BigCommercePaymentsPayPalPaymentInitializeOptions.md#shouldrenderpaypalbuttononinitialization)

### Methods

- [getFieldsValues](BigCommercePaymentsPayPalPaymentInitializeOptions.md#getfieldsvalues)
- [onError](BigCommercePaymentsPayPalPaymentInitializeOptions.md#onerror)
- [onInit](BigCommercePaymentsPayPalPaymentInitializeOptions.md#oninit)
- [onRenderButton](BigCommercePaymentsPayPalPaymentInitializeOptions.md#onrenderbutton)
- [onValidate](BigCommercePaymentsPayPalPaymentInitializeOptions.md#onvalidate)
- [submitForm](BigCommercePaymentsPayPalPaymentInitializeOptions.md#submitform)

## Properties

### container

• **container**: `string`

The CSS selector of a container where the payment widget should be inserted into.

___

### shouldRenderPayPalButtonOnInitialization

• `Optional` **shouldRenderPayPalButtonOnInitialization**: `boolean`

If there is no need to initialize the Smart Payment Button, simply pass false as the option value.
The default value is true

## Methods

### getFieldsValues

▸ `Optional` **getFieldsValues**(): `HostedInstrument`

A callback for getting form fields values.

#### Returns

`HostedInstrument`

___

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

### onInit

▸ `Optional` **onInit**(`callback`): `void`

A callback that gets called when strategy is in the process of initialization before rendering Smart Payment Button.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `callback` | () => `void` | A function, that calls the method to render the Smart Payment Button. |

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

### onValidate

▸ **onValidate**(`resolve`, `reject`): `Promise`<`void`\>

A callback that gets called when a buyer click on Smart Payment Button
and should validate payment form.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `resolve` | () => `void` | A function, that gets called if form is valid. |
| `reject` | () => `void` | A function, that gets called if form is not valid. |

#### Returns

`Promise`<`void`\>

reject() or resolve()

___

### submitForm

▸ **submitForm**(): `void`

A callback for submitting payment form that gets called
when buyer approved PayPal account.

#### Returns

`void`
