export default interface AdditionalAction {
    type: string;
    data: AdditionalActionData;
}

export type AdditionalActionData = (
    CardingProtectionActionData
);

export interface CardingProtectionActionData {
    human_verification_token?: string;
}
