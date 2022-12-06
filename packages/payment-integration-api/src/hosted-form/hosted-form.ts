import { OrderPaymentRequestBody } from '../order';
import { PaymentAdditionalAction } from '../payment';

import { HostedInputSubmitSuccessEvent } from './hosted-input-events';

export interface HostedForm {
    attach(): Promise<void>;
    detach(): void;
    getBin(): string | undefined;
    getCardType(): string | undefined;
    submit(
        payload: OrderPaymentRequestBody,
        additionalActionData?: PaymentAdditionalAction,
    ): Promise<HostedInputSubmitSuccessEvent>;
    validate(): Promise<void>;
}
