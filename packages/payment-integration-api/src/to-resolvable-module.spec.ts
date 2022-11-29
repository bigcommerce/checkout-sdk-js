import toResolvableModule from './to-resolvable-module';

describe('toResolvableModule', () => {
    it('attaches resolveIds property to the input', () => {
        const module = {};

        toResolvableModule(module, [{ id: 1 }]);

        expect('resolveIds' in module).toBe(true);
    });
});
