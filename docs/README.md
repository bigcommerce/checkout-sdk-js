@bigcommerce/checkout-sdk

# @bigcommerce/checkout-sdk

## Table of contents

### Modules

- [&lt;internal\&gt;](modules/internal_.md)

### Functions

- [createCheckoutButtonInitializer](README.md#createcheckoutbuttoninitializer)

## Functions

### createCheckoutButtonInitializer

▸ **createCheckoutButtonInitializer**(`options?`): [`CheckoutButtonInitializer`](classes/internal_.CheckoutButtonInitializer.md)

Creates an instance of `CheckoutButtonInitializer`.

**`remarks`** ```js
const initializer = createCheckoutButtonInitializer();

initializer.initializeButton({
    methodId: 'braintreepaypal',
    braintreepaypal: {
        container: '#checkoutButton',
    },
});
```

Please note that `CheckoutButtonInitializer` is currently in an early stage
of development. Therefore the API is unstable and not ready for public
consumption.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `options?` | [`CheckoutButtonInitializerOptions`](interfaces/internal_.CheckoutButtonInitializerOptions.md) | A set of construction options. |

#### Returns

[`CheckoutButtonInitializer`](classes/internal_.CheckoutButtonInitializer.md)

an instance of `CheckoutButtonInitializer`.
