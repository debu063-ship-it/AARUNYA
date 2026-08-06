import { useState, useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLocation, Link } from "wouter";
import { motion } from "framer-motion";
import { LogIn, ShieldCheck, ArrowLeft, Eye, EyeOff, AlertCircle } from "lucide-react";
import { AarunyaLogo } from "@/components/AarunyaLogo";

export default function AdminLogin() {
  const { user, loading, refresh } = useAuth();
  const [, setLocation] = useLocation();

  const [email, setEmail] = useState("debangshumondal7@gmail.com");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const loginMutation = trpc.auth.loginWithEmail.useMutation({
    onSuccess: async () => {
      await refresh();
      setLocation("/admin/dashboard");
    },
    onError: (err) => {
      setErrorMessage(err.message || "Failed to sign in as Admin.");
    },
  });

  // Redirect to dashboard if already logged in as admin
  useEffect(() => {
    if (!loading && user && user.role === "admin") {
      setLocation("/admin/dashboard");
    }
  }, [loading, user, setLocation]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!email.trim()) {
      setErrorMessage("Please enter an email address.");
      return;
    }
    if (!password) {
      setErrorMessage("Please enter the admin password.");
      return;
    }

    loginMutation.mutate({
      email: email.trim(),
      password,
      isAdminPortal: true,
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
          className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden px-4">
      {/* Subtle grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(90deg, transparent, transparent 60px, currentColor 60px, currentColor 61px), repeating-linear-gradient(0deg, transparent, transparent 60px, currentColor 60px, currentColor 61px)",
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
        className="genz-glass rounded-2xl p-8 md:p-10 max-w-md w-full text-center relative z-10 shadow-2xl border border-border/50"
      >
        {/* Header Branding */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="flex flex-col items-center justify-center"
        >
          <div className="flex items-center justify-center gap-3 mb-1">
            <AarunyaLogo className="h-10 w-auto text-primary shrink-0" />
            <h1 className="text-4xl font-black tracking-tighter genz-gradient-text">AARUNYA</h1>
          </div>
          <p className="text-xs tracking-[0.3em] uppercase text-muted-foreground font-semibold">Admin Portal</p>
        </motion.div>

        <div className="my-6">
          <div className="w-16 h-16 rounded-2xl genz-gradient-bg flex items-center justify-center mx-auto mb-4 shadow-md">
            <ShieldCheck className="w-8 h-8 text-primary-foreground" />
          </div>
          <h2 className="text-xl font-bold mb-1">Admin Sign In</h2>
          <p className="text-xs text-muted-foreground">
            Restricted access for <span className="font-semibold text-foreground">debangshumondal7@gmail.com</span>
          </p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-3.5 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-xs text-left flex items-start gap-2.5 font-medium"
          >
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </motion.div>
        )}

        {/* Admin Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider block mb-1.5 text-muted-foreground">
              Admin Gmail
            </label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="debangshumondal7@gmail.com"
              className="rounded-xl h-12 bg-background/50 border-border focus:ring-2 focus:ring-primary font-medium text-sm"
              required
            />
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider block mb-1.5 text-muted-foreground">
              Password
            </label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
                className="rounded-xl h-12 pr-10 bg-background/50 border-border focus:ring-2 focus:ring-primary font-medium text-sm"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            disabled={loginMutation.isPending}
            size="lg"
            className="w-full h-12 genz-gradient-bg text-primary-foreground font-bold text-xs tracking-widest uppercase gap-2 border-0 rounded-xl hover:opacity-90 transition-all shadow-md mt-2"
          >
            {loginMutation.isPending ? (
              <span className="flex items-center gap-2">Authenticating...</span>
            ) : (
              <>
                <LogIn className="w-4 h-4" /> Log In as Admin
              </>
            )}
          </Button>
        </form>

        <div className="mt-6 pt-4 border-t border-border/40 flex items-center justify-between">
          <Link href="/">
            <span className="text-xs font-medium text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 cursor-pointer transition-colors">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Store
            </span>
          </Link>
          <span className="text-[11px] text-muted-foreground/70 font-mono">
            v1.0.0
          </span>
        </div>
      </motion.div>
    </div>
  );
}
