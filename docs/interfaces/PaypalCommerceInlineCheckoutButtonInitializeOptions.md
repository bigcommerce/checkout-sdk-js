[@bigcommerce/checkout-sdk](../README.md) / PaypalCommerceInlineCheckoutButtonInitializeOptions

# Interface: PaypalCommerceInlineCheckoutButtonInitializeOptions

## Table of contents

### Properties

- [acceleratedCheckoutContainerDataId](PaypalCommerceInlineCheckoutButtonInitializeOptions.md#acceleratedcheckoutcontainerdataid)
- [buttonContainerClassName](PaypalCommerceInlineCheckoutButtonInitializeOptions.md#buttoncontainerclassname)
- [buttonContainerDataId](PaypalCommerceInlineCheckoutButtonInitializeOptions.md#buttoncontainerdataid)
- [nativeCheckoutButtonDataId](PaypalCommerceInlineCheckoutButtonInitializeOptions.md#nativecheckoutbuttondataid)
- [style](PaypalCommerceInlineCheckoutButtonInitializeOptions.md#style)

### Methods

- [onComplete](PaypalCommerceInlineCheckoutButtonInitializeOptions.md#oncomplete)

## Properties

### acceleratedCheckoutContainerDataId

• **acceleratedCheckoutContainerDataId**: `string`

Accelerated Checkout Buttons container - is a generic container for all AC buttons
Used as a container where the button will be rendered with its own container
Example: 'data-cart-accelerated-checkout-buttons'
Info: we are using data attributes as an identifier because the buttons can be rendered in several places on the page

___

### buttonContainerClassName

• `Optional` **buttonContainerClassName**: `string`

A class name used to add special class for container where the button will be generated in
Default: 'PaypalCommerceInlineButton'

___

### buttonContainerDataId

• **buttonContainerDataId**: `string`

A container identifier what used to add special class for container where the button will be generated in
Example: 'data-paypal-commerce-inline-button'
Info: we are using data attributes as an identifier because the buttons can be rendered in several places on the page

___

### nativeCheckoutButtonDataId

• **nativeCheckoutButtonDataId**: `string`

Used by Accelerated Checkout strategy to hide native action button before rendering PayPal inline checkout button
Example: 'data-checkout-now-button'
Info: we are using data attributes as an identifier because the buttons can be rendered in several places on the page

___

### style

• `Optional` **style**: [`PaypalButtonStyleOptions_2`](PaypalButtonStyleOptions_2.md)

A set of styling options for the checkout button.

## Methods

### onComplete

▸ **onComplete**(): `void`

A callback that gets called when payment complete on paypal side.

#### Returns

`void`
