export default function addMinutes(date: Date, amount: number): Date {
    const newDate = new Date(date.getTime());

    newDate.setMinutes(date.getMinutes() + amount);

    return newDate;
}
