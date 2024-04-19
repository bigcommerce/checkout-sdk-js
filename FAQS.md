# FAQs
- [Can I use both the Checkout SDK and BigCommerce APIs?](#can-i-use-both-the-checkout-sdk-and-bigcommerce-apis-)
- [Does the order of the actions matter?](#does-the-order-of-the-actions-matter-)

## Can I use both the Checkout SDK and BigCommerce APIs?
Concurrent requests can have unexpected results due to possible race conditions. When multiple actions are triggered by the Checkout SDK, they are enqueued so they run sequentially. If you are planning to interact with other BigCommerce APIs directly, make sure they are not concurrent.

## Does the order of the actions matter?
The order of the actions can have side effects. For example if the shipping method has already been selected, a few actions can clear out the selection, like modifying the cart or applying certain coupon codes.
