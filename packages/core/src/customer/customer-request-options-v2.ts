import { CustomerInitializeOptions as CustomerInitializeOptionsV2 } from '../generated/customer-initialize-options'

import { CustomerInitializeOptions as CustomerInitializeOptionsV1 } from './customer-request-options';

export type CustomerInitializeOptions = CustomerInitializeOptionsV2 & CustomerInitializeOptionsV1;
