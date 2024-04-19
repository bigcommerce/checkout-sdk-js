export interface AdditionalActionRequired {
    additional_action_required: {
        data: {
            redirect_url: string;
        };
        type: string;
    };
    status: string;
}

export function isAdditionalActionRequired(value: unknown): value is AdditionalActionRequired {
    return typeof value === 'object' && value !== null && 'additional_action_required' in value;
}
