import AdminLayout from "@/components/AdminLayout";
import DashboardLayout from "@/components/DashboardLayout";
import { Route, Switch, useLocation, Link } from "wouter";
import { useEffect } from "react";
import AdminDashboard from "./AdminDashboard";
import AdminProducts from "./AdminProducts";
import AdminOrders from "./AdminOrders";
import { useAuth } from "@/_core/hooks/useAuth";
import { startLogin } from "@/const";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  ExternalLink,
} from "lucide-react";

const adminMenuItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/admin/dashboard" },
  { icon: Package, label: "Products", path: "/admin/products" },
  { icon: ShoppingBag, label: "Orders", path: "/admin/orders" },
];

export default function AdminLayoutPage() {
  const { user, loading } = useAuth();
  const [location, setLocation] = useLocation();

  // If no /admin sub-route, default to dashboard
  useEffect(() => {
    if (location === "/admin") {
      setLocation("/admin/dashboard");
    }
  }, [location, setLocation]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Admin Access Required</h1>
          <p className="text-muted-foreground mb-4">Sign in to access the admin panel</p>
          <Button onClick={() => startLogin()}>Sign In</Button>
        </div>
      </div>
    );
  }

  if (user.role !== "admin") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
          <p className="text-muted-foreground mb-4">You don't have admin privileges.</p>
          <Link href="/"><Button>Go to Store</Button></Link>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <Switch>
        <Route path="/admin/dashboard" component={AdminDashboard} />
        <Route path="/admin/products" component={AdminProducts} />
        <Route path="/admin/orders" component={AdminOrders} />
      </Switch>
    </DashboardLayout>
  );
}

// Override DashboardLayout menu items
// We need to patch the DashboardLayout to use admin menu items
// This is done by re-exporting with modified menuItems
