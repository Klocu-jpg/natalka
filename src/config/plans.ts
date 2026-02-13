export const PLANS = [
  {
    id: "monthly",
    priceId: "price_1Sywb9GiLeHcQYBNBSg0kYRP",
    testPriceId: "price_1SywqWGiLeHcQYBNZXo0GC0K",
    name: "Miesięczny",
    price: "5 zł",
    period: "/ miesiąc",
    perMonth: "5 zł/mies.",
    badge: null,
  },
  {
    id: "semiannual",
    priceId: "price_1SywquGiLeHcQYBNjFjfgsmG",
    testPriceId: "price_1SywuTGiLeHcQYBNjDz7dmbc",
    name: "6 miesięcy",
    price: "25 zł",
    period: "/ 6 miesięcy",
    perMonth: "~4,17 zł/mies.",
    badge: null,
  },
  {
    id: "annual",
    priceId: "price_1SywgIGiLeHcQYBN5Ad1ffwQ",
    testPriceId: "price_1SywuHGiLeHcQYBNZFskrLPn",
    name: "Roczny",
    price: "50 zł",
    period: "/ rok",
    perMonth: "~4,17 zł/mies.",
    badge: "Najlepsza wartość",
  },
] as const;

export const COUPLE_PLANS = [
  {
    id: "couple-monthly",
    priceId: "price_1T0RlgGiLeHcQYBNCY317b4O",
    testPriceId: "price_1T0RlgGiLeHcQYBNCY317b4O",
    name: "Miesięczny",
    price: "8 zł",
    period: "/ miesiąc",
    perMonth: "4 zł/os./mies.",
    badge: null,
  },
  {
    id: "couple-semiannual",
    priceId: "price_1T0Rm8GiLeHcQYBNEXMJdm2y",
    testPriceId: "price_1T0Rm8GiLeHcQYBNEXMJdm2y",
    name: "6 miesięcy",
    price: "40 zł",
    period: "/ 6 miesięcy",
    perMonth: "~3,33 zł/os./mies.",
    badge: null,
  },
  {
    id: "couple-annual",
    priceId: "price_1T0RmlGiLeHcQYBN4x5ioVWm",
    testPriceId: "price_1T0RmlGiLeHcQYBN4x5ioVWm",
    name: "Roczny",
    price: "80 zł",
    period: "/ rok",
    perMonth: "~3,33 zł/os./mies.",
    badge: "Najlepsza wartość",
  },
] as const;

export const COUPLE_PRICE_IDS = [
  "price_1T0RlgGiLeHcQYBNCY317b4O",
  "price_1T0Rm8GiLeHcQYBNEXMJdm2y",
  "price_1T0RmlGiLeHcQYBN4x5ioVWm",
] as const;
