export default interface WepayRisk {
    generate_risk_token(): void;
    get_risk_token(): string;
}
