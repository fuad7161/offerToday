# Offer Today: High-Level Overview

*Draft v0.1 | Planning document for choosing which features to build*

## 1. Purpose

A platform that stores shop information and shows **who is offering the best discount right now**. It is not a marketplace: there are no orders, no checkout and no payments. It exists to help shoppers decide where to go before they spend time walking around.

**Core question the system answers:** "I am at this place. Which shops here have discounts today, and which is the best deal?"

## 2. Scenario That Drives the Design

A shopper arrives at a large mall with limited time and cannot visit every floor or shop. They open the app and:

1. Select the mall (or search by place).
2. See a list of every shop in that mall, **sorted by today's discount, highest first**.
3. Filter by brand or product (for example, a specific shoe brand).
4. Save interesting shops or products to a watch list.
5. Walk straight to the best deals.
6. If a shop advertised a discount that does not exist, they report it with a negative rating, which lowers that shop's trust.

## 3. Actors

| Actor | What they do |
|---|---|
| **Shopper (user)** | Searches, browses, watches shops and products, sets reminders, rates offers |
| **Shop owner (user)** | Creates a shop, lists products, publishes offers |
| **Admin** | Manages places and malls, reviews disputes and abuse reports |

One account can act as both shopper and shop owner.

## 4. Feature Overview

### 4.1 Places and Shops
- A **place** is a location grouping, such as a mall, market or area. Places can be nested (mall, floor).
- A **shop** belongs to one place and has a name, category, floor/unit, opening hours and contact details.
- Any user can create a shop (subject to verification, see section 6).

### 4.2 Products
- A shop owner lists products with name, brand, category and regular price.
- Shoppers can browse a shop's products and view a product across shops.
- Products are for display only. There is no ordering.

### 4.3 Offers and Discounts
- An offer can apply to a **whole shop** ("20% off everything") or to **specific products or brands**.
- Each offer has a discount type (percent or fixed amount), a start and end time, and an optional description.
- The system computes a **"best discount today"** value per shop and per product so lists can be ranked.

### 4.4 Discovery and Search
- Search by place, shop name, brand, product or category.
- **Place view:** all shops in a place, ranked by today's discount.
- **Brand/product view:** which shops are discounting this brand or product, ranked by discount.
- Filters: active offers only, minimum discount, category, floor.

### 4.5 Watch List (Cart)
- A personal list of shops and products the shopper wants to follow.
- It is a watch list only: nothing can be purchased from it.
- Shows the current offer status of every saved item in one place.

### 4.6 Reminders and Notifications
- The shopper can set an alert on a shop, a product, a brand or a category.
- When a matching offer is published, the shopper is notified.
- Optional rules: minimum discount percentage, or only for a specific place.
- Delivery channels to decide later (push, email, SMS).

### 4.7 Trust and Penalty System
The system's value depends on offers being real, so it needs a way to hold shops accountable.

- Shoppers can **report or rate an offer as false** ("I went, and there was no discount").
- Each shop has a **trust score** based on verified negative reports and positive confirmations.
- Consequences, in increasing severity:
  1. A warning label on the offer ("reported by several users").
  2. Lower ranking in discount lists.
  3. Offers hidden until the owner responds.
  4. Suspension of the shop.
- Safeguards against abuse: only users who have an active offer in view can report it, one report per user per offer, a minimum number of independent reports before action, and an owner right to reply.

## 5. Main Entities (Conceptual)

| Entity | Key information |
|---|---|
| User | Account, role(s) |
| Place | Name, type (mall/market/area), parent place, location |
| Shop | Owner, place, floor/unit, category, hours, trust score |
| Product | Shop, name, brand, category, regular price |
| Offer | Shop or product, discount value, start/end time, status |
| Watch item | User, shop or product |
| Alert rule | User, target (shop/product/brand), conditions |
| Offer report | User, offer, rating or reason, status |

## 6. Open Design Questions

These decisions will shape the later design and should be settled before building:

1. **Shop verification:** can anyone create any shop, or does an admin approve it? Without this, impersonation is possible.
2. **How is a discount confirmed as false?** User reports alone, photo evidence, or admin review?
3. **How do we prevent revenge reports** from competitors? (Rate limits, reporter reputation, owner reply.)
4. **Price accuracy:** do we store regular prices so that a "discount" can be checked, or only the discount percentage?
5. **Offer scope:** can one product have overlapping offers, and which one wins?
6. **Location:** do we need GPS and "near me", or is selecting a place by name enough for the first version?
7. **Notification channels** and how much volume is acceptable per user.

## 7. Suggested Phasing

| Phase | Scope |
|---|---|
| **1: Core** | Places, shops, products, offers, place view ranked by discount |
| **2: Discovery** | Search and filters by brand, product, category |
| **3: Engagement** | Watch list, reminders and notifications |
| **4: Trust** | Offer reports, trust score, penalties, shop verification |

Phase 4 can be designed now but built last, since it needs real usage data to tune.

## 8. Out of Scope

- Orders, checkout, payments, delivery
- Inventory and stock management
- Shop-to-customer chat
- Price comparison via external scraping

## 9. Next Step

Mark which features from section 4 you want in the first version, then answer the open questions in section 6. After that, the next document can cover the data model and API design.
