[@bigcommerce/checkout-sdk](../README.md) > [StripeV3PaymentInitializeOptions](../interfaces/stripev3paymentinitializeoptions.md)

# StripeV3PaymentInitializeOptions

A set of options that are required to initialize the Stripe payment method.

Once Stripe payment is initialized, credit card form fields, provided by the payment provider as iframes, will be inserted into the current page. These options provide a location and styling for each of the form fields.

## Hierarchy

**StripeV3PaymentInitializeOptions**

## Index

### Properties

* [containerId](stripev3paymentinitializeoptions.md#containerid)
* [style](stripev3paymentinitializeoptions.md#style)

---

## Properties

<a id="containerid"></a>

###  containerId

**● containerId**: *`string`*

The location to insert the credit card number form field.

___
<a id="style"></a>

### `<Optional>` style

**● style**: *[StripeStyleProps](stripestyleprops.md)*

The set of CSS styles to apply to all form fields.

___

