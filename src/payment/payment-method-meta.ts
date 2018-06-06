export default interface PaymentMethodMeta {
    request: {
        deviceSessionId: string;
        geoCountryCode: string;
        sessionHash: string;
    };
}
