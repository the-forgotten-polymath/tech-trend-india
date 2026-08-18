import type { Category, Product } from "./types";

/**
 * Presentational copy.
 *
 * The source export ships almost no marketing text (most `description` fields
 * just repeat the product name) and every product has 0 reviews. Rather than
 * writing invented text into the catalog data, the storefront falls back to the
 * templates below whenever real content is missing — so swapping in real copy
 * later is a data change, not a code change.
 *
 * Set `SHOW_DEMO_REVIEWS` to false to hide the placeholder rating widgets.
 */
export const SHOW_DEMO_REVIEWS = true;

type CategoryCopy = {
  tagline: string;
  blurb: string;
  highlights: string[];
};

const GENERIC: CategoryCopy = {
  tagline: "Hand-picked everyday finds",
  blurb:
    "A rotating mix of practical picks and small luxuries, chosen because they look good, work well and gift even better.",
  highlights: [
    "Quality-checked before dispatch",
    "Gift-ready packaging available at checkout",
    "Ships in 24–48 hours from our Chennai warehouse",
  ],
};

const CATEGORY_COPY: Record<string, CategoryCopy> = {
  electronics: {
    tagline: "Tech that earns its desk space",
    blurb:
      "Audio, wearables, charging and lighting essentials tested for daily use — the kind of tech people actually keep using.",
    highlights: ["Tested for daily use", "Compatible with Android and iOS", "6-month replacement support"],
  },
  "earbuds-airpods": {
    tagline: "All-day audio",
    blurb:
      "True wireless earbuds and pods with quick pairing, clear calls and cases that survive being tossed in a bag.",
    highlights: ["Bluetooth 5.x quick pairing", "Touch controls with built-in mic", "Charging case included"],
  },
  speakers: {
    tagline: "Big sound, small footprint",
    blurb: "Portable Bluetooth speakers with punchy bass, long battery life and travel-friendly builds.",
    highlights: ["Bluetooth + AUX/TF playback", "Long-play battery", "Grip-friendly finish"],
  },
  "smart-watch": {
    tagline: "Track more, charge less",
    blurb:
      "Smart watches with health tracking, notifications and swappable straps that suit both gym and office.",
    highlights: ["Heart rate & SpO₂ tracking", "Call and message alerts", "Magnetic charging cable included"],
  },
  "charger-adapter": {
    tagline: "Charge fast, stay safe",
    blurb: "Fast chargers and adapters with surge protection and multi-device output.",
    highlights: ["Fast-charge output", "Over-current protection", "Compact travel form factor"],
  },
  "data-cable-usb": {
    tagline: "Cables that last",
    blurb: "Braided and reinforced cables for charging and data, in the lengths you actually need.",
    highlights: ["Reinforced stress points", "High-speed data transfer", "Tangle-resistant braid"],
  },
  "light-items": {
    tagline: "Set the mood in seconds",
    blurb:
      "Fairy lights, curtain strings, night lamps and LED décor for festivals, shelves, cafés and cosy corners.",
    highlights: ["Plug-and-play with controller", "Multiple lighting modes", "Ideal for festive décor"],
  },
  "mini-fans": {
    tagline: "Cool air, anywhere",
    blurb: "Rechargeable handheld and desk fans that keep going through commutes, kitchens and power cuts.",
    highlights: ["USB rechargeable battery", "Multiple speed settings", "Quiet motor"],
  },
  "messger-items": {
    tagline: "Unwind the tension",
    blurb: "Handheld and neck massagers for post-shift muscle relief at home or at your desk.",
    highlights: ["Multiple intensity modes", "Cordless operation", "Contoured for neck and shoulders"],
  },
  "aroma-humidifier": {
    tagline: "Calm, one mist at a time",
    blurb:
      "Diffusers and humidifiers that soften dry air, carry your favourite oils and double as ambient lighting.",
    highlights: ["Quiet ultrasonic misting", "Auto shut-off when empty", "Soft ambient light"],
  },
  others: {
    tagline: "Useful odds and ends",
    blurb: "Mounts, holders and small gadgets that solve one annoying problem really well.",
    highlights: ["Practical, single-job design", "Compact and travel-ready", "Quality-checked before dispatch"],
  },
  "phone-accessories": {
    tagline: "Phone kit worth carrying",
    blurb: "Holders, mounts and grips that keep your phone steady wherever you set it down.",
    highlights: ["Universal fit", "Secure grip", "No-residue mounting"],
  },
  tumblers: {
    tagline: "Sip through the day",
    blurb:
      "Insulated bottles, steel flasks and everyday sippers sized for school bags, gym kits and long desk hours.",
    highlights: ["Leak-resistant lid", "Food-grade inner body", "Fits standard bottle cages and bags"],
  },
  sippers: {
    tagline: "Grab-and-go hydration",
    blurb: "Lightweight sippers with flip lids, straws and prints kids and adults both reach for.",
    highlights: ["Flip-top or straw lid", "Easy-grip body", "Dishwasher-friendly (top rack)"],
  },
  "tumblers-tumblers": {
    tagline: "Keeps its cool",
    blurb: "Double-walled tumblers that hold temperature through commutes and back-to-back meetings.",
    highlights: ["Double-wall insulation", "Sweat-free exterior", "Straw and lid included"],
  },
  mugs: {
    tagline: "Everyday mug, upgraded",
    blurb: "Ceramic and steel mugs with prints, lids and handles built for real kitchens.",
    highlights: ["Microwave-safe body (ceramic)", "Comfortable handle", "Gift-box ready"],
  },
  "coffee-mugs": {
    tagline: "For the coffee ritual",
    blurb: "Mugs made for slow mornings, with heat retention and prints that survive the dishwasher.",
    highlights: ["Heat-retaining walls", "Fade-resistant print", "Stackable design"],
  },
  jewelry: {
    tagline: "Everyday sparkle",
    blurb:
      "Rings, chains, earrings and anklets in skin-friendly finishes — light enough to wear daily, pretty enough to gift.",
    highlights: ["Skin-friendly plating", "Anti-tarnish finish", "Arrives in a gift pouch"],
  },
  bracelets: {
    tagline: "Stack, mix, repeat",
    blurb: "Cuffs, beaded bands and charm bracelets designed to layer with whatever you already wear.",
    highlights: ["Adjustable fit", "Layer-friendly weight", "Anti-tarnish finish"],
  },
  bags: {
    tagline: "Carry it better",
    blurb: "Totes, slings and mini bags with roomy interiors and straps that hold their shape.",
    highlights: ["Reinforced stitching", "Smooth zips", "Wipe-clean lining"],
  },
  "wallets-accessories-2": {
    tagline: "Slim, sorted, secure",
    blurb: "Wallets and card holders with tidy card slots and finishes that age well.",
    highlights: ["Multiple card slots", "Slim pocket profile", "Durable stitched edges"],
  },
  "bag-charms": {
    tagline: "Personality on your zip",
    blurb: "Plush and beaded charms that turn any bag, backpack or keyring into yours.",
    highlights: ["Secure lobster clasp", "Lightweight build", "Great pocket-money gift"],
  },
  keychains: {
    tagline: "Never lose the keys",
    blurb: "Metal, resin and plush keychains built around solid rings and clasps.",
    highlights: ["Sturdy split ring", "Scratch-resistant finish", "Pocket-friendly size"],
  },
  "beauty-care": {
    tagline: "Self-care shelf staples",
    blurb: "Makeup, nails and grooming tools chosen for finish, comfort and value.",
    highlights: ["Skin-friendly formulas and materials", "Everyday-use sizes", "Sealed on arrival"],
  },
  makeup: {
    tagline: "Colour that shows up",
    blurb: "Lips, eyes, face and brush sets with pigments that stay put through long days.",
    highlights: ["Buildable pigment", "Long-wear finish", "Sealed, unused packaging"],
  },
  "press-on-nails-beauty-care": {
    tagline: "Salon nails in minutes",
    blurb: "Reusable press-on sets with glue or adhesive tabs, in shapes from short square to almond.",
    highlights: ["Reusable with adhesive tabs", "Multiple sizes per set", "Prep kit included"],
  },
  "personal-care": {
    tagline: "Grooming, sorted",
    blurb: "Dryers, straighteners, trimmers and care tools that handle daily routines without drama.",
    highlights: ["Multiple heat/speed settings", "Cool-touch housing", "Travel-friendly cord length"],
  },
  accessories: {
    tagline: "Hold that hairstyle",
    blurb: "Clips, scrunchies, bands and claw sets that grip without pulling.",
    highlights: ["No-snag materials", "Strong hold", "Multipack value"],
  },
  "bath-essentials": {
    tagline: "Bathroom upgrades",
    blurb: "Loofahs, holders, towels and fittings that make a small bathroom feel considered.",
    highlights: ["Quick-dry materials", "Rust-resistant fittings", "Easy to install"],
  },
  plushies: {
    tagline: "Softest shelf on the internet",
    blurb:
      "Huggable plushies in every size — from clip-on minis to bedtime-sized companions, all with clean stitching and safe fill.",
    highlights: ["Soft, skin-friendly fabric", "Tight, safe stitching", "Spot-clean easily"],
  },
  crochet: {
    tagline: "Handmade, one at a time",
    blurb: "Crocheted flowers, keepsakes and charms made by hand, so no two are identical.",
    highlights: ["Handmade in small batches", "Soft cotton yarn", "Keeps its shape for years"],
  },
  "other-toys": {
    tagline: "Play, build, repeat",
    blurb: "Activity kits, novelty toys and desk gadgets that keep hands and minds busy.",
    highlights: ["Age-appropriate design", "Reusable play value", "Batteries noted on pack"],
  },
  "car-games": {
    tagline: "Full throttle, tiny scale",
    blurb: "Remote-control cars and die-cast models with responsive controls and replaceable parts.",
    highlights: ["Responsive 2.4G control", "Rechargeable pack included", "Grippy rubber tyres"],
  },
  drone: {
    tagline: "Take the shot from above",
    blurb: "Beginner-friendly drones with stable hovering, headless mode and spare propellers.",
    highlights: ["One-key take-off and landing", "Altitude hold", "Spare propellers in box"],
  },
  "truck-games": {
    tagline: "Heavy duty, small hands",
    blurb: "Trucks and construction vehicles built to survive floor-level demolition work.",
    highlights: ["Impact-resistant body", "Free-rolling wheels", "No sharp edges"],
  },
  "toys-games": {
    tagline: "For the fun-first list",
    blurb: "Plushies, RC vehicles, drones and activity kits picked for gifting age 3 to 30.",
    highlights: ["Safety-checked materials", "Great birthday gifting", "Ships gift-wrapped on request"],
  },
  "home-living": {
    tagline: "Small upgrades, better days",
    blurb: "Kitchen tools, cleaning kit, décor and storage that quietly make a home run smoother.",
    highlights: ["Practical, space-aware design", "Easy to clean", "Sturdy everyday materials"],
  },
  "home-kitchen": {
    tagline: "Cook, serve, store",
    blurb: "Prep tools, small appliances, masala boxes and dining pieces for busy Indian kitchens.",
    highlights: ["Food-grade materials", "Easy-clean surfaces", "Compact storage footprint"],
  },
  "home-cleaning": {
    tagline: "Cleaning, minus the effort",
    blurb: "Mops, brushes, dusters and sprays that reach the corners you usually skip.",
    highlights: ["Reaches tight corners", "Replaceable heads and pads", "Comfort grip handles"],
  },
  "home-storage": {
    tagline: "A place for everything",
    blurb: "Racks, cabinets and organisers that turn cluttered corners into usable space.",
    highlights: ["Tool-light assembly", "Stable, load-tested frames", "Space-saving footprint"],
  },
  "home-decor": {
    tagline: "Finishing touches",
    blurb: "Mirrors, wall pieces, candles and accents that give a room its personality.",
    highlights: ["Ready to hang or place", "Durable finish", "Pairs well with warm lighting"],
  },
  "home-appliances": {
    tagline: "Handy machines",
    blurb: "Compact appliances and covers that handle laundry, stitching and everyday upkeep.",
    highlights: ["Low power draw", "Compact and portable", "Simple one-dial operation"],
  },
  clocks: {
    tagline: "Time, styled",
    blurb: "Table, alarm and wall clocks from twin-bell classics to colour-changing digitals.",
    highlights: ["Silent or soft-tick movement", "Clear, readable dial", "Battery-operated"],
  },
  "mats-rugs": {
    tagline: "Soft landing",
    blurb: "Door mats, kitchen runners and anti-slip mats that trap dust and stay put.",
    highlights: ["Anti-slip backing", "Traps dust and water", "Machine washable (most styles)"],
  },
  "door-mat": {
    tagline: "First impression, wiped clean",
    blurb: "Printed and textured door mats that hold up to daily foot traffic.",
    highlights: ["High-traffic pile", "Anti-slip backing", "Fade-resistant print"],
  },
  "shoe-care": {
    tagline: "Keep them box-fresh",
    blurb: "Polishes, brushes, wipes and dryers that add seasons to your favourite pairs.",
    highlights: ["Safe on leather and canvas", "Quick-dry formula", "Travel-size options"],
  },
  "stationery-items": {
    tagline: "Desk joy",
    blurb: "Pens, notebooks, sticky sets and cute desk extras for students and planners.",
    highlights: ["Smooth-writing refills", "Sturdy binding", "Great classroom gifting"],
  },
  "gift-items": {
    tagline: "Ready to gift",
    blurb: "Curated sets that need nothing more than a ribbon and a name tag.",
    highlights: ["Arrives gift-boxed", "Balanced mix of items", "Suits most ages"],
  },
  "our-collection": {
    tagline: "Editor's picks",
    blurb: "A short list of favourites from across the store, refreshed as new stock lands.",
    highlights: ["Rotating selection", "Quality-checked", "Limited quantities"],
  },
  "party-festive": {
    tagline: "Bring the noise",
    blurb: "Holi colours, balloons, party guns and festive extras for the days that need decorating.",
    highlights: ["Skin-safe festive colours", "Party-pack quantities", "Easy clean-up"],
  },
  "auto-accessories": {
    tagline: "Car and bike kit",
    blurb: "Cleaning brushes, pumps, holders and locks that live in your boot or under the seat.",
    highlights: ["Fits most models", "Weather-resistant build", "Compact storage"],
  },
  "umbrellas-rainwear": {
    tagline: "Monsoon-ready",
    blurb: "Compact and long umbrellas plus rainwear with wind-tested ribs and quick-dry fabric.",
    highlights: ["Wind-resistant ribs", "Quick-dry canopy", "Folds into a bag"],
  },
  "tools-hardware": {
    tagline: "Fix it yourself",
    blurb: "Tapes, sealants and tool sets for the repairs that never justify a technician visit.",
    highlights: ["Strong, lasting bond", "Multi-surface use", "Storage case included"],
  },
};

