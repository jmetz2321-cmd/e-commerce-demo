# ShopVolt — E-Commerce Cart Prototype Spec

> **Source of truth** for the deployed experience at
> [jmetz2321-cmd.github.io/e-commerce-demo](https://jmetz2321-cmd.github.io/e-commerce-demo/)

---

## Overview

ShopVolt is a single-page e-commerce cart prototype built with **React 19, TypeScript, Tailwind CSS v4, and Vite 8**. It demonstrates a complete shopping flow — browsing products by category, adding items to a bag, adjusting quantities, and completing a simulated checkout with payment form validation.

All data is client-side; there is no backend or persistence.

---

## Live URL

```
https://jmetz2321-cmd.github.io/e-commerce-demo/
```

Deployed via GitHub Actions → GitHub Pages from the `main` branch of `jmetz2321-cmd/e-commerce-demo`.

## Design File

[Figma — ShopVolt E-Commerce Cart Prototype](https://www.figma.com/design/q3a5K5IL0PRMaB8GgVFcmr/ShopVolt-E-Commerce-Cart-Prototype?node-id=0-1)

---

## Tech Stack

| Layer       | Tool                                   | Version |
| ----------- | -------------------------------------- | ------- |
| Framework   | React                                  | 19.x    |
| Language    | TypeScript                             | 5.9     |
| Styling     | Tailwind CSS (via `@tailwindcss/vite`) | 4.2     |
| Bundler     | Vite                                   | 8.x     |
| Deployment  | GitHub Actions → GitHub Pages          | —       |

---

## File Structure

```
e-commerce-demo/
├── index.html
├── package.json
├── tsconfig.json
├── tsconfig.app.json
├── vite.config.ts
├── SPEC.md                         ← this file
├── README.md
├── .github/workflows/deploy.yml
├── public/
│   └── favicon.svg
├── src/
│   ├── main.tsx                    (ReactDOM entry point)
│   ├── App.tsx                     (top-level layout, view state, wiring)
│   ├── index.css                   (Tailwind import + slide-up keyframe)
│   ├── types/
│   │   └── index.ts                (Product, CartItem interfaces)
│   ├── data/
│   │   └── products.ts             (10 mock products, 4 categories)
│   ├── hooks/
│   │   └── useCart.ts              (cart state management hook)
│   └── components/
│       ├── Navbar.tsx              (sticky header: logo, Shop/Bag nav, badge)
│       ├── Sidebar.tsx             (category filter pills)
│       ├── ProductCard.tsx         (image, category tag, name, desc, price, CTA)
│       ├── ProductGrid.tsx         (responsive grid of ProductCards)
│       ├── Cart.tsx                (cart item list + order summary panel)
│       ├── CartItem.tsx            (thumbnail, name, unit price, ±qty, line total, delete)
│       ├── CheckoutModal.tsx       (order items, payment form, summary, place order)
│       └── Toast.tsx               (auto-dismiss notification, bottom-right)
```

---

## Data Model

### `Product`

```typescript
interface Product {
  id: number;
  name: string;
  price: number;
  image: string;       // Unsplash URL (400×400 crop)
  category: string;    // "Electronics" | "Clothing" | "Accessories"
  description: string;
}
```

### `CartItem`

```typescript
interface CartItem extends Product {
  quantity: number;
}
```

### Mock Catalog (10 products)

| ID | Name                                 | Price    | Category    |
| -- | ------------------------------------ | -------- | ----------- |
| 1  | Wireless Noise-Cancelling Headphones | $249.99  | Electronics |
| 2  | Mechanical Keyboard                  | $149.99  | Electronics |
| 3  | Ultra-Wide Monitor                   | $599.99  | Electronics |
| 4  | Classic Denim Jacket                 | $89.99   | Clothing    |
| 5  | Running Sneakers                     | $129.99  | Clothing    |
| 6  | Merino Wool Sweater                  | $74.99   | Clothing    |
| 7  | Leather Crossbody Bag                | $159.99  | Accessories |
| 8  | Stainless Steel Watch                | $299.99  | Accessories |
| 9  | Polarized Sunglasses                 | $64.99   | Accessories |
| 10 | Wireless Charging Pad                | $34.99   | Electronics |

### Categories

`All` · `Electronics` · `Clothing` · `Accessories`

---

## State Management

All state lives in a single `useCart` custom hook, lifted to `App.tsx` and distributed via props.

### `useCart` API

| Member          | Type                         | Description                                  |
| --------------- | ---------------------------- | -------------------------------------------- |
| `cartItems`     | `CartItem[]`                 | Current cart contents                        |
| `addToCart`      | `(product: Product) => void` | Adds product or increments existing quantity |
| `removeFromCart` | `(id: number) => void`       | Removes item entirely                        |
| `incrementQty`  | `(id: number) => void`       | +1 quantity                                  |
| `decrementQty`  | `(id: number) => void`       | −1 quantity; auto-removes at 0               |
| `clearCart`      | `() => void`                 | Empties entire cart                          |
| `subtotal`      | `number`                     | Σ(price × quantity)                          |
| `tax`           | `number`                     | subtotal × 0.08 (8% tax rate)                |
| `total`         | `number`                     | subtotal + tax                               |
| `itemCount`     | `number`                     | Σ(quantity) across all items                 |

All callbacks are wrapped in `useCallback`; derived values use `useMemo`.

### App-Level State

| State              | Type                   | Purpose                                   |
| ------------------ | ---------------------- | ----------------------------------------- |
| `view`             | `"shop" \| "cart"`     | Toggles between Product Wall and Bag      |
| `selectedCategory` | `string`               | Active category filter (default: `"All"`) |
| `showCheckout`     | `boolean`              | Controls CheckoutModal visibility         |
| `toast`            | `{ visible, message }` | Controls Toast notification               |

---

## Components

### Navbar

- **Position**: Sticky top, `z-30`, white/80 background with `backdrop-blur-md`
- **Left**: ShopVolt logo (indigo lightning bolt icon + bold wordmark). Clicking navigates to Shop view.
- **Right**: Two pill buttons — **Shop** and **Bag** (with shopping bag SVG icon)
  - Active state: `bg-indigo-50 text-indigo-700`
  - Bag button shows a badge (`bg-indigo-600`, white text) when `itemCount > 0`. Displays `99+` if count exceeds 99.

### Sidebar

- **Desktop**: Fixed 224px (`w-56`) left column, sticky below navbar
- **Mobile**: Horizontal scrollable row of category pills
- **Heading**: `"CATEGORIES"` — uppercase, xs, gray-400, tracked wider
- **Buttons**: One per category. Active state matches navbar pill style.

### ProductCard

- **Layout**: White card with rounded corners (`rounded-xl`), subtle border, hover shadow lift (`hover:shadow-lg`)
- **Image**: Square aspect ratio from Unsplash, `group-hover:scale-105` zoom on hover
- **Body**: Category badge (indigo pill) → product name (semibold, 2-line clamp) → description (xs gray, 2-line clamp) → price (lg bold) + **Add to Cart** button (indigo-600)
- **Button micro-interaction**: `active:scale-95`

### ProductGrid

- **Responsive columns**: 1 on mobile, 2 at `sm`, 3 at `xl`
- **Gap**: `gap-6`
- **Empty state**: Centered gray text `"No products found in this category."`

### Cart (Bag View)

- **Header**: `"Shopping Cart"` h2 + item count (e.g., "3 items")
- **Layout**: Two-column on `lg` — cart items (flex-1) + order summary sidebar (320px)
- **Empty state**: Cart icon, `"Your cart is empty"` heading, `"Looks like you haven't added anything yet."` body, **Start Shopping** indigo CTA

### CartItem

- **Row layout**: 80×80px thumbnail → name + unit price → ± quantity stepper → line total → trash icon
- **Quantity stepper**: Bordered 32×32px buttons with `−` / `+` SVG icons, numeric display between
- **Delete button**: Gray trash icon, turns red on hover (`hover:text-red-500 hover:bg-red-50`)
- **Divider**: `border-b border-gray-100`, last item has none

### Order Summary (inside Cart)

Sticky sidebar panel containing:

| Line      | Value                   |
| --------- | ----------------------- |
| Subtotal  | `$XX.XX`                |
| Shipping  | `Free` (green)          |
| Tax       | `$XX.XX`                |
| **Total** | **`$XX.XX`** (bold, lg) |

- **Proceed to Checkout**: Full-width indigo button
- **Continue Shopping**: Text link below

### CheckoutModal

- **Overlay**: Fixed fullscreen, `bg-black/50 backdrop-blur-sm`. Clicking backdrop closes modal.
- **Panel**: White, `rounded-2xl`, max-width 32rem (`max-w-lg`), scrollable

**Sections (top → bottom):**

1. **Header**: `"Checkout"` title + close (×) button
2. **Order Items**: Compact list — 48×48px thumbnail, truncated name, quantity, line total
3. **Payment Details**:
   - Name on Card — text input
   - Card Number — numeric input with auto-formatting (groups of 4), card brand SVG icon
   - Expiry Date — numeric input with auto-formatting (`MM/YY`)
   - CVC — numeric input (3–4 digits)
4. **Order Summary**: Subtotal / Shipping (Free) / Tax / **Total**
5. **Place Order button**: Shows total in label (`Place Order — $XX.XX`)
   - **Disabled** until all payment fields pass validation (gray-200 background, `cursor-not-allowed`)
   - **Enabled**: indigo-600, clickable
6. **Disclaimer**: Lock icon + `"Payments are simulated for this prototype"`

**Payment Validation Rules:**

| Field        | Rule                                |
| ------------ | ----------------------------------- |
| Name on Card | Non-empty after trim                |
| Card Number  | Exactly 16 digits (spaces stripped) |
| Expiry Date  | Exactly 5 chars (`MM/YY`)          |
| CVC          | 3–4 digits                         |

**Success State:**

After clicking Place Order, the modal transitions to a success screen:
- Green checkmark in a `bg-green-100` circle
- `"Order Placed!"` heading
- `"Thank you for your purchase."` body
- `"Redirecting to shop..."` subtext
- After 2 seconds, auto-redirects to Shop view with cart cleared and a `"Order placed successfully!"` toast

### Toast

- **Position**: Fixed bottom-right (`bottom-6 right-6`), `z-50`
- **Appearance**: Dark pill (`bg-gray-900`), white text, green checkmark icon
- **Animation**: `slide-up` keyframe (0.3s ease-out, translateY from 1rem to 0)
- **Auto-dismiss**: 2 seconds via `setTimeout` in `useEffect`
- **Messages**:
  - `"{Product Name} added to cart"` — on Add to Cart
  - `"{Product Name} removed from cart"` — on trash icon click
  - `"Order placed successfully!"` — after checkout

---

## User Flow

```
┌─────────────┐    click Add     ┌──────────────┐    click Bag    ┌───────────┐
│  Shop View  │ ──────────────▶  │ Toast shown, │ ─────────────▶ │ Cart View │
│ (Product    │    to Cart       │ badge updates│                │           │
│  Wall)      │                  └──────────────┘                │  ± qty   │
│             │◀── Continue ─────────────────────────────────────│  remove  │
│  filter by  │    Shopping                                      │           │
│  category   │                                                  └─────┬─────┘
└─────────────┘                                                        │
                                                              Proceed to
                                                              Checkout
                                                                       │
                                                                ┌──────▼──────┐
                                                                │  Checkout   │
                                                                │  Modal      │
                                                                │             │
                                                                │ fill payment│
                                                                │ place order │
                                                                │             │
                                                                │ ✓ success   │
                                                                │ → redirect  │
                                                                └─────────────┘
```

**Step-by-step:**

1. User lands on the **Shop view** — sees "Product Wall" heading, 10 products, category sidebar.
2. User filters by clicking a **category pill** (All / Electronics / Clothing / Accessories). Grid updates; product count label updates.
3. User clicks **Add to Cart** on a product card → toast confirms, navbar badge increments.
4. User clicks **Bag** in the navbar → switches to the **Cart view**.
5. User adjusts quantities with **+/−** stepper buttons. Decrementing to 0 removes the item.
6. User removes an item via the **trash icon** → toast confirms removal.
7. User clicks **Proceed to Checkout** → **CheckoutModal** opens.
8. User fills out payment form (Name, Card, Expiry, CVC). Button stays disabled until all fields are valid.
9. User clicks **Place Order** → success screen appears for 2 seconds → auto-returns to Shop view with an empty cart and success toast.

---

## Styling Conventions

- **CSS Framework**: Tailwind CSS v4 via `@tailwindcss/vite` plugin (no `tailwind.config.js` or `postcss.config.js`)
- **Global CSS**: Single `@import "tailwindcss"` directive + one custom `slide-up` keyframe
- **Color palette**: White/gray neutral base, `indigo-600` accent for all CTAs and active states, `green-600` for success/free shipping, `red-500` for destructive hover states
- **Spacing**: Consistent Tailwind scale (`gap-6`, `p-4`, `p-6`, `py-8`, `space-y-3`)
- **Typography**: System font stack (Tailwind default), bold headings, `text-sm` body, `text-xs` for meta
- **Responsive breakpoints**: `sm` (2-col grid), `lg` (sidebar goes vertical, cart 2-col layout), `xl` (3-col grid)
- **Transitions**: `transition-colors` on buttons, `transition-shadow duration-300` on cards, `transition-transform duration-300` for image zoom
- **Sticky elements**: Navbar (`sticky top-0`), sidebar nav (`sticky top-20`), order summary panel (`sticky top-20`)

---

## Deployment

**Repository**: [github.com/jmetz2321-cmd/e-commerce-demo](https://github.com/jmetz2321-cmd/e-commerce-demo)

**Workflow** (`.github/workflows/deploy.yml`):
- Trigger: push to `main`
- Build: `npm ci` → `npm run build` (produces `dist/`)
- Deploy: `actions/upload-pages-artifact@v3` + `actions/deploy-pages@v4`

**Vite config**: `base: '/e-commerce-demo/'` for GitHub Pages path prefix.
