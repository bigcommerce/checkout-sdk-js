export default class FormSelector {
    /**
     * @constructor
     * @param {ConfigState} config
     */
    constructor(config = {}) {
        this._config = config.data;
    }

    /**
     * @return {Field[]}
     */
    getShippingAddressFields() {
        return this._config.storeConfig.formFields.shippingAddressFields;
    }

    /**
     * @return {Field[]}
     */
    getBillingAddressFields() {
        return this._config.storeConfig.formFields.billingAddressFields;
    }
}
