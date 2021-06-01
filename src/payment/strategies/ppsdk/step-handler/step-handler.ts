import { PaymentsAPIResponse } from '../ppsdk-payments-api-response';

export const stepHandler = (_stepResponse: PaymentsAPIResponse): Promise<void> => {
    return Promise.resolve();
};
