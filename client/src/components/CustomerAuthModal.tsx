import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { User, Loader2, AlertCircle, LogIn, Mail } from "lucide-react";
import { AarunyaLogo } from "@/components/AarunyaLogo";

interface CustomerAuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CustomerAuthModal({ open, onOpenChange }: CustomerAuthModalProps) {
  const { refresh } = useAuth();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const loginMutation = trpc.auth.loginWithEmail.useMutation({
    onSuccess: async () => {
      await refresh();
      onOpenChange(false);
      setEmail("");
      setName("");
      setErrorMessage("");
    },
    onError: (err) => {
      setErrorMessage(err.message || "Failed to sign in.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!email.trim()) {
      setErrorMessage("Please enter your email address.");
      return;
    }

    loginMutation.mutate({
      email: email.trim(),
      name: name.trim() || undefined,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-2xl p-6">
        <DialogHeader className="text-center">
          <div className="w-12 h-12 rounded-2xl genz-gradient-bg flex items-center justify-center mx-auto mb-3 shadow-md">
            <AarunyaLogo className="w-7 h-7 text-primary-foreground" />
          </div>
          <DialogTitle className="text-xl font-bold text-center flex items-center justify-center gap-2">
            <span>Welcome to</span>
            <span className="flex items-center gap-1.5">
              <AarunyaLogo className="h-5 w-auto text-primary" />
              <span>Aarunya</span>
            </span>
          </DialogTitle>
          <DialogDescription className="text-xs text-center text-muted-foreground">
            Enter your email to sign in or create an account
          </DialogDescription>
        </DialogHeader>

        {errorMessage && (
          <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5 mt-2">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider block mb-1 text-muted-foreground">
              Your Email
            </label>
            <div className="relative">
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="rounded-xl h-11 pl-9 font-medium text-sm"
                required
              />
              <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider block mb-1 text-muted-foreground">
              Your Name <span className="text-muted-foreground font-normal">(Optional)</span>
            </label>
            <Input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Alex"
              className="rounded-xl h-11 font-medium text-sm"
            />
          </div>

          <Button
            type="submit"
            disabled={loginMutation.isPending}
            className="w-full h-11 genz-gradient-bg text-primary-foreground font-bold text-xs tracking-widest uppercase gap-2 rounded-xl hover:opacity-90 transition-all mt-1"
          >
            {loginMutation.isPending ? (
              "Signing In..."
            ) : (
              <>
                <LogIn className="w-4 h-4" /> Continue to Shop
              </>
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
