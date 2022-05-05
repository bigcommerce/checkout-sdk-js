type PartialDeep<T> = {
    [P in keyof T]?: PartialDeep<T[P]>;
};

export default PartialDeep;
