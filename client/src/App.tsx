import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { CartProvider } from "./contexts/CartContext";
import Home from "./pages/Home";
import Shop from "./pages/Shop";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import OrderConfirmed from "./pages/OrderConfirmed";
import Account from "./pages/Account";
import AdminLogin from "./pages/AdminLogin";
import AdminShell from "./pages/AdminShell";
import AdminDashboard from "./pages/AdminDashboard";
import AdminProducts from "./pages/AdminProducts";
import AdminOrders from "./pages/AdminOrders";
import Community from "./pages/Community";
import AdminCommunity from "./pages/AdminCommunity";
import Suggestions from "./pages/Suggestions";
import AdminSuggestions from "./pages/AdminSuggestions";

function Router() {
  return (
    <CartProvider>
      <Switch>
        {/* Admin login */}
        <Route path="/admin/login">
          <AdminLogin />
        </Route>

        {/* Admin routes */}
        <Route path="/admin">
          <AdminShell>
            <AdminDashboard />
          </AdminShell>
        </Route>
        <Route path="/admin/dashboard">
          <AdminShell>
            <AdminDashboard />
          </AdminShell>
        </Route>
        <Route path="/admin/products">
          <AdminShell>
            <AdminProducts />
          </AdminShell>
        </Route>
        <Route path="/admin/orders">
          <AdminShell>
            <AdminOrders />
          </AdminShell>
        </Route>
        <Route path="/admin/community">
          <AdminShell>
            <AdminCommunity />
          </AdminShell>
        </Route>
        <Route path="/admin/suggestions">
          <AdminShell>
            <AdminSuggestions />
          </AdminShell>
        </Route>

        {/* Storefront routes */}
        <Route path="/">
          <Home />
        </Route>
        <Route path="/shop">
          <Shop />
        </Route>
        <Route path="/product/:slug">
          <ProductDetail />
        </Route>
        <Route path="/cart">
          <Cart />
        </Route>
        <Route path="/checkout">
          <Checkout />
        </Route>
        <Route path="/order-confirmed">
          <OrderConfirmed />
        </Route>
        <Route path="/account">
          <Account />
        </Route>
        <Route path="/community">
          <Community />
        </Route>
        <Route path="/suggestions">
          <Suggestions />
        </Route>

        {/* Fallback */}
        <Route path="/404" component={NotFound} />
        <Route component={NotFound} />
      </Switch>
    </CartProvider>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light" switchable>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
