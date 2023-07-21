import { RequireAtLeastOne } from '../util-types';

type ShippingStrategyResolveId = RequireAtLeastOne<{
    id?: string;
    gateway?: string;
}>;

export default ShippingStrategyResolveId;
