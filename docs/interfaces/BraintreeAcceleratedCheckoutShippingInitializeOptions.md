[@bigcommerce/checkout-sdk](../README.md) / BraintreeAcceleratedCheckoutShippingInitializeOptions

# Interface: BraintreeAcceleratedCheckoutShippingInitializeOptions

A set of options that are required to initialize the shipping step of
checkout in order to support Braintree Accelerated Checkout.

## Table of contents

### Properties

- [methodId](BraintreeAcceleratedCheckoutShippingInitializeOptions.md#methodid)
- [styles](BraintreeAcceleratedCheckoutShippingInitializeOptions.md#styles)

## Properties

### methodId

• **methodId**: `string`

The identifier of the payment method.

___

### styles

• `Optional` **styles**: `BraintreeConnectStylesOption`

Is a stylisation options for customizing PayPal Connect components

Note: the styles for all Braintree Accelerated Checkout strategies should be the same,
because they will be provided to PayPal library only for the first strategy initialization
no matter what strategy was initialised first
