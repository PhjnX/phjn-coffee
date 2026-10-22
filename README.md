# Phjn Coffee

Order-at-table system for a (fictional) Saigon café that serves coffee, milk tea, fruit tea, fresh juice and pastries.

Every table has a QR code. A customer scans it, picks drinks (size, sugar, ice, milk, toppings), and the order lands on the counter's board with the table number. Opened without a QR code, the website is a menu to browse: it shows prices and photos but does not take orders.

**Live:** [phjn-coffee.vercel.app](https://phjn-coffee.vercel.app)

**Stack:** Next.js (App Router) · TypeScript · Tailwind CSS v4 · Motion · Zustand · Supabase · Vitest

## How ordering works

1. Each table card has a QR code that opens `/menu?ban=<số bàn>`.
2. The table number is remembered in the browser and forgotten after 3 hours, so a customer who comes back the next day has to scan again.
3. Without a scanned table there is no "+" on menu cards, and the item sheet and checkout ask the customer to scan the table's QR code.
4. At checkout the customer enters a name and phone number (no account) and chooses cash or VietQR transfer (demo QR).
5. The server action re-prices every line from the menu and refuses any order whose table does not exist, so editing the cart or the URL in the browser cannot change the price or invent a table.

## Admin

Open `/admin`. The password comes from `ADMIN_PASSWORD` in `.env.local` (see `.env.example`); in development it defaults to `phjn-admin`.

- **Tổng quan:** today's revenue, order count, open orders, best sellers.
- **Đơn hàng:** the counter's board. New orders appear within 5 seconds and are highlighted. Filter by day, status (Mới → Đang pha → Sẵn sàng → Hoàn tất / Đã huỷ) or table, or search by code, name or phone. "Theo bàn" groups the day's orders per table with a button to settle what each table owes.
- **Thực đơn:** add and edit items (uploaded photos are cropped to the shop's 4:5 frame), toggle "tạm hết", delete. Changes show on the menu at once.
- **Bàn & QR:** add and remove tables, download a table's QR as PNG, or print all of them as A4 table cards.

## The interesting part: one option system for every kind of item

Each category needs different choices: coffee has milk type and extra shots, milk tea has up to three toppings, juice has sweetness, pastries can be warmed up. Instead of a hard-coded form per category, options are data:

- An option group (Size, Mức đường, Topping…) is single- or multi-choice, required or optional, with an optional `maxSelect`.
- A product lists the groups it offers. Adding a new drink, or a new kind of item, is a data change, not a code change.
- `src/lib/pricing.ts` validates a selection and computes the price. The product sheet uses it for the live price, and the checkout server action runs the same function again so a tampered cart cannot change the total. Covered by `pricing.test.ts`.
- Cart lines are keyed by product + sorted option ids + note, so two milk teas with different toppings stay separate and the same drink added twice merges.
- `buildOrder` in `src/lib/order.ts` turns the cart into an order (phone normalisation, quantity limits, re-pricing). Covered by `order.test.ts`.

## Where the data lives

Every read and write goes through one interface, `src/lib/server/store`, with two implementations:

- **Supabase** (production): Postgres tables from `supabase/schema.sql` and photos in the `menu-photos` Storage bucket. Used when `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are set. On first start it fills in the menu and 12 tables by itself.
- **JSON file** (local development, no setup): `data/db.json` and `data/uploads`, ignored by git.

## Run locally

```bash
npm install
npm run dev   # http://localhost:3000
npm test      # pricing and order rules
```

To order locally, open `http://localhost:3000/menu?ban=1` (table 1).

## Deploying to Vercel + Supabase

### 1. Supabase (database)

1. Create a free project at [supabase.com](https://supabase.com) (region Singapore is closest to Vietnam).
2. **SQL Editor → New query**, paste all of `supabase/schema.sql`, **Run**. It creates the tables, the rate-limit function and the `menu-photos` bucket, with row-level security on.
3. **Project Settings → API:** copy the Project URL and the `service_role` secret.

### 2. Vercel (website)

1. Import the GitHub repo on [vercel.com](https://vercel.com) (**Add New → Project**). Framework: Next.js, no other settings.
2. Before the first deploy, add Environment Variables (see `.env.example`):
   - `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` from step 1.
   - `ADMIN_PASSWORD` (production refuses admin sign-in without it) and `ADMIN_SECRET` (a long random string).
   - `NEXT_PUBLIC_SITE_URL`: the site's address, e.g. `https://phjn-coffee.vercel.app`. It is baked in at build time (sitemap, link previews, table QR codes); if it changes, redeploy.
3. Deploy. Open `/admin`, sign in, then print the table QR codes from `/admin/ban`.

To try Supabase locally, put the same variables in `.env.local` and restart `npm run dev`.

Other hosts work too: any Node server runs `npm ci && npm run build && npm start` (with HTTPS in front, the admin cookie is `Secure`). Without the Supabase variables it falls back to the JSON file, which needs a persistent disk.

**Built in:** login and order rate limits (shared through Supabase), security headers, `robots.txt` (admin and checkout not indexed), `sitemap.xml`, Open Graph image, custom 404 and error pages. Photos uploaded in the admin are shrunk in the browser first, because Vercel limits request bodies to about 4.5 MB. Hero videos are compressed (720p/480p), lazy-loaded and skipped in data-saver mode.

## Project structure

```
src/
  app/
    (site)/        home, /menu, /checkout (+ server action)
    admin/         sign-in and the admin panel
  components/      MenuView, ProductSheet, CartDrawer, TableFromUrl, checkout/, home/, brand/…
  lib/             types, seed menu, pricing, order rules, cart store
    server/        store (Supabase / JSON), rate limit
supabase/
  schema.sql       tables, rate-limit function, storage bucket
```

## Roadmap

- [x] Menu with sticky category tabs and accent-insensitive search, product sheet with live price, cart drawer persisted in `localStorage`
- [x] Order at the table by QR code, checkout re-priced on the server
- [x] Admin: order board with filters and a per-table view, menu editor with photo upload, printable table QR codes
- [x] Supabase store for production, JSON fallback for local work
- [ ] Order tracking page for customers
- [ ] Real VietQR account

## Images

Menus show real photos (`public/images/photos/`): each product photo keeps its own setting, is cropped to the same 4:5 frame around the item (found with `@imgly/background-removal-node`) and gets one shared warm colour grade, so the set reads as one café. Pages show them in arched or round frames. Cut-out versions in `public/images/products/` remain as a fallback, and items without either fall back to the SVG drawing in `ProductArt`.

Sources are free stock photos from Pexels and, for the teas and milk teas, Unsplash (both free for commercial use, no attribution required, credited here anyway). Unsplash: milk tea `GzuqroRnf4E`, oolong milk tea `LPDn9x-F6GM`, matcha `VKWjhlgFFwc`, salted-cream tea `qdDQ6V7lV9Y`, peach tea `VdetvhJ_muE`, lychee rose tea `sSnCZlEWN5E`, lotus oolong `NFaDWUXM3mU`, kumquat honey tea `AO3YdNpVdW4`, taro milk tea `Sbs1vytqNnI`.

<details>
<summary>Pexels sources</summary>

| File (`public/images/…`) | Source |
| --- | --- |
| products/ca-phe-den-da | pexels.com/photo/38622185 |
| products/ca-phe-sua-da | pexels.com/photo/14802987 |
| products/bac-xiu | pexels.com/photo/31911261 |
| products/ca-phe-muoi | pexels.com/photo/2873373 |
| products/latte | pexels.com/photo/302900 |
| products/americano | pexels.com/photo/1233528 |
| products/cold-brew-cam-sa | pexels.com/photo/17541113 |
| products/tra-sua-truyen-thong | pexels.com/photo/11160121 |
| products/tra-sua-oolong-nuong | pexels.com/photo/11976961 |
| products/tra-sua-matcha | pexels.com/photo/32972501 |
| products/hong-tra-kem-muoi | pexels.com/photo/18281881 |
| products/tra-dao-cam-sa | pexels.com/photo/17525264 |
| products/tra-vai-hoa-hong | pexels.com/photo/33781558 |
| products/tra-o-long-sen | pexels.com/photo/5946617 |
| products/tra-tac-mat-ong | pexels.com/photo/1194030 |
| products/nuoc-ep-cam | pexels.com/photo/96620 |
| products/nuoc-ep-dua-hau | pexels.com/photo/11009208 |
| products/thom-can-tay | pexels.com/photo/8755965 |
| products/oi-hong-ep | pexels.com/photo/5124179 |
| products/croissant-bo | pexels.com/photo/9725746 |
| products/croissant-hanh-nhan | pexels.com/photo/1775034 |
| products/tiramisu | pexels.com/photo/6880219 |
| products/cheesecake-chanh-day | pexels.com/photo/1098592 |
| products/banh-chuoi-nuong | pexels.com/photo/830894 |
| products/cookie-socola | pexels.com/photo/4110541 |
| products/cappuccino | pexels.com/photo/13623762 |
| products/mocha | pexels.com/photo/14761085 |
| products/espresso | pexels.com/photo/30910187 |
| products/ca-phe-trung | pexels.com/photo/213620 |
| products/tra-sua-khoai-mon | pexels.com/photo/5335709 |
| products/sinh-to-xoai | pexels.com/photo/7377106 |
| products/muffin-viet-quat | pexels.com/photo/7935281 |
| products/brownie | pexels.com/photo/25595974 |
| products/donut | pexels.com/photo/37220991 |
| products/macaron | pexels.com/photo/8356208 |
| products/banh-flan | pexels.com/photo/15867169 |
| deco/bean-* | pexels.com/photo/4109752 |
| scenes/barista | pexels.com/photo/29516134 |
| scenes/barista-smile | pexels.com/photo/30867857 |
| scenes/interior | pexels.com/photo/34094296 |
| scenes/latte-art | pexels.com/photo/302899 |
| scenes/croissant-coffee | pexels.com/photo/7426472 |
| scenes/iced-coffees | pexels.com/photo/4728009 |
| scenes/pastry | pexels.com/photo/1775034 |
| scenes/beans | pexels.com/photo/942805 |

</details>

Hero videos (`public/videos/`) are from Mixkit under the Mixkit free license: latte art, tea pouring (Mixkit #9369), pastries on boards (Mixkit #29330).

The logo (a steaming cup on a chamfered frame) is drawn in SVG in `src/components/brand/Logo.tsx`; fonts are Trirong (headings) and Open Sans (text) from Google Fonts.

---

Phjn Coffee is a fictional brand made for a portfolio project. Addresses, prices and orders are not real.
