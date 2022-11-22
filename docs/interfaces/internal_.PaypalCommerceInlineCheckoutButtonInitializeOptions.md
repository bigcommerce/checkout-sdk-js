[@bigcommerce/checkout-sdk](../README.md) / [<internal\>](../modules/internal_.md) / PaypalCommerceInlineCheckoutButtonInitializeOptions

# Interface: PaypalCommerceInlineCheckoutButtonInitializeOptions

[<internal>](../modules/internal_.md).PaypalCommerceInlineCheckoutButtonInitializeOptions

## Table of contents

### Properties

- [buttonContainerClassName](internal_.PaypalCommerceInlineCheckoutButtonInitializeOptions.md#buttoncontainerclassname)
- [style](internal_.PaypalCommerceInlineCheckoutButtonInitializeOptions.md#style)

### Methods

- [onComplete](internal_.PaypalCommerceInlineCheckoutButtonInitializeOptions.md#oncomplete)
- [onError](internal_.PaypalCommerceInlineCheckoutButtonInitializeOptions.md#onerror)

## Properties

### buttonContainerClassName

• `Optional` **buttonContainerClassName**: `string`

A class name used to add special class for container where the button will be generated in
Default: 'PaypalCommerceInlineButton'

___

### style

• `Optional` **style**: [`PaypalButtonStyleOptions_2`](internal_.PaypalButtonStyleOptions_2.md)

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
