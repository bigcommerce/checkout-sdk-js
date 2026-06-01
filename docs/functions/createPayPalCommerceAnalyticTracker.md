[**@bigcommerce/checkout-sdk**](../README.md)

***

[@bigcommerce/checkout-sdk](../README.md) / createPayPalCommerceAnalyticTracker

# Function: createPayPalCommerceAnalyticTracker()

> **createPayPalCommerceAnalyticTracker**(`checkoutService`): [`PayPalCommerceAnalyticTrackerService`](../interfaces/PayPalCommerceAnalyticTrackerService.md)

Creates an instance of `PayPalCommerceAnalyticTrackerService`.

## Parameters

### checkoutService

[`CheckoutService`](../classes/CheckoutService.md)

## Returns

[`PayPalCommerceAnalyticTrackerService`](../interfaces/PayPalCommerceAnalyticTrackerService.md)

an instance of `PayPalCommerceAnalyticTrackerService`.

## Remarks

```js
const checkoutService = createCheckoutService();
await checkoutService.loadCheckout();
const paypalCommerceAnalyticTracker = createPayPalCommerceAnalyticTracker(checkoutService);

paypalCommerceAnalyticTracker.customerPaymentMethodExecuted();
paypalCommerceAnalyticTracker.paymentComplete();
paypalCommerceAnalyticTracker.selectedPaymentMethod('applepay');
paypalCommerceAnalyticTracker.walletButtonClick('paypal');
```
