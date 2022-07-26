import { PaymentInitializeOptions as PaymentInitializeOptionsV2 } from '../generated/payment-initialize-options'

import { PaymentInitializeOptions as PaymentInitializeOptionsV1 } from './payment-request-options';

export type PaymentInitializeOptions = PaymentInitializeOptionsV2 & PaymentInitializeOptionsV1;
