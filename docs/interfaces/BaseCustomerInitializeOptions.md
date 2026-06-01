[**@bigcommerce/checkout-sdk**](../README.md)

***

[@bigcommerce/checkout-sdk](../README.md) / BaseCustomerInitializeOptions

# Interface: BaseCustomerInitializeOptions

A set of options that are required to initialize the customer step of the
current checkout flow.

Some payment methods have specific requirements for setting the customer
details for checkout. For example, Amazon Pay requires the customer to sign in
using their sign-in button. As a result, you may need to provide additional
information in order to initialize the customer step of checkout.

## Extends

- [`CustomerRequestOptions`](CustomerRequestOptions.md)

## Indexable

> \[`key`: `string`\]: `unknown`

## Properties

### integrations?

> `optional` **integrations?**: `CustomerStrategyFactory`\<`CustomerStrategy`\>[]

**`Alpha`**

***

### methodId?

> `optional` **methodId?**: `string`

#### Inherited from

[`CustomerRequestOptions`](CustomerRequestOptions.md).[`methodId`](CustomerRequestOptions.md#methodid)

***

### params?

> `optional` **params?**: `object`

The parameters of the request, if required.

#### Inherited from

[`CustomerRequestOptions`](CustomerRequestOptions.md).[`params`](CustomerRequestOptions.md#params)

***

### timeout?

> `optional` **timeout?**: `Timeout`

Provide this option if you want to cancel or time out the request. If the
timeout object completes before the request, the request will be
cancelled.

#### Inherited from

[`CustomerRequestOptions`](CustomerRequestOptions.md).[`timeout`](CustomerRequestOptions.md#timeout)

***

### version?

> `optional` **version?**: `number`

The version of the checkout, used for optimistic concurrency control.

#### Inherited from

[`CustomerRequestOptions`](CustomerRequestOptions.md).[`version`](CustomerRequestOptions.md#version)
