/**
 * @param {Function} target
 * @param {Function|Object} mixins
 * @return {void}
 */
export default function applyMixin(target, ...mixins) {
    mixins.forEach(mixin => {
        const methods = mixin.prototype || mixin;

        Object.getOwnPropertyNames(methods).forEach(name => {
            target.prototype[name] = methods[name];
        });
    });
}
