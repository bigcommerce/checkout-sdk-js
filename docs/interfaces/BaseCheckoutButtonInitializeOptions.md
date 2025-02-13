[@bigcommerce/checkout-sdk](../README.md) / BaseCheckoutButtonInitializeOptions

# Interface: BaseCheckoutButtonInitializeOptions

## Hierarchy

- [`CheckoutButtonOptions`](CheckoutButtonOptions.md)

  ↳ **`BaseCheckoutButtonInitializeOptions`**

## Indexable

▪ [key: `string`]: `unknown`

## Table of contents

### Properties

- [braintreepaypal](BaseCheckoutButtonInitializeOptions.md#braintreepaypal)
- [containerId](BaseCheckoutButtonInitializeOptions.md#containerid)
- [currencyCode](BaseCheckoutButtonInitializeOptions.md#currencycode)
- [methodId](BaseCheckoutButtonInitializeOptions.md#methodid)
- [params](BaseCheckoutButtonInitializeOptions.md#params)
- [paypal](BaseCheckoutButtonInitializeOptions.md#paypal)
- [timeout](BaseCheckoutButtonInitializeOptions.md#timeout)

## Properties

### braintreepaypal

• `Optional` **braintreepaypal**: [`BraintreePaypalButtonInitializeOptions`](BraintreePaypalButtonInitializeOptions.md)

The options that are required to facilitate Braintree PayPal. They can be
omitted unless you need to support Braintree PayPal.

___

### containerId

• **containerId**: `string`

The ID of a container which the checkout button should be inserted.

___

### currencyCode

• `Optional` **currencyCode**: `string`

The option that is required to load payment method configuration for provided currency code in Buy Now flow.

___

### methodId

• **methodId**: [`CheckoutButtonMethodType`](../enums/CheckoutButtonMethodType.md)

The identifier of the payment method.

#### Inherited from

[CheckoutButtonOptions](CheckoutButtonOptions.md).[methodId](CheckoutButtonOptions.md#methodid)

___

### params

• `Optional` **params**: `Object`

The parameters of the request, if required.

#### Inherited from

[CheckoutButtonOptions](CheckoutButtonOptions.md).[params](CheckoutButtonOptions.md#params)

___

### paypal

• `Optional` **paypal**: [`PaypalButtonInitializeOptions`](PaypalButtonInitializeOptions.md)

The options that are required to facilitate PayPal. They can be omitted
unless you need to support Paypal.

___

### timeout

• `Optional` **timeout**: `default`

Provide this option if you want to cancel or time out the request. If the
timeout object completes before the request, the request will be
cancelled.

#### Inherited from

[CheckoutButtonOptions](CheckoutButtonOptions.md).[timeout](CheckoutButtonOptions.md#timeout)
