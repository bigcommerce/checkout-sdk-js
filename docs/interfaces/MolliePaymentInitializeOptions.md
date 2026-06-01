[**@bigcommerce/checkout-sdk**](../README.md)

***

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

## Properties

### cardCvcId

> **cardCvcId**: `string`

The location to insert Mollie Component

***

### cardExpiryId

> **cardExpiryId**: `string`

The location to insert Mollie Component

***

### cardHolderId

> **cardHolderId**: `string`

The location to insert Mollie Component

***

### cardNumberId

> **cardNumberId**: `string`

The location to insert Mollie Component

***

### containerId?

> `optional` **containerId?**: `string`

ContainerId is use in Mollie for determined either its showing or not the
container, because when Mollie has Vaulted Instruments it gets hide,
and shows an error because can't mount Provider Components

***

### form?

> `optional` **form?**: `HostedFormOptions`

Hosted Form Validation Options

***

### styles

> **styles**: `object`

A set of styles required for the mollie components

***

### unsupportedMethodMessage?

> `optional` **unsupportedMethodMessage?**: `string`

## Methods

### disableButton()

> **disableButton**(`disabled`): `void`

#### Parameters

##### disabled

`boolean`

#### Returns

`void`
