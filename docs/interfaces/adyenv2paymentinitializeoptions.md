[@bigcommerce/checkout-sdk](../README.md) > [AdyenV2PaymentInitializeOptions](../interfaces/adyenv2paymentinitializeoptions.md)

# AdyenV2PaymentInitializeOptions

A set of options that are required to initialize the AdyenV2 payment method.

Once AdyenV2 payment is initialized, credit card form fields, provided by the payment provider as IFrames, will be inserted into the current page. These options provide a location and styling for each of the form fields.

## Hierarchy

**AdyenV2PaymentInitializeOptions**

## Index

### Properties

* [additionalActionOptions](adyenv2paymentinitializeoptions.md#additionalactionoptions)
* [cardVerificationContainerId](adyenv2paymentinitializeoptions.md#cardverificationcontainerid)
* [containerId](adyenv2paymentinitializeoptions.md#containerid)
* [hasVaultedInstruments](adyenv2paymentinitializeoptions.md#hasvaultedinstruments)
* [options](adyenv2paymentinitializeoptions.md#options)
* [threeDS2ContainerId](adyenv2paymentinitializeoptions.md#threeds2containerid)
* [threeDS2Options](adyenv2paymentinitializeoptions.md#threeds2options)

---

## Properties

<a id="additionalactionoptions"></a>

###  additionalActionOptions

**● additionalActionOptions**: *[AdyenAdditionalActionOptions](adyenadditionalactionoptions.md)*

A set of options that are required to initialize additional payment actions.

___
<a id="cardverificationcontainerid"></a>

### `<Optional>` cardVerificationContainerId

**● cardVerificationContainerId**: * `undefined` &#124; `string`
*

The location to insert the Adyen custom card component

___
<a id="containerid"></a>

###  containerId

**● containerId**: *`string`*

The location to insert the Adyen component.

___
<a id="hasvaultedinstruments"></a>

### `<Optional>` hasVaultedInstruments

**● hasVaultedInstruments**: * `undefined` &#124; `false` &#124; `true`
*

True if the Adyen component has some Vaulted instrument

___
<a id="options"></a>

### `<Optional>` options

**● options**: * [Omit](../#omit)<[AdyenCreditCardComponentOptions](adyencreditcardcomponentoptions.md), "onChange"> &#124; [AdyenIdealComponentOptions](adyenidealcomponentoptions.md)
*

Optional. Overwriting the default options

___
<a id="threeds2containerid"></a>

###  threeDS2ContainerId

**● threeDS2ContainerId**: *`string`*

*__deprecated__*: The location to insert the Adyen 3DS V2 component. Use additionalActionOptions instead as this property will be removed in the future

___
<a id="threeds2options"></a>

###  threeDS2Options

**● threeDS2Options**: *[AdyenThreeDS2Options](adyenthreeds2options.md)*

*__deprecated__*: Use additionalActionOptions instead as this property will be removed in the future

___

