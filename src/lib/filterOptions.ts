/**
 * UI filter option labels (presentation-only).
 * These are NOT business data — they're the dropdown choices the Shop page
 * exposes. Categories themselves are fetched from Sanity (see useCategories).
 */

export const easternCategories = {
  stitched: {
    label: "Stitched",
    subcategories: [
      { label: "Kurta", value: "Basic" },
      { label: "Kurta Pajama", value: "Formal" },
      { label: "Short Kurta", value: "Casual" },
      { label: "Shalwar Kameez", value: "Basic" },
      { label: "Waistcoat Sets", value: "Waistcoat" },
    ],
  },
  unstitched: {
    label: "Unstitched",
    subcategories: [
      { label: "Daily Wear", value: "Daily Wear" },
      { label: "Premium", value: "Premium" },
      { label: "Winter", value: "Winter" },
    ],
  },
};

export const occasions = ["Daily", "Casual", "Formal", "Eid", "Friday"];
export const seasons = ["Summer", "Winter", "All Season"];
export const fits = ["Slim Fit", "Regular Fit", "Loose Fit"];
export const fabrics = [
  "Wash & Wear", "Cotton", "Lawn", "Linen", "Boski", "Egyptian Cotton",
  "Silk Blend", "Khaddar", "Wool", "Marina", "Jamawar", "Velvet",
];
