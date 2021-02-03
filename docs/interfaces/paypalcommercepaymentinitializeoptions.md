[@bigcommerce/checkout-sdk](../README.md) › [PaypalCommercePaymentInitializeOptions](paypalcommercepaymentinitializeoptions.md)

# Interface: PaypalCommercePaymentInitializeOptions

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
    methodId: 'paypalcommerce',
    paypalcommerce: {
        container: 'container',
// Callback for submitting payment form that gets called when a buyer approves PayPal payment
        submitForm: () => {
            service.submitOrder(
               {
                  payment: { methodId: 'paypalcommerce', }
              }
           );
        },
// Callback is used to define the state of the payment form, validate if it is applicable for submit.
        onValidate: (resolve, reject) => {
            const isValid = service.validatePaymentForm();
            if (isValid) {
                return resolve();
            }
            return reject();
        },
// Callback that is called right before render of a Smart Payment Button. It gets called when a buyer is eligible for use of the particular PayPal method. This callback can be used to hide the standard submit button.
        onRenderButton: () => {
            service.hidePaymentSubmitButton();
        }
    },
});
```

## Hierarchy

* **PaypalCommercePaymentInitializeOptions**

## Index

### Properties

* [container](paypalcommercepaymentinitializeoptions.md#container)

### Methods

* [onError](paypalcommercepaymentinitializeoptions.md#optional-onerror)
* [onRenderButton](paypalcommercepaymentinitializeoptions.md#optional-onrenderbutton)
* [onValidate](paypalcommercepaymentinitializeoptions.md#onvalidate)
* [submitForm](paypalcommercepaymentinitializeoptions.md#submitform)

## Properties

###  container

• **container**: *string*

The ID of a container where the payment widget should be inserted into.

## Methods

### `Optional` onError

▸ **onError**(`error`: [Error](amazonpaywidgeterror.md#error)): *void*

A callback for displaying error popup. This callback requires error object as parameter.

**Parameters:**

Name | Type |
------ | ------ |
`error` | [Error](amazonpaywidgeterror.md#error) |

**Returns:** *void*

___

### `Optional` onRenderButton

▸ **onRenderButton**(): *void*

A callback right before render Smart Payment Button that gets called when
Smart Payment Button is eligible. This callback can be used to hide the standard submit button.

**Returns:** *void*

___

###  onValidate

▸ **onValidate**(`resolve`: function, `reject`: function): *Promise‹void›*

A callback that gets called when a buyer click on Smart Payment Button
and should validate payment form.

**Parameters:**

▪ **resolve**: *function*

A function, that gets called if form is valid.

▸ (): *void*

▪ **reject**: *function*

A function, that gets called if form is not valid.

▸ (): *void*

**Returns:** *Promise‹void›*

reject() or resolve()

___

###  submitForm

▸ **submitForm**(): *void*

A callback for submitting payment form that gets called
when buyer approved PayPal account.

**Returns:** *void*
