# BigCommerce Checkout JavaScript SDK

## Usage

```js
// Import the library
import { createCheckoutService } from 'checkout-sdk';

// Create an instance (As a temporary solution, we need to manually pass in the configuration object)
const checkoutService = createCheckoutService({ config: window.checkoutConfig });

// Load checkout data
checkoutService.loadCheckout();

// Subscribe to data changes
checkoutService.subscribe(({ checkout }) => {
    console.log(checkout.getCart());
});
```

## Example

Please refer to [this example](https://github.com/bigcommerce/cornerstone/compare/master...davidchin:checkout_sdk_demo).

## API

Please refer to [this page](docs/README.md).
