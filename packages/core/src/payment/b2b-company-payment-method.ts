export default interface B2BCompanyPaymentMethod {
    /**
     * Method code as stored by B2B Edition (e.g. "cheque", "stripev3",
     * "qbmsv2"). Storefront consumers intersect this against the BC payment
     * list to build the company allow-list.
     */
    code: string;

    /**
     * Display name from the B2B registry. Informational only.
     */
    name: string;

    /**
     * Normalised from the upstream `'1' | '0'` string. Consumers should never
     * see the raw string form.
     */
    isEnabled: boolean;

    /**
     * B2B Edition's internal payment id. Useful for refresh / debugging.
     */
    paymentId: number;
}
