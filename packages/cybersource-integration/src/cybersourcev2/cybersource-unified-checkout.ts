// TODO: Verify exact SDK API against Cybersource Unified Checkout V1 documentation
// Reference: https://developer.cybersource.com/unified-checkout/sdk-guide (requires access)

export interface UnifiedCheckoutSDK {
    setup(options: UnifiedCheckoutSetupOptions): void;
    createTransientToken(): Promise<string>;
    teardown(): void;
}

export interface UnifiedCheckoutWindow extends Window {
    UnifiedCheckout?: UnifiedCheckoutSDK;
}

export interface UnifiedCheckoutSetupOptions {
    captureContext: string;
    targetId: string;
}
