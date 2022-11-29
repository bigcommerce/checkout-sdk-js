import { RequireAtLeastOne } from '../util-types';

type CheckoutButtonStrategyResolveId = RequireAtLeastOne<{
    id?: string;
    gateway?: string;
}>;

export default CheckoutButtonStrategyResolveId;