export function categoryCopy(category: Category | undefined): CategoryCopy {
  if (!category) return GENERIC;
  return CATEGORY_COPY[category.slug] ?? GENERIC;
}

/** True when the source description adds nothing beyond the product name. */
function descriptionIsThin(product: Product): boolean {
  const description = product.description.trim();
  if (description.length === 0) return true;
  const simplify = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, "");
  return description.length < 60 || simplify(description) === simplify(product.name);
}

/**
 * Product copy shown on the detail page: the source text when it is useful,
 * otherwise a category-aware description built from the data we do have.
 */
export function productDescription(product: Product, category?: Category): string[] {
  const paragraphs: string[] = [];
  if (product.shortDescription.trim()) paragraphs.push(product.shortDescription.trim());

  if (!descriptionIsThin(product)) {
    paragraphs.push(...product.description.split("\n").filter(Boolean));
    return paragraphs;
  }

  const copy = categoryCopy(category);
  const categoryName = category?.name ?? "collection";
  paragraphs.push(
    `${product.name} is part of our ${categoryName} range. ${copy.blurb}`,
  );

  const optionSentence = product.options
    .map((option) => `${option.values.length} ${option.name.toLowerCase()} options`)
    .join(" and ");
  if (optionSentence) {
    paragraphs.push(
      `Choose from ${optionSentence} at checkout — pick the one you want before adding it to your bag.`,
    );
  }

  return paragraphs;
}

/** Four deterministic bullet points: category features plus product facts. */
export function productHighlights(product: Product, category?: Category): string[] {
  const copy = categoryCopy(category);
  const bullets = [...copy.highlights];

  if (product.options.length > 0) {
    const option = product.options[0];
    bullets.push(`Available in ${option.values.length} ${option.name.toLowerCase()} choices`);
  }
  if (product.sku) bullets.push(`Stock code ${product.sku}`);
  if (product.onSale) bullets.push(`Currently ${product.discountPercent}% off the regular price`);

  return bullets.slice(0, 4);
}

/**
 * Placeholder review numbers. Every product in the export has zero reviews, so
 * these are deterministic values derived from the product seed — never treat
 * them as real customer feedback.
 */
export function demoReviewSummary(product: Product): { rating: number; count: number } {
  const rating = Math.round((3.9 + product.seed * 1.1) * 10) / 10;
  const count = 11 + Math.floor(product.seed * 180);
  return { rating: Math.min(5, rating), count };
}
