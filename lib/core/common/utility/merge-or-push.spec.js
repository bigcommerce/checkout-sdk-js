"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var merge_or_push_1 = require("./merge-or-push");
describe('mergeOrPush()', function () {
    it('replaces primitive value in target array if found in array', function () {
        var array = [1, 2, 3, 4, 5];
        var expected = [1, 2, 'a', 4, 5];
        expect(merge_or_push_1.default(array, 'a', function (value) { return value === 3; })).toEqual(expected);
    });
    it('merges input object in target array if found in array', function () {
        var array = [{ id: 1, name: 'one' }, { id: 2, name: 'two' }, { id: 3, name: 'three' }];
        var expected = [{ id: 1, name: 'ONE' }, { id: 2, name: 'two' }, { id: 3, name: 'three' }];
        expect(merge_or_push_1.default(array, { id: 1, name: 'ONE' }, { id: 1 })).toEqual(expected);
    });
    it('replaces input array in target array if found in array', function () {
        var array = [[1], [1, 2], [1, 2, 3]];
        var expected = [[1], ['a'], [1, 2, 3]];
        expect(merge_or_push_1.default(array, ['a'], function (item) { return item.length === 2; })).toEqual(expected);
    });
    it('pushes primitive value to target array if not found in array', function () {
        var array = [1, 2, 3, 4, 5];
        var expected = [1, 2, 3, 4, 5, 'a'];
        expect(merge_or_push_1.default(array, 'a', function (value) { return value === 6; })).toEqual(expected);
    });
    it('pushes input object to target array if not found in array', function () {
        var array = [{ id: 1, name: 'one' }, { id: 2, name: 'two' }, { id: 3, name: 'three' }];
        var expected = [{ id: 1, name: 'one' }, { id: 2, name: 'two' }, { id: 3, name: 'three' }, { id: 4, name: 'ONE' }];
        expect(merge_or_push_1.default(array, { id: 4, name: 'ONE' }, { id: 4 })).toEqual(expected);
    });
    it('pushes input array to target array if not found in array', function () {
        var array = [[1], [1, 2], [1, 2, 3]];
        var expected = [[1], [1, 2], [1, 2, 3], ['a', 'b']];
        expect(merge_or_push_1.default(array, ['a', 'b'], function (item) { return item.length === 4; })).toEqual(expected);
    });
});
//# sourceMappingURL=merge-or-push.spec.js.map