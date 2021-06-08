[@bigcommerce/checkout-sdk](../README.md) › [MolliePaymentInitializeOptions](molliepaymentinitializeoptions.md)

# Interface: MolliePaymentInitializeOptions

A set of options that are required to initialize the Mollie payment method.

Once Mollie payment is initialized, credit card form fields are provided by the
payment provider as IFrames, these will be inserted into the current page. These
options provide a location and styling for each of the form fields.

```js
service.initializePayment({
     methodId: 'mollie',
     mollie: {
         containerId: 'container',
         cardNumberId: '',
         cardHolderId: '',
         cardCvcId: '',
         cardExpiryId: '',
         styles : {
             base: {
                 color: '#fff'
             }
         }
     }
});

## Hierarchy

* **MolliePaymentInitializeOptions**

## Index

### Properties

* [cardCvcId](molliepaymentinitializeoptions.md#cardcvcid)
* [cardExpiryId](molliepaymentinitializeoptions.md#cardexpiryid)
* [cardHolderId](molliepaymentinitializeoptions.md#cardholderid)
* [cardNumberId](molliepaymentinitializeoptions.md#cardnumberid)
* [containerId](molliepaymentinitializeoptions.md#optional-containerid)
* [form](molliepaymentinitializeoptions.md#optional-form)
* [styles](molliepaymentinitializeoptions.md#styles)

## Properties

###  cardCvcId

• **cardCvcId**: *string*

The location to insert Mollie Component

___

###  cardExpiryId

• **cardExpiryId**: *string*

The location to insert Mollie Component

___

###  cardHolderId

• **cardHolderId**: *string*

The location to insert Mollie Component

___

###  cardNumberId

• **cardNumberId**: *string*

The location to insert Mollie Component

___

### `Optional` containerId

• **containerId**? : *undefined | string*

ContainerId is use in Mollie for determined either its showing or not the
container, because when Mollie has Vaulted Instruments it gets hide,
and shows an error because can't mount Provider Components

___

### `Optional` form

• **form**? : *[HostedFormOptions](hostedformoptions.md)*

Hosted Form Validation Options

___

###  styles

• **styles**: *object*

A set of styles required for the mollie components
