"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var omit_deep_1 = require("./omit-deep");
describe('omitDeep()', function () {
    it('omits nested properties', function () {
        var object = {
            $$key: 'abc',
            id: 1,
            items: [
                { $$key: 'abc', id: 2 },
                { $$key: 'abc', id: 3 },
            ],
        };
        var expected = {
            id: 1,
            items: [
                { id: 2 },
                { id: 3 },
            ],
        };
        expect(omit_deep_1.default(object, function (value, key) { return key === '$$key'; })).toEqual(expected);
    });
});
//# sourceMappingURL=omit-deep.spec.js.map