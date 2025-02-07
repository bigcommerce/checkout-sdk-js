import { uniqueId } from 'lodash';

import { InvalidArgumentError } from '../error/errors';

export default function setUniqueElementId(selector: string, idPrefix: string): string[] {
    const containers = document.querySelectorAll(selector);

    if (!containers.length) {
        throw new InvalidArgumentError(
            `Unable to find any element with the specified selector: ${selector}`,
        );
    }

    return Array.prototype.slice.call(containers).map((container: HTMLElement) => {
        if (!container.id) {
            const getUniqId = (id: string): string =>
                document.getElementById(id) ? getUniqId(uniqueId(idPrefix)) : id;

            container.id = getUniqId(uniqueId(idPrefix));
        }

        return container.id;
    });
}
