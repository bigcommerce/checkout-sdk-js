import createFreezeProxy, { createFreezeProxies } from './create-freeze-proxy';

class Foobar {
    protected _data: any;

    constructor(data = {}) {
        this._data = data;
    }

    getData() {
        return this._data;
    }

    getName() {
        return this._data.name;
    }
}

// tslint:disable-next-line:max-classes-per-file
class ExtendedFoobar extends Foobar {
    getExtendedData() {
        return {
            ...this._data,
            extended: true,
        };
    }
}

describe('createFreezeProxy()', () => {
    it('freezes return value of methods', () => {
        const foobar = new Foobar({ name: 'foobar' });
        const proxy = createFreezeProxy(foobar);

        expect(Object.isFrozen(foobar.getData())).toEqual(false);
        expect(Object.isFrozen(proxy.getData())).toEqual(true);
    });

    it('freezes return value of inherited methods', () => {
        const proxy = createFreezeProxy(new ExtendedFoobar({ name: 'foobar' }));

        expect(Object.isFrozen(proxy.getData())).toEqual(true);
        expect(Object.isFrozen(proxy.getExtendedData())).toEqual(true);
    });

    it('ignores primitive return value', () => {
        const proxy = createFreezeProxy(new Foobar({ name: 'foobar' }));

        expect(proxy.getName()).toEqual('foobar');
    });
});

describe('createFreezeProxies()', () => {
    it('freezes return value of methods of all objects', () => {
        const foobar = new Foobar({ name: 'foobar' });
        const extendedFoobar = new ExtendedFoobar({ name: 'extended_foobar' });
        const proxy = createFreezeProxies({ extendedFoobar, foobar });

        expect(Object.isFrozen(foobar.getData())).toEqual(false);
        expect(Object.isFrozen(extendedFoobar.getData())).toEqual(false);
        expect(Object.isFrozen(proxy.foobar.getData())).toEqual(true);
        expect(Object.isFrozen(proxy.extendedFoobar.getData())).toEqual(true);
    });
});
