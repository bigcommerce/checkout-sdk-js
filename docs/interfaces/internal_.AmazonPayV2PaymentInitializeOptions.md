[@bigcommerce/checkout-sdk](../README.md) / [<internal\>](../modules/internal_.md) / AmazonPayV2PaymentInitializeOptions

# Interface: AmazonPayV2PaymentInitializeOptions

[<internal>](../modules/internal_.md).AmazonPayV2PaymentInitializeOptions

A set of options that are required to initialize the payment step of
checkout in order to support AmazonPayV2.

When AmazonPayV2 is initialized, a change payment button will be bound.
When the customer clicks on it, they will be redirected to Amazon to
select a different payment method.

```html
<!-- This is where the Amazon button will be inserted -->
<div id="edit-button"></div>
```

```js
service.initializePayment({
    methodId: 'amazonpay',
    amazonpay: {
        editButtonId: 'edit-button',
    },
});
```

## Table of contents

### Properties

- [editButtonId](internal_.AmazonPayV2PaymentInitializeOptions.md#editbuttonid)

## Properties

### editButtonId

• `Optional` **editButtonId**: `string`

This editButtonId is used to set an event listener, provide an element ID
if you want users to be able to select a different payment method by
clicking on a button. It should be an HTML element.
