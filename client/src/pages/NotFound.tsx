import StorefrontLayout from "@/components/StorefrontLayout";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";
import { motion } from "framer-motion";

export default function NotFound() {
  return (
    <StorefrontLayout>
      <div className="container py-24 text-center relative overflow-hidden">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10"
        >
          <h1 className="text-9xl font-black tracking-tighter genz-gradient-text mb-4">404</h1>
          <p className="text-xl text-muted-foreground mb-8">Page not found</p>
          <Link href="/">
            <Button className="gap-2 genz-gradient-bg text-primary-foreground border-0 rounded-full px-8 font-bold hover:opacity-90">
              <Home className="w-4 h-4" /> Go Home
            </Button>
          </Link>
        </motion.div>
      </div>
    </StorefrontLayout>
  );
}
