[@bigcommerce/checkout-sdk](../README.md) / BigCommercePaymentsAlternativeMethodsPaymentInitializeOptions

# Interface: BigCommercePaymentsAlternativeMethodsPaymentInitializeOptions

A set of options that are required to initialize the BigCommercePayments payment
method for presenting its PayPal button.

Also, BCP (also known as BigCommercePayments) requires specific options to initialize the PayPal Smart Payment Button on checkout page that substitutes a standard submit button
```html
<!-- This is where the APM button will be inserted -->
<div id="container"></div>
<!-- This is where the alternative payment methods fields will be inserted.  -->
<div id="apm-fields-container"></div>
```

```js
service.initializePayment({
    gatewayId: 'bigcommerce_payments_apms',
    methodId: 'sepa',
    bigcommerce_payments_apms: {
        container: '#container',
        apmFieldsContainer: '#apm-fields-container',
        apmFieldsStyles: {
            base: {
                backgroundColor: 'transparent',
            },
            input: {
                backgroundColor: 'white',
                fontSize: '1rem',
                color: '#333',
                borderColor: '#d9d9d9',
                borderRadius: '4px',
                borderWidth: '1px',
                padding: '1rem',
            },
            invalid: {
                color: '#ed6a6a',
            },
            active: {
                color: '#4496f6',
            },
        },
        clientId: 'YOUR_CLIENT_ID',
// Callback for submitting payment form that gets called when a buyer approves payment
        submitForm: () => {
        // Example function
            this.submitOrder(
               {
                  payment: { methodId: 'bigcommerce_payments_apms', }
              }
           );
        },
// Callback is used to define the state of the payment form, validate if it is applicable for submit.
        onValidate: (resolve, reject) => {
        // Example function
            const isValid = this.validatePaymentForm();
            if (isValid) {
                return resolve();
            }
            return reject();
        },
// Callback that is called right before render of a Smart Payment Button. It gets called when a buyer is eligible for use of the particular PayPal method. This callback can be used to hide the standard submit button.
        onRenderButton: () => {
        // Example function
            this.hidePaymentSubmitButton();
        }
    },
});
```

## Table of contents

### Properties

- [apmFieldsContainer](BigCommercePaymentsAlternativeMethodsPaymentInitializeOptions.md#apmfieldscontainer)
- [apmFieldsStyles](BigCommercePaymentsAlternativeMethodsPaymentInitializeOptions.md#apmfieldsstyles)
- [container](BigCommercePaymentsAlternativeMethodsPaymentInitializeOptions.md#container)

### Methods

- [onError](BigCommercePaymentsAlternativeMethodsPaymentInitializeOptions.md#onerror)
- [onInitButton](BigCommercePaymentsAlternativeMethodsPaymentInitializeOptions.md#oninitbutton)
- [onRenderButton](BigCommercePaymentsAlternativeMethodsPaymentInitializeOptions.md#onrenderbutton)
- [onValidate](BigCommercePaymentsAlternativeMethodsPaymentInitializeOptions.md#onvalidate)
- [submitForm](BigCommercePaymentsAlternativeMethodsPaymentInitializeOptions.md#submitform)

## Properties

### apmFieldsContainer

• `Optional` **apmFieldsContainer**: `string`

The CSS selector of a container where the alternative payment methods fields widget should be inserted into.
It's necessary to specify this parameter when using Alternative Payment Methods.
Without it alternative payment methods will not work.

___

### apmFieldsStyles

• `Optional` **apmFieldsStyles**: [`BigCommercePaymentsFieldsStyleOptions`](BigCommercePaymentsFieldsStyleOptions.md)

Object with styles to customize alternative payment methods fields.

___

### container

• **container**: `string`

The CSS selector of a container where the payment widget should be inserted into.

## Methods

### onError

▸ `Optional` **onError**(`error`): `void`

A callback for displaying error popup. This callback requires error object as parameter.

#### Parameters

| Name | Type |
| :------ | :------ |
| `error` | `unknown` |

#### Returns

`void`

___

### onInitButton

▸ **onInitButton**(`actions`): `Promise`<`void`\>

A callback that gets called
when Smart Payment Button is initialized.

#### Parameters

| Name | Type |
| :------ | :------ |
| `actions` | [`InitCallbackActions`](InitCallbackActions.md) |

#### Returns

`Promise`<`void`\>

___

### onRenderButton

▸ `Optional` **onRenderButton**(): `void`

A callback right before render Smart Payment Button that gets called when
Smart Payment Button is eligible. This callback can be used to hide the standard submit button.

#### Returns

`void`

___

### onValidate

▸ **onValidate**(`resolve`, `reject`): `Promise`<`void`\>

A callback that gets called when a buyer click on Smart Payment Button
and should validate payment form.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `resolve` | () => `void` | A function, that gets called if form is valid. |
| `reject` | () => `void` | A function, that gets called if form is not valid. |

#### Returns

`Promise`<`void`\>

reject() or resolve()

___

### submitForm

▸ **submitForm**(): `void`

A callback for submitting payment form that gets called
when buyer approved PayPal account.

#### Returns

`void`
