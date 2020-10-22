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
            service.submitOrder({
                methodId: 'paypalcommerce',
            });
        },
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

## Methods

### `Optional` onRenderButton

▸ **onRenderButton**(): *void*

**Returns:** *void*

___

###  onValidate

▸ **onValidate**(`resolve`: function, `reject`: function): *Promise‹void›*

**Parameters:**

▪ **resolve**: *function*

▸ (): *void*

▪ **reject**: *function*

▸ (): *void*

**Returns:** *Promise‹void›*

___

###  submitForm

▸ **submitForm**(): *void*

**Returns:** *void*
