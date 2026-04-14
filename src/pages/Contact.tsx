import { useRef, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { toast } from "sonner";
import { Mail, MapPin, Phone } from "lucide-react";
import { submitContactForm } from "@/services/contact";
import Recaptcha, { RecaptchaHandle } from "@/components/Recaptcha";
import { usePageMeta } from "@/hooks/usePageMeta";

const FORMAT_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const Contact = () => {
  usePageMeta({ title: "Contact", description: "Get in touch with MAISON — visit our Karachi store, call, or send us a message." });
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [submitting, setSubmitting] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const recaptchaRef = useRef<RecaptchaHandle>(null);
  const formRef = useRef(form);

  const checkEmail = () => {
    const email = form.email.trim().toLowerCase();
    if (!email) { setEmailError(null); return; }
    if (!FORMAT_RE.test(email)) { setEmailError("Invalid email format"); return; }
    setEmailError(null);
  };

  const submitWithToken = async (token: string) => {
    const savedForm = formRef.current;
    if (!savedForm.name || !savedForm.email || !savedForm.message) return;
    setSubmitting(true);
    try {
      await submitContactForm({ ...savedForm, recaptchaToken: token });
      toast.success("Message sent! We'll be in touch soon.");
      setForm({ name: "", email: "", subject: "", message: "" });
      formRef.current = { name: "", email: "", subject: "", message: "" };
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setSubmitting(false);
      recaptchaRef.current?.reset();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (emailError) {
      toast.error(emailError);
      return;
    }
    formRef.current = form;
    recaptchaRef.current?.execute();
  };

  const inputClasses = "w-full bg-background border border-border px-4 py-3 text-sm font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors";

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20 md:pt-24">
        <div className="section-padding py-12 md:py-20 border-b border-border">
          <p className="text-xs font-body tracking-[0.3em] uppercase text-primary mb-3">Get in Touch</p>
          <h1 className="font-display text-4xl md:text-6xl font-light text-foreground">Contact Us</h1>
        </div>

        <div className="section-padding py-12 md:py-20">
          <div className="grid md:grid-cols-2 gap-12 md:gap-20">
            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className={inputClasses} />
                <div>
                  <input
                    type="email"
                    placeholder="Email"
                    value={form.email}
                    onChange={(e) => {
                      setForm({ ...form, email: e.target.value });
                      if (emailError) setEmailError(null);
                    }}
                    onBlur={checkEmail}
                    required
                    className={`${inputClasses} ${emailError ? "border-destructive" : ""}`}
                  />
                  {emailError && (
                    <p className="text-xs text-destructive mt-1 font-body">{emailError}</p>
                  )}
                </div>
              </div>
              <input placeholder="Subject" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} required className={inputClasses} />
              <textarea
                placeholder="Your message"
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                required
                rows={6}
                className={`${inputClasses} resize-none`}
              />
              <Recaptcha ref={recaptchaRef} onVerify={submitWithToken} onError={() => setSubmitting(false)} badge="bottomright" />
              <button type="submit" disabled={submitting} className="bg-primary text-primary-foreground px-8 py-3 text-xs font-body tracking-[0.2em] uppercase hover:bg-accent/90 transition-colors disabled:opacity-50">
                {submitting ? "Sending…" : "Send Message"}
              </button>
            </form>

            {/* Info */}
            <div className="space-y-8">
              <div>
                <h3 className="font-display text-xl text-foreground mb-4">Visit Us</h3>
                <p className="font-body text-sm text-muted-foreground leading-relaxed">
                  We'd love to welcome you to our store. Drop by, give us a call, or message us on WhatsApp anytime.
                </p>
              </div>
              <div className="space-y-4">
                {[
                  { icon: MapPin, label: "Korangi, near Zaman Town, Karachi, Pakistan" },
                  { icon: Phone, label: "+92 343 0209163" },
                  { icon: Mail, label: "Maisonclothing0@gmail.com" },
                ].map(({ icon: Icon, label }) => (
                  <div key={label} className="flex items-center gap-3">
                    <Icon size={16} className="text-primary flex-shrink-0" />
                    <span className="font-body text-sm text-muted-foreground">{label}</span>
                  </div>
                ))}
              </div>
              <div>
                <h3 className="font-display text-xl text-foreground mb-3">Hours</h3>
                <div className="space-y-1 font-body text-sm text-muted-foreground">
                  <p>Mon – Fri: 10:00 – 19:00</p>
                  <p>Saturday: 10:00 – 18:00</p>
                  <p>Sunday: Closed</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Contact;
