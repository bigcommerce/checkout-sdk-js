# net-terms-integration

Net Terms payment strategy for the BigCommerce Checkout SDK.

Net Terms is an offline-style payment method (`type: 'PAYMENT_TYPE_OFFLINE'`, `id: 'net_terms'`)
returned by `/api/storefront/payments`. It behaves like other offline methods — there is no
separate payment (BigPay) call — but it captures a **PO Number** that must be forwarded to the
backend with the submit order request.

Unlike the generic offline strategy, `NetTermsPaymentStrategy` preserves `payment.paymentData`
when calling `submitOrder`, so the PO Number (`paymentData.poNumber`) is included in the order
request body. A successful submit order progresses the shopper to the order confirmation page.
