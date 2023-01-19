[@bigcommerce/checkout-sdk](../README.md) / PayPalCommerceInlineButtonInitializeOptions

# Interface: PayPalCommerceInlineButtonInitializeOptions

A set of options that are required to initialize ApplePay in cart.

When ApplePay is initialized, an ApplePay button will be inserted into the
DOM. When a customer clicks on it, it will trigger Apple sheet.

## Table of contents

### Properties

- [buttonContainerClassName](PayPalCommerceInlineButtonInitializeOptions.md#buttoncontainerclassname)
- [style](PayPalCommerceInlineButtonInitializeOptions.md#style)

### Methods

- [onComplete](PayPalCommerceInlineButtonInitializeOptions.md#oncomplete)
- [onError](PayPalCommerceInlineButtonInitializeOptions.md#onerror)

## Properties

### buttonContainerClassName

• `Optional` **buttonContainerClassName**: `string`

A class name used to add special class for container where the button will be generated in
Default: 'PaypalCommerceInlineButton'

___

### style

• `Optional` **style**: `Pick`<[`PayPalButtonStyleOptions`](PayPalButtonStyleOptions.md), ``"custom"``\>

A set of styling options for the checkout button.

## Methods

### onComplete

▸ **onComplete**(): `void`

A callback that gets called when payment complete on paypal side.

#### Returns

`void`

___

### onError

▸ `Optional` **onError**(): `void`

A callback that gets called on any error

#### Returns

`void`
