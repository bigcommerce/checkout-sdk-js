import { RequireAtLeastOne } from '../util-types';

type CustomerStrategyResolveId = RequireAtLeastOne<{
    id?: string;
    gateway?: string;
}>;

export default CustomerStrategyResolveId;
