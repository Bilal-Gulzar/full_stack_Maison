import { api } from "./api";
import { sanityClient } from "@/lib/sanity";

export interface CartItemPayload {
  productId: string;
  title: string;
  price: number;
  quantity: number;
  size?: string;
  color?: string;
}

export async function createOrder(payload: {
  items: CartItemPayload[];
  paymentMethod: string;
  shippingAddress: Record<string, unknown>;
}) {
  return api<{ orderId: string; total: number }>("/api/orders/create", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function cancelOrder(orderId: string, reason?: string) {
  return api<{ ok: true; status: "cancelled" }>("/api/orders/cancel", {
    method: "POST",
    body: JSON.stringify({ orderId, reason }),
  });
}

export async function fetchUserOrders(userId: string) {
  return sanityClient.fetch(
    `*[_type=="order" && user._ref==$uid] | order(createdAt desc){
      _id, total, status, paymentMethod, createdAt,
      "items": items[]{title, price, quantity, size, color, "image": product->images[0].asset->url}
    }`,
    { uid: userId }
  );
}

export async function fetchOrderById(orderId: string) {
  return sanityClient.fetch(
    `*[_type=="order" && _id==$id][0]{
      _id, subtotal, shippingFee, codSurcharge, total, status, paymentMethod, createdAt, shippingAddress,
      "items": items[]{title, price, quantity, size, color, "image": product->images[0].asset->url},
      "user": user->{_id, email, name}
    }`,
    { id: orderId }
  );
}
