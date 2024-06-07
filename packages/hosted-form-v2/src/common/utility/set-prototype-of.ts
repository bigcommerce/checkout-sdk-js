export default function setPrototypeOf(object: any, prototype: object) {
    if (Object.setPrototypeOf) {
        Object.setPrototypeOf(object, prototype);
    } else {
        object.__proto__ = prototype;
    }

    return object;
}
