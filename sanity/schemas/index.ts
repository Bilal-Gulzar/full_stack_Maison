import user from "./user";
import article from "./article";
import product from "./product";
import category from "./category";
import color from "./color";
import homepage from "./homepage";
import wishlistItem from "./wishlist";
import order from "./order";
import contactMessage from "./contactMessage";
import otpToken from "./otpToken";
import otpRateLimit from "./otpRateLimit";
import newsletterSubscriber from "./newsletterSubscriber";
import shippingSettings from "./shippingSettings";
import siteSettings from "./siteSettings";

export const schemaTypes = [
  homepage,
  shippingSettings,
  siteSettings,
  category,
  color,
  product,
  article,
  user,
  wishlistItem,
  order,
  contactMessage,
  newsletterSubscriber,
  otpToken,
  otpRateLimit,
];
