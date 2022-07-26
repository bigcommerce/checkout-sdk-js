import { RequireAtLeastOne } from '../util-types';

type PaymentStrategyResolveId = RequireAtLeastOne<{
    id?: string;
    gateway?: string;
    type?: string;
}>;

export default PaymentStrategyResolveId;
