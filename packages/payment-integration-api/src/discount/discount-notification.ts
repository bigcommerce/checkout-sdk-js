export default interface DiscountNotification {
    message: string;
    messageHtml: string;
    discountType: string | null;
    placeholders: string[];
}
