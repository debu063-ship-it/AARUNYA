import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, AlertCircle, LogIn, Mail, CheckCircle2 } from "lucide-react";
import { SlayPopLogo } from "@/components/SlayPopLogo";

interface CustomerAuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CustomerAuthModal({ open, onOpenChange }: CustomerAuthModalProps) {
  const [email, setEmail] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!email.trim()) {
      setErrorMessage("Please enter your email address.");
      return;
    }

    setIsPending(true);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          emailRedirectTo: `${window.location.origin}/`,
        },
      });

      if (error) {
        setErrorMessage(error.message);
      } else {
        setMagicLinkSent(true);
      }
    } catch {
      setErrorMessage("Something went wrong. Please try again.");
    } finally {
      setIsPending(false);
    }
  };

  const handleClose = (open: boolean) => {
    if (!open) {
      setEmail("");
      setErrorMessage("");
      setMagicLinkSent(false);
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md rounded-2xl p-6">
        <DialogHeader className="text-center">
          <div className="w-12 h-12 rounded-2xl genz-gradient-bg flex items-center justify-center mx-auto mb-3 shadow-md">
            <SlayPopLogo className="w-7 h-7 text-primary-foreground" />
          </div>
          <DialogTitle className="text-xl font-bold text-center flex items-center justify-center gap-2">
            <span>Welcome to</span>
            <span className="flex items-center gap-1.5">
              <SlayPopLogo className="h-5 w-auto text-primary" />
              <span>SlayPOP</span>
            </span>
          </DialogTitle>
          <DialogDescription className="text-xs text-center text-muted-foreground">
            {magicLinkSent
              ? "Check your email for a login link"
              : "Enter your email to receive a magic sign-in link"
            }
          </DialogDescription>
        </DialogHeader>

        {magicLinkSent ? (
          <div className="py-6 text-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7 text-green-600 dark:text-green-400" />
            </div>
            <p className="text-sm font-medium">Magic link sent to <strong>{email}</strong></p>
            <p className="text-xs text-muted-foreground">Click the link in your email to sign in. You can close this dialog.</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => { setMagicLinkSent(false); setEmail(""); }}
              className="rounded-xl text-xs"
            >
              Use a different email
            </Button>
          </div>
        ) : (
          <>
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

              <Button
                type="submit"
                disabled={isPending}
                className="w-full h-11 genz-gradient-bg text-primary-foreground font-bold text-xs tracking-widest uppercase gap-2 rounded-xl hover:opacity-90 transition-all mt-1"
              >
                {isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Sending...
                  </>
                ) : (
                  <>
                    <LogIn className="w-4 h-4" /> Send Magic Link
                  </>
                )}
              </Button>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
