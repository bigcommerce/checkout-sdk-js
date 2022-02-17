[@bigcommerce/checkout-sdk](../README.md) › [OpyPaymentInitializeOptions](opypaymentinitializeoptions.md)

# Interface: OpyPaymentInitializeOptions

A set of options that are required to initialize the payment step of
checkout in order to support Opy.

When Opy is initialized, a widget will be inserted into the DOM. The
widget will open a modal that will show more information about Opy when
clicking it.

**`example`** 

```html
<!-- This is where the Opy widget will be inserted -->
<div id="opy-widget"></div>
```

```js
service.initializePayment({
    methodId: 'opy',
    opy: {
        containerId: 'opy-widget',
    },
});
```

## Hierarchy

* **OpyPaymentInitializeOptions**

## Index

### Properties

* [containerId](opypaymentinitializeoptions.md#containerid)

## Properties

###  containerId

• **containerId**: *string*

The ID of a container which the payment widget should insert into.
