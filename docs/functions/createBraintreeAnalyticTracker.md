[**@bigcommerce/checkout-sdk**](../README.md)

***

[@bigcommerce/checkout-sdk](../README.md) / createBraintreeAnalyticTracker

# Function: createBraintreeAnalyticTracker()

> **createBraintreeAnalyticTracker**(`checkoutService`): [`BraintreeAnalyticTrackerService`](../interfaces/BraintreeAnalyticTrackerService.md)

Creates an instance of `BraintreeAnalyticTrackerService`.

## Parameters

### checkoutService

[`CheckoutService`](../classes/CheckoutService.md)

## Returns

[`BraintreeAnalyticTrackerService`](../interfaces/BraintreeAnalyticTrackerService.md)

an instance of `BraintreeAnalyticTrackerService`.

## Remarks

```js
const checkoutService = createCheckoutService();
await checkoutService.loadCheckout();
const braintreeAnalyticTracker = createBraintreeAnalyticTracker(checkoutService);

braintreeAnalyticTracker.customerPaymentMethodExecuted();
braintreeAnalyticTracker.paymentComplete();
braintreeAnalyticTracker.selectedPaymentMethod('applepay');
braintreeAnalyticTracker.walletButtonClick('paypal');
```
