import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

declare global {
  interface Window {
    google?: {
      accounts: {
        oauth2: {
          initTokenClient: (cfg: {
            client_id: string;
            scope: string;
            callback: (resp: { access_token?: string; error?: string }) => void;
          }) => { requestAccessToken: () => void };
        };
      };
    };
  }
}
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { toast } from "sonner";
import { Mail, ArrowRight, ArrowLeft } from "lucide-react";
import { usePageMeta } from "@/hooks/usePageMeta";

const Login = () => {
  usePageMeta({ title: "Sign In", description: "Sign in to your MAISON account." });
  const [step, setStep] = useState<"email" | "otp">("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const { requestOtp, verifyOtp, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const tokenClientRef = useRef<{ requestAccessToken: () => void } | null>(null);

  // Load Google Identity Services script + create OAuth token client
  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;
    if (!clientId) return;

    const init = () => {
      if (!window.google?.accounts?.oauth2) return;
      tokenClientRef.current = window.google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: "openid email profile",
        callback: async (resp) => {
          if (resp.error || !resp.access_token) {
            toast.error("Google sign-in failed");
            return;
          }
          try {
            await loginWithGoogle(resp.access_token);
            toast.success("Signed in with Google!");
            navigate("/orders");
          } catch (e) {
            toast.error((e as Error).message);
          }
        },
      });
    };

    const existing = document.getElementById("google-gsi") as HTMLScriptElement | null;
    if (existing) {
      init();
    } else {
      const s = document.createElement("script");
      s.id = "google-gsi";
      s.src = "https://accounts.google.com/gsi/client";
      s.async = true;
      s.defer = true;
      s.onload = init;
      document.head.appendChild(s);
    }
  }, [loginWithGoogle, navigate]);

  const handleGoogleSignIn = () => {
    if (!tokenClientRef.current) {
      toast.error("Google sign-in not ready yet — please wait a moment");
      return;
    }
    tokenClientRef.current.requestAccessToken();
  };

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email");
      return;
    }
    setLoading(true);
    try {
      await requestOtp(email);
      setStep("otp");
      toast.success(`Verification code sent to ${email}`);
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    } catch (err) {
      const msg = (err as Error).message || "Failed to send code";
      // Surface rate-limit lockouts as a sticky warning toast so the user
      // notices and doesn't keep hammering the button.
      const isLockout = /too many|limit reached|try again/i.test(msg);
      toast.error(msg, {
        duration: isLockout ? 12000 : 5000,
        description: isLockout
          ? "For security, OTP requests are limited to 5 per 24 hours per email."
          : undefined,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    const newOtp = [...otp];
    for (let i = 0; i < 6; i++) {
      newOtp[i] = pasted[i] || "";
    }
    setOtp(newOtp);
    const nextEmpty = newOtp.findIndex((d) => !d);
    inputRefs.current[nextEmpty === -1 ? 5 : nextEmpty]?.focus();
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    const entered = otp.join("");
    if (entered.length < 6) {
      toast.error("Please enter the full 6-digit code");
      return;
    }
    setLoading(true);
    try {
      await verifyOtp(email, entered);
      toast.success("Welcome back!");
      navigate("/orders");
    } catch (err) {
      toast.error((err as Error).message);
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const inputClasses =
    "w-full bg-background border border-border px-4 py-3.5 text-sm font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors";

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20 md:pt-24 section-padding py-20 md:py-32">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-10">
            <div className="w-16 h-16 border border-border flex items-center justify-center mx-auto mb-6">
              <Mail size={24} className="text-primary" />
            </div>
            <h1 className="font-display text-3xl md:text-5xl font-light text-foreground mb-3">
              {step === "email" ? "Sign In" : "Enter Code"}
            </h1>
            <p className="font-body text-sm text-muted-foreground">
              {step === "email"
                ? "Enter your email to receive a verification code"
                : `We sent a 6-digit code to ${email}`}
            </p>
          </div>

          {step === "email" ? (
            <div className="space-y-5">
              <form onSubmit={handleSendCode} className="space-y-4">
                <input
                  type="email"
                  placeholder="Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className={inputClasses}
                  autoFocus
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary text-primary-foreground py-3.5 text-xs font-body tracking-[0.2em] uppercase hover:bg-accent/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  ) : (
                    <>
                      Send Code <ArrowRight size={14} />
                    </>
                  )}
                </button>
              </form>

              <div className="relative flex items-center gap-4 py-2">
                <div className="flex-1 h-px bg-border" />
                <span className="text-[10px] font-body tracking-[0.2em] uppercase text-muted-foreground">or</span>
                <div className="flex-1 h-px bg-border" />
              </div>

              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={!import.meta.env.VITE_GOOGLE_CLIENT_ID}
                className="w-full border border-border py-3.5 text-xs font-body tracking-[0.15em] uppercase text-foreground hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-3 disabled:opacity-50"
              >
                <svg width="16" height="16" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                Sign in with Google
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <form onSubmit={handleVerify} className="space-y-6">
                <div className="flex justify-center gap-2.5" onPaste={handleOtpPaste}>
                  {otp.map((digit, i) => (
                    <input
                      key={i}
                      ref={(el) => (inputRefs.current[i] = el)}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(i, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(i, e)}
                      className="w-12 h-14 border border-border bg-background text-center text-lg font-display text-foreground focus:outline-none focus:border-primary transition-colors"
                    />
                  ))}
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary text-primary-foreground py-3.5 text-xs font-body tracking-[0.2em] uppercase hover:bg-accent/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  ) : (
                    "Verify & Sign In"
                  )}
                </button>
              </form>

              <div className="flex items-center justify-between">
                <button
                  onClick={() => {
                    setStep("email");
                    setOtp(["", "", "", "", "", ""]);
                  }}
                  className="flex items-center gap-1 text-xs font-body tracking-wider text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ArrowLeft size={12} /> Change email
                </button>
                <button
                  onClick={() => handleSendCode({ preventDefault: () => {} } as React.FormEvent)}
                  className="text-xs font-body tracking-wider text-primary hover:underline"
                >
                  Resend code
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Login;
