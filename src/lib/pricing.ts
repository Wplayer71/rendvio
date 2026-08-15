export interface CreditPack {
  id: string;
  name: string;
  credits: number;
  price: number;
  popular?: boolean;
  variantId?: string;
}

export const CREDIT_PACKS: CreditPack[] = [
  {
    id: "starter",
    name: "Starter",
    credits: 5,
    price: 9.99,
    variantId: process.env.LEMONSQUEEZY_VARIANT_STARTER,
  },
  {
    id: "pro",
    name: "Pro",
    credits: 25,
    price: 39.99,
    popular: true,
    variantId: process.env.LEMONSQUEEZY_VARIANT_PRO,
  },
  {
    id: "studio",
    name: "Studio",
    credits: 100,
    price: 129.99,
    variantId: process.env.LEMONSQUEEZY_VARIANT_STUDIO,
  },
];

export const SIGNUP_BONUS_CREDITS = 3;
export const ANONYMOUS_FREE_RENDERS = 1;

export function getPackById(id: string): CreditPack | undefined {
  return CREDIT_PACKS.find((pack) => pack.id === id);
}
