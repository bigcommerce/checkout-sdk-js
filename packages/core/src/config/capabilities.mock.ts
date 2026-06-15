import { PartialDeep } from '../common/types';

import { Capabilities } from './capabilities';

export function getCapabilities(capabilities: PartialDeep<Capabilities> = {}): Capabilities {
    return capabilities as Capabilities;
}
