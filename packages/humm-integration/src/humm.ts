/* eslint-disable @typescript-eslint/naming-convention */
export interface OffsiteRedirectResponse {
    body: {
        additional_action_required: {
            type: 'offsite_redirect';
            data: {
                redirect_url: string;
            };
        };
        status: string;
        provider_data: string;
    };
}

export interface HummInitializationData {
    processable: boolean;
}
