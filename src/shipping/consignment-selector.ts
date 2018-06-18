import { selector } from '../common/selector';

import Consignment from './consignment';
import ConsignmentState from './consignment-state';

@selector
export default class ConsignmentSelector {
    constructor(
        private _consignments: ConsignmentState
    ) {}

    getConsignments(): Consignment[] | undefined {
        return this._consignments.data;
    }

    getLoadError(): Error | undefined {
        return this._consignments.errors.loadError;
    }

    getCreateError(): Error | undefined {
        return this._consignments.errors.createError;
    }

    getUpdateError(): Error | undefined {
        return this._consignments.errors.updateError;
    }

    isLoading(): boolean {
        return this._consignments.statuses.isLoading === true;
    }

    isCreating(): boolean {
        return this._consignments.statuses.isCreating === true;
    }

    isUpdating(): boolean {
        return this._consignments.statuses.isUpdating === true;
    }
}
