export default function isFuture(date: Date): boolean {
    return date.valueOf() > Date.now();
}
