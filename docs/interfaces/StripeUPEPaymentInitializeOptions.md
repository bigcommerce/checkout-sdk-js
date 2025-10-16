[@bigcommerce/checkout-sdk](../README.md) / StripeUPEPaymentInitializeOptions

# Interface: StripeUPEPaymentInitializeOptions

A set of options that are required to initialize the Stripe payment method.

Once Stripe payment is initialized, credit card form fields, provided by the
payment provider as iframes, will be inserted into the current page. These
options provide a location and styling for each of the form fields.

```html
<!-- This is where the credit card component will be inserted -->
<div id="container"></div>
```

```js
service.initializePayment({
    methodId: 'stripeupe',
    stripeupe {
        containerId: 'container',
    },
});
```

## Hierarchy

- `default`

  ↳ **`StripeUPEPaymentInitializeOptions`**

## Table of contents

### Properties

- [containerId](StripeUPEPaymentInitializeOptions.md#containerid)
- [style](StripeUPEPaymentInitializeOptions.md#style)

### Methods

- [initStripeElementUpdateTrigger](StripeUPEPaymentInitializeOptions.md#initstripeelementupdatetrigger)
- [onError](StripeUPEPaymentInitializeOptions.md#onerror)
- [render](StripeUPEPaymentInitializeOptions.md#render)

## Properties

### containerId

• **containerId**: `string`

The location to insert the credit card number form field.

#### Overrides

StripePaymentInitializeOptions.containerId

___

### style

• `Optional` **style**: `Record`<`string`, `StripeAppearanceValues`\>

Checkout styles from store theme

#### Overrides

StripePaymentInitializeOptions.style

## Methods

### initStripeElementUpdateTrigger

▸ `Optional` **initStripeElementUpdateTrigger**(`updateTriggerFn`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `updateTriggerFn` | (`payload`: `StripeElementUpdateOptions`) => `void` |

#### Returns

`void`

___

### onError

▸ `Optional` **onError**(`error?`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `error?` | `Error` |

#### Returns

`void`

#### Overrides

StripePaymentInitializeOptions.onError

___

### render

▸ **render**(): `void`

#### Returns

`void`

#### Overrides

StripePaymentInitializeOptions.render
