"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var omit_private_1 = require("./omit-private");
describe('omitPrivate()', function () {
    it('omits private properties recursively', function () {
        var object = {
            $$key: 'abc',
            _key: 'abc',
            id: 1,
            items: [
                { $$key: 'abc', id: 2 },
                { _key: 'abc', id: 3 },
            ],
        };
        var expected = {
            id: 1,
            items: [
                { id: 2 },
                { id: 3 },
            ],
        };
        expect(omit_private_1.default(object)).toEqual(expected);
    });
});
//# sourceMappingURL=omit-private.spec.js.map