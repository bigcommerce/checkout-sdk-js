[@bigcommerce/checkout-sdk](../README.md) / MolliePaymentInitializeOptions

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
```

## Table of contents

### Properties

- [cardCvcId](MolliePaymentInitializeOptions.md#cardcvcid)
- [cardExpiryId](MolliePaymentInitializeOptions.md#cardexpiryid)
- [cardHolderId](MolliePaymentInitializeOptions.md#cardholderid)
- [cardNumberId](MolliePaymentInitializeOptions.md#cardnumberid)
- [containerId](MolliePaymentInitializeOptions.md#containerid)
- [form](MolliePaymentInitializeOptions.md#form)
- [styles](MolliePaymentInitializeOptions.md#styles)
- [unsupportedMethodMessage](MolliePaymentInitializeOptions.md#unsupportedmethodmessage)

### Methods

- [disableButton](MolliePaymentInitializeOptions.md#disablebutton)

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

• `Optional` **form**: [`HostedFormOptions`](HostedFormOptions.md)

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
