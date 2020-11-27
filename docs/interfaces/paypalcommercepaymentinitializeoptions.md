[@bigcommerce/checkout-sdk](../README.md) › [PaypalCommercePaymentInitializeOptions](paypalcommercepaymentinitializeoptions.md)

# Interface: PaypalCommercePaymentInitializeOptions

A set of options that are required to initialize the PayPal Commerce payment
method for presenting its PayPal button.

```html
<!-- This is where the PayPal button will be inserted -->
<div id="container"></div>
```

```js
service.initializePayment({
    methodId: 'paypalcommerce',
    paypalcommerce: {
        container: 'container',
        submitForm: () => {
            service.submitOrder({ methodId: 'paypalcommerce', });
        },
        onValidate: (resolve, reject) => {
            const isValid = service.validatePaymentForm();
            if (isValid) {
                return resolve();
            }
            return reject();
        },
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

* [onRenderButton](paypalcommercepaymentinitializeoptions.md#optional-onrenderbutton)
* [onValidate](paypalcommercepaymentinitializeoptions.md#onvalidate)
* [submitForm](paypalcommercepaymentinitializeoptions.md#submitform)

## Properties

###  container

• **container**: *string*

The ID of a container where the payment widget should be inserted into.

## Methods

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
