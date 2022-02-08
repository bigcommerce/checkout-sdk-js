[@bigcommerce/checkout-sdk](../README.md) › [ApplePayButtonInitializeOptions](applepaybuttoninitializeoptions.md)

# Interface: ApplePayButtonInitializeOptions

A set of options that are required to initialize ApplePay in cart.

When ApplePay is initialized, an ApplePay button will be inserted into the
DOM. When a customer clicks on it, it will trigger Apple sheet.

## Hierarchy

* **ApplePayButtonInitializeOptions**

## Index

### Properties

* [buttonClassName](applepaybuttoninitializeoptions.md#optional-buttonclassname)

### Methods

* [onPaymentAuthorize](applepaybuttoninitializeoptions.md#onpaymentauthorize)

## Properties

### `Optional` buttonClassName

• **buttonClassName**? : *undefined | string*

The class name of the ApplePay button style.

## Methods

###  onPaymentAuthorize

▸ **onPaymentAuthorize**(): *void*

A callback that gets called when a payment is successfully completed.

**Returns:** *void*
