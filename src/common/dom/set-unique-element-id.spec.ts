import { uniq } from 'lodash';

import setUniqueElementId from './set-unique-element-id';

describe('setUniqueElementId()', () => {
    let className: string;
    let elements: HTMLElement[];

    beforeEach(() => {
        className = 'foobar';
        elements = [];

        const element = document.createElement('div');
        element.className = className;

        elements.push(element);
        elements.push(element.cloneNode() as HTMLElement);
        elements.push(element.cloneNode() as HTMLElement);
        elements.forEach(element => document.body.appendChild(element));
    });

    afterEach(() => {
        elements.forEach(element => element.remove());
    });

    it('sets element id if not already set', () => {
        const output = setUniqueElementId(`.${className}`, 'container');

        expect(output)
            .toEqual([
                expect.stringMatching(/^container.+/),
                expect.stringMatching(/^container.+/),
                expect.stringMatching(/^container.+/),
            ]);

        expect(uniq(output).length)
            .toEqual(output.length);

        expect(elements.map(element => element.id))
            .toEqual(output);
    });

    it('does not set element id if already set', () => {
        elements[0].id = 'hello-world';

        expect(setUniqueElementId(`.${className}`, 'container'))
            .toEqual([
                'hello-world',
                expect.stringMatching(/^container.+/),
                expect.stringMatching(/^container.+/),
            ]);
    });
});
