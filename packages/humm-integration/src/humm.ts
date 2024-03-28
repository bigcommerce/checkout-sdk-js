export interface OffsiteRedirectResponse {
    body: {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        additional_action_required: {
            type: 'offsite_redirect';
            data: {
                // eslint-disable-next-line @typescript-eslint/naming-convention
                redirect_url: string;
            };
        };
        status: string;
        // eslint-disable-next-line @typescript-eslint/naming-convention
        provider_data: string;
    };
}

export interface HummInitializationData {
    processable: boolean;
}
