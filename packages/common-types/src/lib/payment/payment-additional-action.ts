export default interface PaymentAdditionalAction {
    type: string;
    data: CardingProtectionActionData;
}

export interface CardingProtectionActionData {
    human_verification_token?: string;
}
