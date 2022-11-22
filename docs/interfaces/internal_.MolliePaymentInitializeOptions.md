[@bigcommerce/checkout-sdk](../README.md) / [<internal\>](../modules/internal_.md) / MolliePaymentInitializeOptions

# Interface: MolliePaymentInitializeOptions

[<internal>](../modules/internal_.md).MolliePaymentInitializeOptions

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
```

## Table of contents

### Properties

- [cardCvcId](internal_.MolliePaymentInitializeOptions.md#cardcvcid)
- [cardExpiryId](internal_.MolliePaymentInitializeOptions.md#cardexpiryid)
- [cardHolderId](internal_.MolliePaymentInitializeOptions.md#cardholderid)
- [cardNumberId](internal_.MolliePaymentInitializeOptions.md#cardnumberid)
- [containerId](internal_.MolliePaymentInitializeOptions.md#containerid)
- [form](internal_.MolliePaymentInitializeOptions.md#form)
- [styles](internal_.MolliePaymentInitializeOptions.md#styles)
- [unsupportedMethodMessage](internal_.MolliePaymentInitializeOptions.md#unsupportedmethodmessage)

### Methods

- [disableButton](internal_.MolliePaymentInitializeOptions.md#disablebutton)

## Properties

### cardCvcId

• **cardCvcId**: `string`

The location to insert Mollie Component

___

### cardExpiryId

• **cardExpiryId**: `string`

The location to insert Mollie Component

___

### cardHolderId

• **cardHolderId**: `string`

The location to insert Mollie Component

___

### cardNumberId

• **cardNumberId**: `string`

The location to insert Mollie Component

___

### containerId

• `Optional` **containerId**: `string`

ContainerId is use in Mollie for determined either its showing or not the
container, because when Mollie has Vaulted Instruments it gets hide,
and shows an error because can't mount Provider Components

___

### form

• `Optional` **form**: [`HostedFormOptions`](internal_.HostedFormOptions.md)

Hosted Form Validation Options

___

### styles

• **styles**: `object`

A set of styles required for the mollie components

___

### unsupportedMethodMessage

• `Optional` **unsupportedMethodMessage**: `string`

## Methods

### disableButton

▸ **disableButton**(`disabled`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `disabled` | `boolean` |

#### Returns

`void`
