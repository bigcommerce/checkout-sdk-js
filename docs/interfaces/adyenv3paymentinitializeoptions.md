[@bigcommerce/checkout-sdk](../README.md) › [AdyenV3PaymentInitializeOptions](adyenv3paymentinitializeoptions.md)

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
        },
        options: {
            scheme: {
                hasHolderName: true,
            },
        },
    },
});
```

## Hierarchy

* **AdyenV3PaymentInitializeOptions**

## Index

### Properties

* [additionalActionOptions](adyenv3paymentinitializeoptions.md#additionalactionoptions)
* [cardVerificationContainerId](adyenv3paymentinitializeoptions.md#optional-cardverificationcontainerid)
* [containerId](adyenv3paymentinitializeoptions.md#containerid)
* [hasVaultedInstruments](adyenv3paymentinitializeoptions.md#optional-hasvaultedinstruments)
* [options](adyenv3paymentinitializeoptions.md#optional-options)
* [shouldShowNumberField](adyenv3paymentinitializeoptions.md#optional-shouldshownumberfield)

### Methods

* [validateCardFields](adyenv3paymentinitializeoptions.md#validatecardfields)

## Properties

###  additionalActionOptions

• **additionalActionOptions**: *[AdyenAdditionalActionOptions_2](adyenadditionalactionoptions_2.md)*

A set of options that are required to initialize additional payment actions.

___

### `Optional` cardVerificationContainerId

• **cardVerificationContainerId**? : *undefined | string*

The location to insert the Adyen custom card component

___

###  containerId

• **containerId**: *string*

The location to insert the Adyen component.

___

### `Optional` hasVaultedInstruments

• **hasVaultedInstruments**? : *undefined | false | true*

True if the Adyen component has some Vaulted instrument

___

### `Optional` options

• **options**? : *[Omit](../README.md#omit)‹[AdyenV3CreditCardComponentOptions](adyenv3creditcardcomponentoptions.md), "onChange"›*

Optional. Overwriting the default options

___

### `Optional` shouldShowNumberField

• **shouldShowNumberField**? : *undefined | false | true*

## Methods

###  validateCardFields

▸ **validateCardFields**(`componentState`: [AdyenV3ComponentState](../README.md#adyenv3componentstate)): *void*

**Parameters:**

Name | Type |
------ | ------ |
`componentState` | [AdyenV3ComponentState](../README.md#adyenv3componentstate) |

**Returns:** *void*
