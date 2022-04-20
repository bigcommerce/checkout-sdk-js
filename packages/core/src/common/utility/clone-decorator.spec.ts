import { default as clone } from './clone-decorator';

describe('cloneDecorator', () => {
    describe('decorates whole classes', () => {
        @clone
        class Foo {
            constructor(public obj: any) {}

            getValue() {
                return this.obj;
            }
        }

        it('returns a cloned copy of the original object', () => {
            const obj = { test: 123 };
            const foo = new Foo(obj);

            const result = foo.getValue();

            expect(result).not.toBe(obj);
            expect(result).toEqual(obj);
        });

        it('returns a deep cloned copy', () => {
            const obj = { test: 123, deep: { clone: 456 } };
            const foo = new Foo(obj);

            const result = foo.getValue();
            obj.deep.clone = 789;

            expect(result.deep.clone).not.toEqual(obj.deep.clone);
        });

        it('returns a new cloned copy if the result of the method changes', () => {
            const obj = { test: 123 };
            const newObj = { new: 456 };
            const foo = new Foo(obj);

            const result = foo.getValue();
            foo.obj = newObj;

            const newResult = foo.getValue();

            expect(newResult).not.toBe(newObj);
            expect(newResult).toEqual(newObj);
            expect(result).not.toEqual(newObj);
        });

        it('returns the same value if the object reference is the same', () => {
            const obj = { test: 123 };
            const foo = new Foo(obj);

            const result = foo.getValue();
            obj.test = 456;

            const newResult = foo.getValue();

            expect(result).toBe(newResult);
            expect(result).not.toEqual({ test: 456 });
        });
    });

    describe('decorates methods', () => {
        // tslint:disable-next-line:max-classes-per-file
        class Foo {
            constructor(public obj: any) {}

            @clone
            getValue() {
                return this.obj;
            }
        }

        it('returns a cloned copy of the original object', () => {
            const obj = { test: 123 };
            const foo = new Foo(obj);

            const result = foo.getValue();

            expect(result).not.toBe(obj);
            expect(result).toEqual(obj);
        });

        it('returns a deep cloned copy', () => {
            const obj = { test: 123, deep: { clone: 456 } };
            const foo = new Foo(obj);

            const result = foo.getValue();
            obj.deep.clone = 789;

            expect(result.deep.clone).not.toEqual(obj.deep.clone);
        });

        it('returns a new cloned copy if the result of the method changes', () => {
            const obj = { test: 123 };
            const newObj = { new: 456 };
            const foo = new Foo(obj);

            const result = foo.getValue();
            foo.obj = newObj;

            const newResult = foo.getValue();

            expect(newResult).not.toBe(newObj);
            expect(newResult).toEqual(newObj);
            expect(result).not.toEqual(newObj);
        });

        it('returns the same value if the object reference is the same', () => {
            const obj = { test: 123 };
            const foo = new Foo(obj);

            const result = foo.getValue();
            obj.test = 456;

            const newResult = foo.getValue();

            expect(result).toBe(newResult);
            expect(result).not.toEqual({ test: 456 });
        });
    });
});
