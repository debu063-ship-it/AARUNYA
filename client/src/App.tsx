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

function Router() {
  return (
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

      {/* Storefront routes */}
      <Route path="/">
        <CartProvider>
          <Home />
        </CartProvider>
      </Route>
      <Route path="/shop">
        <CartProvider>
          <Shop />
        </CartProvider>
      </Route>
      <Route path="/product/:slug">
        <CartProvider>
          <ProductDetail />
        </CartProvider>
      </Route>
      <Route path="/cart">
        <CartProvider>
          <Cart />
        </CartProvider>
      </Route>
      <Route path="/checkout">
        <CartProvider>
          <Checkout />
        </CartProvider>
      </Route>
      <Route path="/order-confirmed">
        <CartProvider>
          <OrderConfirmed />
        </CartProvider>
      </Route>
      <Route path="/account">
        <CartProvider>
          <Account />
        </CartProvider>
      </Route>

      {/* Fallback */}
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
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
