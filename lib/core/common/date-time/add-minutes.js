"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function addMinutes(date, amount) {
    var newDate = new Date(date.getTime());
    newDate.setMinutes(date.getMinutes() + amount);
    return newDate;
}
exports.default = addMinutes;
//# sourceMappingURL=add-minutes.js.map