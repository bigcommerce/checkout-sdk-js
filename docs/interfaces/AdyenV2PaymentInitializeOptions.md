[@bigcommerce/checkout-sdk](../README.md) / AdyenV2PaymentInitializeOptions

# Interface: AdyenV2PaymentInitializeOptions

A set of options that are required to initialize the AdyenV2 payment method.

Once AdyenV2 payment is initialized, credit card form fields, provided by the
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
    methodId: 'adyenv2',
    adyenv2: {
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
    methodId: 'adyenv2',
    adyenv2: {
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
        },
        options: {
            scheme: {
                hasHolderName: true,
            },
            bcmc: {
                hasHolderName: true,
            },
            ideal: {
                showImage: true,
            },
        },
    },
});
```

## Table of contents

### Properties

- [additionalActionOptions](AdyenV2PaymentInitializeOptions.md#additionalactionoptions)
- [cardVerificationContainerId](AdyenV2PaymentInitializeOptions.md#cardverificationcontainerid)
- [containerId](AdyenV2PaymentInitializeOptions.md#containerid)
- [hasVaultedInstruments](AdyenV2PaymentInitializeOptions.md#hasvaultedinstruments)
- [options](AdyenV2PaymentInitializeOptions.md#options)
- [shouldShowNumberField](AdyenV2PaymentInitializeOptions.md#shouldshownumberfield)
- [threeDS2ContainerId](AdyenV2PaymentInitializeOptions.md#threeds2containerid)
- [threeDS2Options](AdyenV2PaymentInitializeOptions.md#threeds2options)

### Methods

- [validateCardFields](AdyenV2PaymentInitializeOptions.md#validatecardfields)

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

• `Optional` **options**: [`AdyenIdealComponentOptions`](AdyenIdealComponentOptions.md) \| `Pick`<[`AdyenCreditCardComponentOptions`](AdyenCreditCardComponentOptions.md), ``"details"`` \| ``"enableStoreDetails"`` \| ``"hasHolderName"`` \| ``"holderNameRequired"`` \| ``"data"`` \| ``"groupTypes"`` \| ``"placeholders"`` \| ``"brands"`` \| ``"styles"`` \| ``"onError"`` \| ``"onFieldValid"``\>

Optional. Overwriting the default options

___

### shouldShowNumberField

• `Optional` **shouldShowNumberField**: `boolean`

___

### threeDS2ContainerId

• **threeDS2ContainerId**: `string`

**`deprecated`** The location to insert the Adyen 3DS V2 component.
Use additionalActionOptions instead as this property will be removed in the future

___

### threeDS2Options

• `Optional` **threeDS2Options**: [`AdyenThreeDS2Options`](AdyenThreeDS2Options.md)

**`deprecated`**
Use additionalActionOptions instead as this property will be removed in the future

## Methods

### validateCardFields

▸ **validateCardFields**(`validateState`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `validateState` | [`AdyenV2ValidationState`](AdyenV2ValidationState.md) |

#### Returns

`void`
