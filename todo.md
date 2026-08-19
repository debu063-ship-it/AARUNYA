# SlayPOP E-Commerce — Project TODO

## Database & Backend
- [x] Create database schema (products, product_images, orders, order_items tables)
- [x] Generate and apply migration SQL
- [x] Add query helpers in server/db.ts
- [x] Create product tRPC procedures (CRUD for admin, read for public)
- [x] Create order tRPC procedures (create for users, manage for admin)
- [x] Add adminProcedure-based server-side protection for admin routes

## Admin Panel (DashboardLayout)
- [x] Admin dashboard page with stats overview
- [x] Product list page with edit/delete
- [x] Add/Edit product form with S3 image upload
- [x] Order management page with status updates
- [x] Client-side role check for admin routes

## Customer Storefront
- [x] Homepage with hero, featured collections, product grid
- [x] Shop page with filters (category, size, price range)
- [x] Product detail page with image gallery, size selector, add-to-cart
- [x] Shopping cart page with item management and order summary
- [x] Checkout flow with shipping address form
- [x] Order confirmation page

## User Account
- [x] Account page with order history
- [x] Order status tracking

## Cart State Management
- [x] Cart context with localStorage persistence
- [x] Add/remove/update quantity functionality
- [x] Order summary calculations

## Styling & Design
- [x] Dark editorial theme with bold typography (Space Grotesk + Inter)
- [x] Custom color palette (electric lime accent on dark base)
- [x] Framer Motion micro-animations
- [x] Responsive mobile-first design
- [x] Storefront navbar with cart icon

## Testing
- [x] Write vitest tests for core procedures
- [x] Verify all routes and flows
