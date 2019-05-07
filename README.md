# @bigcommerce/checkout-sdk

[![Build Status](https://travis-ci.com/bigcommerce/checkout-sdk-js.svg?token=pywwZy8zX1F5AzeQ9WpL&branch=master)](https://travis-ci.com/bigcommerce/checkout-sdk-js)

Checkout JS SDK provides you with the tools you need to build your own checkout solution for a BigCommerce store.

The SDK has a convenient application interface for starting and completing a checkout flow. Behind the interface, it handles all the necessary interactions with our Storefront APIs and other payment SDKs. So you can focus on creating a checkout experience that is unique to your business.


## Table of contents <!-- omit in toc -->
- [Features](#features)
- [Getting started](#getting-started)
- [Installation](#installation)
- [Requirements](#requirements)
    - [Browser support](#browser-support)
    - [Framework](#framework)
    - [CORS](#cors)
- [Usage](#usage)
    - [Initialize instance](#initialize-instance)
        - [Load checkout](#load-checkout)
    - [Sign in customer](#sign-in-customer)
    - [Set shipping details](#set-shipping-details)
        - [Set shipping address](#set-shipping-address)
        - [Set shipping option](#set-shipping-option)
    - [Set billing details](#set-billing-details)
    - [Apply coupon or gift certificate](#apply-coupon-or-gift-certificate)
    - [Submit payment and order](#submit-payment-and-order)
        - [Load payment methods](#load-payment-methods)
        - [Initialize payment method](#initialize-payment-method)
        - [Submit order](#submit-order)
        - [Finalize order](#finalize-order)
    - [Load order](#load-order)
    - [Subscribe to changes](#subscribe-to-changes)
    - [Cancel requests](#cancel-requests)
- [API reference](#api-reference)
- [See also](#see-also)
- [Notes](#notes)
- [Contribution](#contribution)
- [License](#license)


## Features

The [Checkout JS SDK](https://developer.bigcommerce.com/api-docs/cart-and-checkout/checkout-sdk) is a client-side JavaScript library for our [Storefront Checkout API](https://developer.bigcommerce.com/api-reference/cart-checkout/storefront-checkout-api). It provides all the methods that are required to complete a checkout process, for example:
* Sign in a customer and begin the checkout process
* Set shipping, billing and other required information
* Pay for the order and complete the checkout process

The library also provides integrations with all the payment methods supported by [Optimized One Page Checkout](https://support.bigcommerce.com/articles/Public/Optimized-Single-Page-Checkout), such as:
* PayPal Express
* Braintree
* Square
* Amazon
* Klarna
* AfterPay

Using this library in conjunction with your favorite UI framework, it is possible to build a bespoke checkout UI for a store, that can be augmented with additional features. We provide a basic [reference implementation](https://github.com/bigcommerce/checkout-sdk-js-example) of a custom checkout written in React to get you started.


## Getting started

The Checkout JS SDK is the easiest way to build a bespoke checkout into your store’s theme. We have created the following tutorials to help you get started.
* [Build with vanilla JS](https://developer.bigcommerce.com/stencil-docs/template-files/customize-stencil-checkout/checkout-js-sdk/getting-started-in-vanilla-js) - This tutorial will walk through the first steps for building a custom checkout directly into the theme files using vanilla JS.
* [Run example app in Cornerstone](https://developer.bigcommerce.com/stencil-docs/template-files/customize-stencil-checkout/checkout-js-sdk/implement-a-custom-checkout) - This tutorial will take you through the steps to integrate the custom checkout provided by our reference implementation into the Cornerstone theme.


## Installation

You can install this library using [npm](https://www.npmjs.com/get-npm).

```sh
npm install --save @bigcommerce/checkout-sdk
```


## Requirements

### Browser support

We release the library in ES5 so you don't have to do additional transpilation in order to use it. However, you do require the [Promise polyfill](https://github.com/stefanpenner/es6-promise) if you need to support older browsers, such as IE11.

### Framework

The library is framework agnostic. In other words, you can use it with any UI framework or library you want.

### CORS

As our Storefront Web APIs currently don't support CORS, you will not be able to use the library outside of a BigCommerce store.


## Usage

Below is a guide on how to use this library.


### Initialize instance

First, you have to create a `CheckoutService` instance.

```js
import { createCheckoutService } from '@bigcommerce/checkout-sdk';

const service = createCheckoutService();
```

#### Load checkout

Once you have the instance, you should load the current checkout and present the information to the customer.

```js
const checkoutId = '0cfd6c06-57c3-4e29-8d7a-de55cc8a9052';
const state = await service.loadCheckout(checkoutId);

console.log(state.data.getCheckout());
```

The checkout object contains various information about the checkout process, such as the cart, the grand total etc... Once the data is loaded, you can retrieve it by calling the getters provided by the state object.

```js
console.log(state.data.getCart());
console.log(state.data.getBillingAddress());
console.log(state.data.getShippingAddress());
```

In addition, you can also access the store's checkout configuration. The configuration object contains information about various settings related to checkout, such as the default currency of the store etc...

```js
console.log(state.data.getConfig());
```

### Sign in customer

Before you can collect other checkout information from the customer, you should first ask them to sign in. Once they are signed in, the checkout state will be populated with their personal details, such as their addresses.

```js
const state = await service.signInCustomer({ email: 'foo@bar.com', password: 'password123' });

console.log(state.data.getCustomer());
```

Alternatively, you can ask the customer to continue as a guest.

```js
const state = await service.continueAsGuest({ email: 'foo@bar.com' });

console.log(state.data.getCustomer());
```

### Set shipping details

#### Set shipping address

To set a shipping destination for the checkout, you should ask the customer to provide an address. To do that, you need to render a set of form fields for collecting their details. The set of fields also includes all the custom fields configured by the merchant.

```js
const fields = state.data.getShippingAddressFields();

fields.forEach(field => {
    console.log(field);
});
```

To set the shipping address, you can collate all the address fields and construct a request payload.

```js
const address = {
    firstName: 'Test',
    lastName: 'Tester',
    addressLine1: '12345 Testing Way',
    city: 'Some City',
    provinceCode: 'CA',
    postCode: '95555',
    countryCode: 'US',
    phone: '555-555-5555',
};

const state = await service.updateShippingAddress(address);

console.log(state.data.getShippingAddress());
console.log(state.data.getShippingOptions());
```

#### Set shipping option

Once the address is provided, you can get a list of shipping options available for the address and the cost for each option.

Then, you can ask the customer to select a shipping option from the list.

```js
const address = state.data.getShippingAddress();
const options = state.data.getShippingOptions();
const newState = await service.selectShippingOption(options[address.id].id);

console.log(newState.checkout.getSelectedShippingOption());
```

### Set billing details

In order to complete the checkout process, you also need to collect a billing address from the customer.

```js
const state = await service.updateBillingAddress(address);

console.log(state.data.getBillingAddress());
```

### Apply coupon or gift certificate

You may also want to accept any coupon code or gift certificate provided by the customer.

```js
const state = await service.applyCoupon('COUPON');

console.log(state.data.getOrder().coupon);
```

```js
const state = await service.applyGiftCertificate('GIFT');

console.log(state.data.getOrder().giftCertificate);
```

You can also allow the customer to remove any coupon code or gift certificate previously applied.

```js
await service.removeCoupon('COUPON');
await service.removeGiftCertificate('GIFT');
```

### Submit payment and order

#### Load payment methods

Before you can place the order, you need to collect payment details from the customer. In order to do that, you must first load and present a list of available payment methods to the customer.

```js
const state = await service.loadPaymentMethods();

console.log(state.data.getPaymentMethods());
```

#### Initialize payment method

After that, you should initialize the payment method so they are ready to accept payment details.

```js
await service.initializePayment({ methodId: 'braintree' });
```

Some payment methods require you to provide additional initialization options. For example, Amazon requires a container ID in order to initialize their payment widget. Otherwise, they will not work properly.

```js
await service.initializePayment({
    methodId: 'amazon',
    amazon: {
        container: 'walletWidget',
    },
});
```

#### Submit order

And then, you can ask the customer to provide payment details required by their chosen payment method. If the method is executed successfully, you will create an order and thereby complete the checkout process.

```js
const payment = {
    methodId: 'braintree',
    paymentData: {
        ccExpiry: { month: 10, year: 20 },
        ccName: 'BigCommerce',
        ccNumber: '4111111111111111',
        ccType: 'visa',
        ccCvv: 123,
    },
};

const state = await service.submitOrder({ payment });

console.log(state.getOrder());

window.location.assign('/order-confirmation');
```

If the submission is successful, you should redirect the customer to the order confirmation page.

#### Finalize order

Also, for some payment methods, the customer may be asked to enter their payment details on an external website. For these methods, you must finalize the order when the customer is redirected back to the checkout page in order to complete the checkout flow. This should be done in the background before you present any checkout information to the customer. 

```js
await service.loadCheckout();

try {
    await service.finalizeOrderIfNeeded();

    window.location.assign('/order-confirmation');
} catch (error) {
    if (error.type !== 'order_finalization_not_required') {
        throw error;
    }
}

// Render the checkout view
```

Similarly, if the order finalization is successful, you should redirect the customer to the order confirmation page.

### Load order

Once the order is created, you can make a call to retrieve it. This should be done on the order confirmation page so that you can present the final order to the customer.

```js
const orderId = 123;
const state = await service.loadOrder(orderId);

console.log(state.data.getOrder());
```

### Subscribe to changes

Your UI should react to changes to the checkout state. When there is a change, you should present the latest information to the customer. You can do that by subscribing to the checkout state.

The subscriber gets triggered every time there is a change in the state. If the change affects your view, you should re-render it in order to reflect the latest update. The subscriber provides a state object which you can use to get specific checkout information. It also provides meta information such as loading statuses, error details etc...

```js
service.subscribe(state => {
    // Return the current checkout
    console.log(state.data.getCheckout());

    // Return an error object if unable to load checkout
    console.log(state.errors.getLoadCheckoutError());

    // Return `true` if in the process of loading checkout
    console.log(state.statuses.isLoadingCheckout());
});
```

If you are only interested in certain parts of the state, you can filter out irrelevant changes by providing a filter function to the subscriber.

```js
const filter = state => state.data.getCart();

service.subscribe(state => {
    console.log(state.data.getCart())
}, filter);
```

You can retrieve the same state object outside of a subscriber if there is a need for it.

```js
const state = service.getState();

console.log(state);
```

### Cancel requests

If you need to cancel a request before it is complete, you can provide a `Timeout` object when making the request. An example use case might be to implement a UI that updates the shipping address whenever there is a change - so you want to abort any pending requests and only take the latest one.

```js
import { createTimeout } from '@bigcommerce/checkout-js-sdk';

const address = { countryCode: 'US' };
const timeout = createTimeout();

service.updateShippingAddress(address, { timeout });
timeout.complete(); // Aborts the update
```


## API reference

You can learn more about the API by reading the [API reference](docs/README.md).


## See also

* [Example app](https://github.com/bigcommerce/checkout-sdk-js-example) - A sample checkout app written in React.
* [Storefront APIs](https://developer.bigcommerce.com/api/v3/storefront.html) - The documentation for Storefront Checkout & Cart Web APIs.


## Notes

* If you are using this library on the checkout page of a Stencil theme, you must have [Optimized One Page Checkout](https://support.bigcommerce.com/articles/Public/Optimized-Single-Page-Checkout/) enabled. Otherwise, you will not be able to preview your changes.
* You should only use this library on a HTTPS page unless you are developing locally.
* In order to keep up to date on the latest changes, please subscribe to this repository by clicking on the [watch](https://github.com/bigcommerce/checkout-sdk-js/subscription) button.


## Contribution

We actively maintain and add new features to the library in order to support our official checkout (Optimized Checkout). But we also accept contributions from the community.

If you want to contribute, please refer to the [contribution guide](CONTRIBUTING.md).


## License

MIT
