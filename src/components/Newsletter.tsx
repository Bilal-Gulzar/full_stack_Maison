import { useRef, useState } from "react";
import { motion } from "framer-motion";
import ScrollReveal from "./ScrollReveal";
import { toast } from "sonner";
import { api } from "@/services/api";
import Recaptcha, { RecaptchaHandle } from "@/components/Recaptcha";

const Newsletter = () => {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const recaptchaRef = useRef<RecaptchaHandle>(null);
  const emailRef = useRef("");

  const submitWithToken = async (token: string) => {
    const savedEmail = emailRef.current;
    if (!savedEmail) return;
    setSubmitting(true);
    try {
      await api<{ ok: true; alreadySubscribed?: boolean }>("/api/newsletter", {
        method: "POST",
        body: JSON.stringify({ email: savedEmail, source: "footer", recaptchaToken: token }),
      });
      toast.success("Welcome to the Inner Circle!");
      setEmail("");
      emailRef.current = "";
    } catch (e) {
      toast.error((e as Error).message || "Subscription failed");
    } finally {
      setSubmitting(false);
      recaptchaRef.current?.reset();
    }
  };

  const handleSubscribe = () => {
    if (!email) return;
    emailRef.current = email;
    recaptchaRef.current?.execute();
  };

  return (
    <section className="section-padding py-20 md:py-32 border-t border-border">
      <ScrollReveal>
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-xs font-body tracking-[0.3em] uppercase text-primary mb-4">
            Stay Connected
          </p>
          <h2 className="font-display text-3xl md:text-5xl font-light text-foreground mb-4">
            Join the <span className="italic">Inner Circle</span>
          </h2>
          <p className="font-body text-sm text-muted-foreground mb-10">
            Be the first to know about new collections, exclusive events, and private sales.
          </p>
          <motion.form
            className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            onSubmit={(e) => {
              e.preventDefault();
              handleSubscribe();
            }}
          >
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your email address"
              required
              className="flex-1 bg-secondary text-foreground px-5 py-3 text-sm font-body placeholder:text-muted-foreground border border-border focus:border-primary focus:outline-none transition-colors"
            />
            <button
              type="submit"
              disabled={submitting}
              className="bg-primary text-primary-foreground px-8 py-3 text-xs font-body tracking-[0.2em] uppercase hover:opacity-90 transition-opacity duration-300 disabled:opacity-50"
            >
              {submitting ? "Subscribing…" : "Subscribe"}
            </button>
          </motion.form>
          <Recaptcha ref={recaptchaRef} onVerify={submitWithToken} onError={() => setSubmitting(false)} badge="bottomright" />
        </div>
      </ScrollReveal>
    </section>
  );
};

export default Newsletter;
