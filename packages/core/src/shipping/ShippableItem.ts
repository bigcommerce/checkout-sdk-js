import { PhysicalItem } from '../cart';

import { Consignment } from './index';

export default interface ShippableItem extends PhysicalItem {
    consignment?: Consignment;
    key: string;
}
