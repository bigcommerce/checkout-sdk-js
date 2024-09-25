[@bigcommerce/checkout-sdk](../README.md) / AdyenV3PaymentInitializeOptions

# Interface: AdyenV3PaymentInitializeOptions

A set of options that are required to initialize the Adyenv3 payment method.

Once Adyenv3 payment is initialized, credit card form fields, provided by the
payment provider as IFrames, will be inserted into the current page. These
options provide a location and styling for each of the form fields.

```html
<!-- This is where the credit card component will be inserted -->
<div id="container"></div>

<!-- This is where the secondary components (i.e.: 3DS) will be inserted -->
<div id="additional-action-container"></div>
```

```js
service.initializePayment({
    methodId: 'adyenv3',
    adyenv3: {
        containerId: 'container',
        additionalActionOptions: {
            containerId: 'additional-action-container',
        },
    },
});
```

Additional options can be passed in to customize the components and register
event callbacks.

```js
service.initializePayment({
    methodId: 'adyenv3',
    adyenv3: {
        containerId: 'container',
        additionalActionOptions: {
            containerId: 'additional-action-container',
            onBeforeLoad(shopperInteraction) {
                console.log(shopperInteraction);
            },
            onLoad(cancel) {
                console.log(cancel);
            },
            onComplete() {
                console.log('Completed');
            },
            onActionHandled() {
                console.log('ActionHandled');
            },
        },
        options: {
            scheme: {
                hasHolderName: true,
            },
        },
    },
});
```

## Table of contents

### Properties

- [additionalActionOptions](AdyenV3PaymentInitializeOptions.md#additionalactionoptions)
- [cardVerificationContainerId](AdyenV3PaymentInitializeOptions.md#cardverificationcontainerid)
- [containerId](AdyenV3PaymentInitializeOptions.md#containerid)
- [hasVaultedInstruments](AdyenV3PaymentInitializeOptions.md#hasvaultedinstruments)
- [options](AdyenV3PaymentInitializeOptions.md#options)
- [shouldShowNumberField](AdyenV3PaymentInitializeOptions.md#shouldshownumberfield)

### Methods

- [validateCardFields](AdyenV3PaymentInitializeOptions.md#validatecardfields)

## Properties

### additionalActionOptions

• **additionalActionOptions**: [`AdyenAdditionalActionOptions`](AdyenAdditionalActionOptions.md)

A set of options that are required to initialize additional payment actions.

___

### cardVerificationContainerId

• `Optional` **cardVerificationContainerId**: `string`

The location to insert the Adyen custom card component

___

### containerId

• **containerId**: `string`

The location to insert the Adyen component.

___

### hasVaultedInstruments

• `Optional` **hasVaultedInstruments**: `boolean`

True if the Adyen component has some Vaulted instrument

___

### options

• `Optional` **options**: `Omit`<[`AdyenCreditCardComponentOptions`](AdyenCreditCardComponentOptions.md), ``"onChange"``\>

Optional. Overwriting the default options

___

### shouldShowNumberField

• `Optional` **shouldShowNumberField**: `boolean`

## Methods

### validateCardFields

▸ **validateCardFields**(`validateState`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `validateState` | [`AdyenValidationState`](AdyenValidationState.md) |

#### Returns

`void`
