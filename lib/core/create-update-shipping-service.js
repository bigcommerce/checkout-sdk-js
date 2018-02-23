"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var shipping_1 = require("./shipping");
function createUpdateShippingService(store, client) {
    return new shipping_1.UpdateShippingService(store, new shipping_1.ShippingAddressActionCreator(client), new shipping_1.ShippingOptionActionCreator(client), new shipping_1.ShippingActionCreator());
}
exports.default = createUpdateShippingService;
//# sourceMappingURL=create-update-shipping-service.js.map