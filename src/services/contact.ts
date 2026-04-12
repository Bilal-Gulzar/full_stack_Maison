import { api } from "./api";

export const submitContactForm = (payload: {
  name: string;
  email: string;
  subject?: string;
  message: string;
  recaptchaToken?: string;
}) => api<{ ok: true }>("/api/contact", { method: "POST", body: JSON.stringify(payload) });
