import { DataStore } from '@bigcommerce/data-store';

import CheckoutSelectors from './checkout-selectors';

type CheckoutStore = DataStore<CheckoutSelectors>;

export default CheckoutStore;
