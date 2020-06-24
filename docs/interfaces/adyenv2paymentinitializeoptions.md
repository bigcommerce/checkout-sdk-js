[@bigcommerce/checkout-sdk](../README.md) › [AdyenV2PaymentInitializeOptions](adyenv2paymentinitializeoptions.md)

# Interface: AdyenV2PaymentInitializeOptions

A set of options that are required to initialize the AdyenV2 payment method.

Once AdyenV2 payment is initialized, credit card form fields, provided by the
payment provider as IFrames, will be inserted into the current page. These
options provide a location and styling for each of the form fields.

## Hierarchy

* **AdyenV2PaymentInitializeOptions**

## Index

### Properties

* [additionalActionOptions](adyenv2paymentinitializeoptions.md#additionalactionoptions)
* [cardVerificationContainerId](adyenv2paymentinitializeoptions.md#optional-cardverificationcontainerid)
* [containerId](adyenv2paymentinitializeoptions.md#containerid)
* [hasVaultedInstruments](adyenv2paymentinitializeoptions.md#optional-hasvaultedinstruments)
* [options](adyenv2paymentinitializeoptions.md#optional-options)
* [threeDS2ContainerId](adyenv2paymentinitializeoptions.md#threeds2containerid)
* [threeDS2Options](adyenv2paymentinitializeoptions.md#threeds2options)

## Properties

###  additionalActionOptions

• **additionalActionOptions**: *[AdyenAdditionalActionOptions](adyenadditionalactionoptions.md)*

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

• **options**? : *[Omit](../README.md#omit)‹[AdyenCreditCardComponentOptions](adyencreditcardcomponentoptions.md), "onChange"› | [AdyenIdealComponentOptions](adyenidealcomponentoptions.md)*

Optional. Overwriting the default options

___

###  threeDS2ContainerId

• **threeDS2ContainerId**: *string*

**`deprecated`** The location to insert the Adyen 3DS V2 component.
Use additionalActionOptions instead as this property will be removed in the future

___

###  threeDS2Options

• **threeDS2Options**: *[AdyenThreeDS2Options](adyenthreeds2options.md)*

**`deprecated`** 
Use additionalActionOptions instead as this property will be removed in the future
