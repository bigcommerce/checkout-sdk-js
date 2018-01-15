import { StandardError } from '../../common/error/errors';

export default class OrderFinalizationNotRequiredError extends StandardError {
    /**
     * @constructor
     */
    constructor() {
        super('The current order does not need to be finalized at this stage.');

        this.type = 'order_finalization_not_required';
    }
}
