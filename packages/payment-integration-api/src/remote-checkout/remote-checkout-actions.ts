export enum RemoteCheckoutActionType {
    ForgetCheckoutRemoteCustomerRequested = 'FORGET_CHECKOUT_REMOTE_CUSTOMER_REQUESTED',
    ForgetCheckoutRemoteCustomerSucceeded = 'FORGET_CHECKOUT_REMOTE_CUSTOMER_SUCCEEDED',
    ForgetCheckoutRemoteCustomerFailed = 'FORGET_CHECKOUT_REMOTE_CUSTOMER_FAILED',

    InitializeRemoteBillingRequested = 'INITIALIZE_REMOTE_BILLING_REQUESTED',
    InitializeRemoteBillingSucceeded = 'INITIALIZE_REMOTE_BILLING_SUCCEEDED',
    InitializeRemoteBillingFailed = 'INITIALIZE_REMOTE_BILLING_FAILED',

    InitializeRemoteShippingRequested = 'INITIALIZE_REMOTE_SHIPPING_REQUESTED',
    InitializeRemoteShippingSucceeded = 'INITIALIZE_REMOTE_SHIPPING_SUCCEEDED',
    InitializeRemoteShippingFailed = 'INITIALIZE_REMOTE_SHIPPING_FAILED',

    InitializeRemotePaymentRequested = 'INITIALIZE_REMOTE_PAYMENT_REQUESTED',
    InitializeRemotePaymentSucceeded = 'INITIALIZE_REMOTE_PAYMENT_SUCCEEDED',
    InitializeRemotePaymentFailed = 'INITIALIZE_REMOTE_PAYMENT_FAILED',

    LoadRemoteSettingsRequested = 'LOAD_REMOTE_SETTINGS_REQUESTED',
    LoadRemoteSettingsSucceeded = 'LOAD_REMOTE_SETTINGS_SUCCEEDED',
    LoadRemoteSettingsFailed = 'LOAD_REMOTE_SETTINGS_FAILED',

    SignOutRemoteCustomerRequested = 'SIGN_OUT_REMOTE_CUSTOMER_REQUESTED',
    SignOutRemoteCustomerSucceeded = 'SIGN_OUT_REMOTE_CUSTOMER_SUCCEEDED',
    SignOutRemoteCustomerFailed = 'SIGN_OUT_REMOTE_CUSTOMER_FAILED',

    UpdateRemoteCheckout = 'UPDATE_REMOTE_CHECKOUT',
}
