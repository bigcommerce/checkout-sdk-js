import { Config } from '../config';
import { Extension } from '../extension';
import { FormFields } from '../form';

import Checkout from './checkout';

export default interface CheckoutInitialState {
    config: Config;
    formFields: FormFields;
    checkout: Checkout;
    extensions: Extension[];
}
