[**@bigcommerce/checkout-sdk**](../README.md)

***

[@bigcommerce/checkout-sdk](../README.md) / BaseCheckoutButtonInitializeOptions

# Interface: BaseCheckoutButtonInitializeOptions

The set of options for configuring the checkout button.

## Extends

- [`CheckoutButtonOptions`](CheckoutButtonOptions.md)

## Indexable

> \[`key`: `string`\]: `unknown`

## Properties

### containerId

> **containerId**: `string`

The ID of a container which the checkout button should be inserted.

***

### currencyCode?

> `optional` **currencyCode?**: `string`

The option that is required to load payment method configuration for provided currency code in Buy Now flow.

***

### methodId

> **methodId**: [`CheckoutButtonMethodType`](../enumerations/CheckoutButtonMethodType.md)

The identifier of the payment method.

#### Inherited from

[`CheckoutButtonOptions`](CheckoutButtonOptions.md).[`methodId`](CheckoutButtonOptions.md#methodid)

***

### params?

> `optional` **params?**: `object`

The parameters of the request, if required.

#### Inherited from

[`CheckoutButtonOptions`](CheckoutButtonOptions.md).[`params`](CheckoutButtonOptions.md#params)

***

### paypal?

> `optional` **paypal?**: [`PaypalButtonInitializeOptions`](PaypalButtonInitializeOptions.md)

The options that are required to facilitate PayPal. They can be omitted
unless you need to support Paypal.

***

### timeout?

> `optional` **timeout?**: `Timeout`

Provide this option if you want to cancel or time out the request. If the
timeout object completes before the request, the request will be
cancelled.

#### Inherited from

[`RequestOptions`](RequestOptions.md).[`timeout`](RequestOptions.md#timeout)

***

### version?

> `optional` **version?**: `number`

The version of the checkout, used for optimistic concurrency control.

#### Inherited from

[`RequestOptions`](RequestOptions.md).[`version`](RequestOptions.md#version)
