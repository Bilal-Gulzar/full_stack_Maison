import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { toast } from "sonner";
import { usePageMeta } from "@/hooks/usePageMeta";

const Signup = () => {
  usePageMeta({ title: "Create Account", description: "Join MAISON and start shopping curated luxury menswear." });
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      toast.error("Please fill in all fields");
      return;
    }
    signup(name, email, password);
    toast.success("Account created successfully!");
    navigate("/");
  };

  const inputClasses = "w-full bg-background border border-border px-4 py-3 text-sm font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors";

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20 md:pt-24 section-padding py-20 md:py-32">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-10">
            <h1 className="font-display text-3xl md:text-5xl font-light text-foreground mb-3">Create Account</h1>
            <p className="font-body text-sm text-muted-foreground">Join the Maison community</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input type="text" placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} required className={inputClasses} />
            <input type="email" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} required className={inputClasses} />
            <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} className={inputClasses} />
            <button type="submit" className="w-full bg-primary text-primary-foreground py-3 text-xs font-body tracking-[0.2em] uppercase hover:bg-accent/90 transition-colors">
              Create Account
            </button>
          </form>

          <p className="text-center mt-6 font-body text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="text-primary hover:underline">Sign In</Link>
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Signup;
