import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { CustomerAuthModal } from "@/components/CustomerAuthModal";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Flame, LogIn } from "lucide-react";

export function SignInReminderModal() {
  const [openReminder, setOpenReminder] = useState(false);
  const [openAuthModal, setOpenAuthModal] = useState(false);

  useEffect(() => {
    // Check session directly on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      // If no active session, pop up immediately on page open
      if (!session) {
        setOpenReminder(true);
      }
    });

    // Also listen to auth changes to automatically close if user logs in
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setOpenReminder(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleSignIn = () => {
    setOpenReminder(false);
    setOpenAuthModal(true);
  };

  const handleSignInLater = () => {
    setOpenReminder(false);
  };

  return (
    <>
      <Dialog open={openReminder} onOpenChange={(open) => {
        if (!open) handleSignInLater();
      }}>
        <DialogContent className="sm:max-w-md rounded-3xl p-6 sm:p-8 border border-border/80 bg-card/95 backdrop-blur-xl shadow-2xl overflow-hidden">
          {/* Ambient decorative glow */}
          <div className="absolute -top-16 -right-16 w-36 h-36 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 w-36 h-36 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative text-center space-y-5">
            {/* Header Badge */}
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-black uppercase tracking-widest mx-auto shadow-2xs">
              <Flame className="w-4 h-4 text-orange-500 fill-orange-500 animate-pulse" />
              <span>SIGN IN REMINDER</span>
            </div>

            {/* Main Character Slogan */}
            <div className="space-y-2.5">
              <DialogTitle className="text-2xl sm:text-3xl font-black tracking-tight text-foreground leading-tight">
                “Main character energy only. <br className="hidden sm:inline" />
                <span className="genz-gradient-text">Sign in to cook.”</span> 🫢
              </DialogTitle>
              <DialogDescription className="text-xs sm:text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed">
                Unlock your bag, track your drops in real time, vote on community designs, and earn member perks.
              </DialogDescription>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
              <Button
                onClick={handleSignIn}
                className="w-full sm:flex-1 h-12 genz-gradient-bg text-primary-foreground font-black text-xs tracking-widest uppercase rounded-2xl shadow-lg hover:opacity-90 transition-all gap-2"
              >
                <LogIn className="w-4 h-4" />
                Sign In
              </Button>
              <Button
                variant="outline"
                onClick={handleSignInLater}
                className="w-full sm:flex-1 h-12 rounded-2xl font-bold text-xs tracking-wider uppercase text-muted-foreground hover:text-foreground hover:bg-muted/80 border-border/80 transition-all"
              >
                Sign in later
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Auth Modal for signing in */}
      <CustomerAuthModal open={openAuthModal} onOpenChange={setOpenAuthModal} />
    </>
  );
}
