export default function objectWithSortedKeys(object: { [key: string]: any }) {
    const keys = Object.keys(object);
    const sortedKeys = keys.sort();

    const sortedArray = sortedKeys.reduce(
        (previous, current) => ({
            ...previous,
            [current]: object[current],
        }),
        {},
    );

    return sortedArray;
}
