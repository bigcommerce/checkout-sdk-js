declare namespace WePay {
    interface Risk {
        generate_risk_token(): void;
        get_risk_token(): string;
    }
}
