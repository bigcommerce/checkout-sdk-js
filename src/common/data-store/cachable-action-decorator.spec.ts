import { createAction, Action } from '@bigcommerce/data-store';
import { concat, from, Observable } from 'rxjs';
import { map, toArray } from 'rxjs/operators';

import ActionOptions from './action-options';
import { default as cachableAction } from './cachable-action-decorator';

describe('cachableActionDecorator()', () => {
    class Foo {
        constructor(
            private _fetch: (name: string) => Promise<string>
        ) {}

        @cachableAction
        loadMessage(name: string, options?: ActionOptions): Observable<Action> {
            return from(this._fetch(name))
                .pipe(map(response => createAction('GET_MESSAGE', response)));
        }

        @cachableAction
        loadUppercaseMessage(name: string, options?: ActionOptions): Observable<Action> {
            return from(this._fetch(name))
                .pipe(map(response => createAction('GET_UPPERCASE_MESSAGE', response.toUpperCase())));
        }
    }

    let fetch: (name: string) => Promise<string>;
    let foo: Foo;

    beforeEach(() => {
        fetch = jest.fn(name => Promise.resolve(`Hello ${name}`));
        foo = new Foo(fetch);
    });

    it('returns cached action if `useCache` option is true', async () => {
        const actions = await concat(
            foo.loadMessage('Foo', { useCache: true }),
            foo.loadMessage('Foo', { useCache: true })
        )
            .pipe(toArray())
            .toPromise();

        expect(fetch).toHaveBeenCalledTimes(1);
        expect(actions).toEqual([
            createAction('GET_MESSAGE', 'Hello Foo'),
            createAction('GET_MESSAGE', 'Hello Foo'),
        ]);
    });

    it('returns cached action based on parameters', async () => {
        const actions = await concat(
            foo.loadMessage('Foo', { useCache: true }),
            foo.loadMessage('Bar', { useCache: true }),
            foo.loadMessage('Foo', { useCache: true }),
            foo.loadMessage('Bar', { useCache: true })
        )
            .pipe(toArray())
            .toPromise();

        expect(fetch).toHaveBeenCalledTimes(2);
        expect(actions).toEqual([
            createAction('GET_MESSAGE', 'Hello Foo'),
            createAction('GET_MESSAGE', 'Hello Bar'),
            createAction('GET_MESSAGE', 'Hello Foo'),
            createAction('GET_MESSAGE', 'Hello Bar'),
        ]);
    });

    it('can augment multiple methods of class', async () => {
        const actions = await concat(
            foo.loadMessage('Foo', { useCache: true }),
            foo.loadMessage('Foo', { useCache: true }),
            foo.loadUppercaseMessage('Foo', { useCache: true }),
            foo.loadUppercaseMessage('Foo', { useCache: true })
        )
            .pipe(toArray())
            .toPromise();

        expect(fetch).toHaveBeenCalledTimes(2);
        expect(actions).toEqual([
            createAction('GET_MESSAGE', 'Hello Foo'),
            createAction('GET_MESSAGE', 'Hello Foo'),
            createAction('GET_UPPERCASE_MESSAGE', 'HELLO FOO'),
            createAction('GET_UPPERCASE_MESSAGE', 'HELLO FOO'),
        ]);
    });

    it('returns non-cached action if `useCache` option is omitted or false', async () => {
        const actions = await concat(
            foo.loadMessage('Foo'),
            foo.loadMessage('Foo')
        )
            .pipe(toArray())
            .toPromise();

        expect(fetch).toHaveBeenCalledTimes(2);
        expect(actions).toEqual([
            createAction('GET_MESSAGE', 'Hello Foo'),
            createAction('GET_MESSAGE', 'Hello Foo'),
        ]);
    });
});
