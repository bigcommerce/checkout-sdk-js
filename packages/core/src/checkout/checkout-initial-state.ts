import { B2BApiSettings, Config } from '../config';
import { Extension } from '../extension';
import { ExtraFields, FormFields } from '../form';

import Checkout from './checkout';

export default interface CheckoutInitialState {
    config?: Config;
    formFields?: FormFields;
    checkout?: Checkout;
    extensions?: Extension[];
    extraFields?: ExtraFields;
    b2bApiSettings?: B2BApiSettings;
}
