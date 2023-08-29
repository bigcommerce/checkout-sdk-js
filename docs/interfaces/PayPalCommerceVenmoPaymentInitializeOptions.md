[@bigcommerce/checkout-sdk](../README.md) / PayPalCommerceVenmoPaymentInitializeOptions

# Interface: PayPalCommerceVenmoPaymentInitializeOptions

A set of options that are required to initialize the PayPal Commerce payment
method for presenting its PayPal button.

Please note that the minimum version of checkout-sdk is 1.100

Also, PayPal (also known as PayPal Commerce Platform) requires specific options to initialize the PayPal Smart Payment Button on checkout page that substitutes a standard submit button
```html
<!-- This is where the PayPal button will be inserted -->
<div id="container"></div>
```

```js
service.initializePayment({
    methodId: 'paypalcommercevenmo',
    paypalcommercevenmo: {
        container: '#container',
// Callback for submitting payment form that gets called when a buyer approves PayPal payment
        submitForm: () => {
        // Example function
            this.submitOrder(
               {
                  payment: { methodId: 'paypalcommercevenmo', }
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

- [container](PayPalCommerceVenmoPaymentInitializeOptions.md#container)

### Methods

- [onError](PayPalCommerceVenmoPaymentInitializeOptions.md#onerror)
- [onRenderButton](PayPalCommerceVenmoPaymentInitializeOptions.md#onrenderbutton)
- [onValidate](PayPalCommerceVenmoPaymentInitializeOptions.md#onvalidate)
- [submitForm](PayPalCommerceVenmoPaymentInitializeOptions.md#submitform)

## Properties

### container

• **container**: `string`

The CSS selector of a container where the payment widget should be inserted into.

## Methods

### onError

▸ `Optional` **onError**(`error`): `void`

A callback for displaying error popup. This callback requires error object as parameter.

#### Parameters

| Name | Type |
| :------ | :------ |
| `error` | `Error` |

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
