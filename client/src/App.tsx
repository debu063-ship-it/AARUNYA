import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { CartProvider } from "./contexts/CartContext";
import { WishlistProvider } from "./contexts/WishlistContext";
import Home from "./pages/Home";
import Shop from "./pages/Shop";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Wishlist from "./pages/Wishlist";
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
import AdminMessages from "./pages/AdminMessages";
import RefundPolicy from "./pages/RefundPolicy";
import ShippingPolicy from "./pages/ShippingPolicy";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import ContactUs from "./pages/ContactUs";

function Router() {
  return (
    <CartProvider>
      <WishlistProvider>
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
        <Route path="/admin/messages">
          <AdminShell>
            <AdminMessages />
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
        <Route path="/wishlist">
          <Wishlist />
        </Route>
        <Route path="/wish-list">
          <Wishlist />
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

        {/* Legal & Policy routes */}
        <Route path="/refund-policy">
          <RefundPolicy />
        </Route>
        <Route path="/returns">
          <RefundPolicy />
        </Route>
        <Route path="/shipping-policy">
          <ShippingPolicy />
        </Route>
        <Route path="/shipping">
          <ShippingPolicy />
        </Route>
        <Route path="/privacy">
          <PrivacyPolicy />
        </Route>
        <Route path="/privacy-policy">
          <PrivacyPolicy />
        </Route>
        <Route path="/terms">
          <TermsOfService />
        </Route>
        <Route path="/terms-of-service">
          <TermsOfService />
        </Route>
        <Route path="/contact">
          <ContactUs />
        </Route>
        <Route path="/faq">
          <ContactUs />
        </Route>
        <Route path="/help">
          <ContactUs />
        </Route>

        {/* Fallback */}
        <Route path="/404" component={NotFound} />
        <Route component={NotFound} />
      </Switch>
      </WishlistProvider>
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
