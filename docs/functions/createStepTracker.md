[**@bigcommerce/checkout-sdk**](../README.md)

***

[@bigcommerce/checkout-sdk](../README.md) / createStepTracker

# Function: createStepTracker()

> **createStepTracker**(`checkoutService`, `stepTrackerConfig?`): [`StepTracker`](../interfaces/StepTracker.md)

Creates an instance of `StepTracker`.

## Parameters

### checkoutService

[`CheckoutService`](../classes/CheckoutService.md)

### stepTrackerConfig?

[`StepTrackerConfig`](../interfaces/StepTrackerConfig.md)

## Returns

[`StepTracker`](../interfaces/StepTracker.md)

an instance of `StepTracker`.

## Remarks

```js
const checkoutService = createCheckoutService();
await checkoutService.loadCheckout();
const stepTracker = createStepTracker(checkoutService);

stepTracker.trackCheckoutStarted();
```
