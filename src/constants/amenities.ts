export const AMENITIES_LIST = ['Gửi xe', 'Wifi', 'Căng tin', 'Điều hòa', 'Mái che', 'Phòng tắm', 'VIP'] as const;

export type AmenityType = typeof AMENITIES_LIST[number];
