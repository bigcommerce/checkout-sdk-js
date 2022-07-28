import { CheckoutButtonInitializeOptions as CheckoutButtonInitializeOptionsV2 } from '../generated/checkout-button-initialize-options'

import { CheckoutButtonInitializeOptions as CheckoutButtonInitializeOptionsV1 } from './checkout-button-options';

export type CheckoutButtonInitializeOptions = CheckoutButtonInitializeOptionsV2 & CheckoutButtonInitializeOptionsV1;
