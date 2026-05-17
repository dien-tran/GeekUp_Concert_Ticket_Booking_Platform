export const CROSS_TAB_HOLD_RELEASE_KEY = 'seat-hold:release-request';

export interface CrossTabHoldReleasePayload {
    seatShowTimeIds: string[];
    requestedAt: number;
    source: 'booking-confirmation' | 'checkout-confirmation';
}
