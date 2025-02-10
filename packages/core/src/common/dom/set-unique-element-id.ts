import { uniqueId } from 'lodash';

import { InvalidArgumentError } from '../error/errors';

const getUniqId = (idPrefix?: string): string => {
    const id = uniqueId(idPrefix);

    return document.getElementById(id) ? getUniqId(idPrefix) : id;
};

export default function setUniqueElementId(selector: string, idPrefix: string): string[] {
    const containers = document.querySelectorAll(selector);

    if (!containers.length) {
        throw new InvalidArgumentError(
            `Unable to find any element with the specified selector: ${selector}`,
        );
    }

    return Array.prototype.slice.call(containers).map((container: HTMLElement) => {
        if (!container.id) {
            container.id = getUniqId(idPrefix);
        }

        return container.id;
    });
}
