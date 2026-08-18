/**
 * Catalog build step.
 *
 * Reads the raw WooCommerce Store-API dump (`products.json`) and produces:
 *   1. `src/data/catalog.json` — a normalised, trimmed catalog used by the app
 *   2. `public/images/*`       — the product imagery, copied from `images/`
 *
 * Everything written to catalog.json is derived from the source file: no
 * marketing copy or ratings are invented here (presentational fallback copy
 * lives in `src/lib/copy.ts` so it can be edited without a data rebuild).
 *
 * Run with: npm run prepare:data
 */
import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const ROOT = path.resolve(import.meta.dirname, "..");
const SOURCE = path.join(ROOT, "products.json");
const IMAGE_SOURCE_DIR = path.join(ROOT, "images");
const IMAGE_TARGET_DIR = path.join(ROOT, "public", "images");
const OUTPUT = path.join(ROOT, "src", "data", "catalog.json");

/* ------------------------------------------------------------------ helpers */

const HTML_ENTITIES = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
  ldquo: "\u201c",
  rdquo: "\u201d",
  lsquo: "\u2018",
  rsquo: "\u2019",
  hellip: "\u2026",
  ndash: "\u2013",
  mdash: "\u2014",
  deg: "\u00b0",
  trade: "\u2122",
  reg: "\u00ae",
  copy: "\u00a9",
};

function decodeEntities(input) {
  return input
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCodePoint(parseInt(code, 16)))
    .replace(/&([a-z]+);/gi, (match, name) => HTML_ENTITIES[name.toLowerCase()] ?? match);
}

/** HTML -> readable plain text, keeping paragraph/list breaks. */
function htmlToText(html) {
  if (!html) return "";
  return decodeEntities(
    html
      .replace(/<\s*br\s*\/?\s*>/gi, "\n")
      .replace(/<\/\s*(p|div|li|h[1-6]|tr)\s*>/gi, "\n")
      .replace(/<\s*li[^>]*>/gi, "\u2022 ")
      .replace(/<[^>]+>/g, ""),
  )
    .replace(/\r/g, "")
    .replace(/[ \t]+/g, " ")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .join("\n")
    .trim();
}

function titleCase(slug) {
  return slug
    .split(/[-_]/g)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/** Stable slugify for values that need to appear in a URL. */
function slugify(value) {
  return (
    value
      .toString()
      .normalize("NFKD")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "item"
  );
}

/** Deterministic 0..1 value derived from a key (stable between builds). */
function hashUnit(key) {
  const hash = createHash("sha1").update(String(key)).digest();
  return hash.readUInt32BE(0) / 0xffffffff;
}

function money(minorUnits, minorUnitDigits) {
  const value = Number.parseInt(minorUnits ?? "0", 10);
  if (!Number.isFinite(value)) return 0;
  return value / 10 ** (minorUnitDigits ?? 2);
}

/* -------------------------------------------------------------- source read */

if (!fs.existsSync(SOURCE)) {
  console.error(`✖ Cannot find ${SOURCE}`);
  process.exit(1);
}

const raw = JSON.parse(fs.readFileSync(SOURCE, "utf8"));
console.log(`→ Read ${raw.length} products from products.json`);

/* ------------------------------------------------------ category taxonomy */

/**
 * Category hierarchy is not present in the dump, but every category carries a
 * permalink such as `/product-category/electronics/light-items/`, which encodes
 * the full ancestor path. We rebuild the tree from those paths.
 */
const PATH_ONLY_NAMES = {
  electronics: "Electronics",
  "toys-games": "Toys & Games",
};

/** Categories whose source names are vague get a clearer storefront label. */
const CATEGORY_LABEL_OVERRIDES = {
  others: "More Electronics",
  other: "Curated Picks",
  "wallets-accessories-2": "Wallets",
  "press-on-nails-beauty-care": "Press-on Nails",
  "mini-fans": "Portable Fans",
  plushies: "Soft Toys",
  "light-items": "Lights",
  "data-cable-usb": "Data Cables",
  "messger-items": "Massagers",
  "smart-watch": "Smart Watches",
  "our-collection": "Curated Picks",
  "truck-games": "Trucks",
  drone: "Drones",
  "car-games": "Car Games",
  "tumblers-tumblers": "Tumblers",
  accessories: "Hair Accessories",
  "stationery-items": "Stationery",
  "door-mat": "Door Mats",
  "gift-items": "Gift Sets",
  tumblers: "Bottles & Drinkware",
  "phone-accessories": "Phone Accessories",
  "aroma-humidifier": "Aroma & Humidifiers",
  jewelry: "Jewellery",
  bracelets: "Bracelets",
};

/**
 * The source dump leaves 224 products with no category at all (plus a batch of
 * decorative-light SKUs filed nowhere). These extra nodes give every product a
 * sensible home; they are merged into the tree exactly like source categories.
 */
const EXTRA_CATEGORIES = [
  ["home-living", "Home & Living", null],
  ["home-kitchen", "Kitchen & Dining", "home-living"],
  ["home-cleaning", "Cleaning & Care", "home-living"],
  ["home-storage", "Storage & Organisation", "home-living"],
  ["home-decor", "Home Decor", "home-living"],
  ["home-appliances", "Appliances", "home-living"],
  ["clocks", "Clocks", "home-living"],
  ["mats-rugs", "Mats & Rugs", "home-living"],
  ["bath-essentials", "Bath & Body", "home-living"],
  ["shoe-care", "Shoe Care", "home-living"],
  ["beauty-care", "Beauty & Care", null],
  ["personal-care", "Personal Care", "beauty-care"],
  ["auto-accessories", "Car & Bike", null],
  ["tools-hardware", "Tools & Hardware", null],
  ["umbrellas-rainwear", "Umbrellas & Rainwear", null],
  ["party-festive", "Party & Festive", null],
];

/** Source categories that read better under one of the nodes above. */
const REPARENT = {
  "door-mat": "mats-rugs",
  "aroma-humidifier": "home-living",
  makeup: "beauty-care",
  "press-on-nails-beauty-care": "beauty-care",
  accessories: "beauty-care",
};

const categories = new Map();

function ensureCategory(slug, pathSegments) {
  let node = categories.get(slug);
  if (!node) {
    node = {
      id: null,
      slug,
      name: CATEGORY_LABEL_OVERRIDES[slug] ?? PATH_ONLY_NAMES[slug] ?? titleCase(slug),
      sourceName: null,
      path: pathSegments,
      parentSlug: pathSegments.length > 1 ? pathSegments[pathSegments.length - 2] : null,
      depth: pathSegments.length - 1,
      childSlugs: [],
      directCount: 0,
      totalCount: 0,
      image: null,
      imageAlt: null,
    };
    categories.set(slug, node);
  }
  return node;
}

function segmentsFromLink(link, slug) {
  const match = /product-category\/(.+?)\/?$/.exec(link ?? "");
  if (!match) return [slug];
  const segments = match[1].split("/").filter(Boolean);
  if (segments[segments.length - 1] !== slug) segments.push(slug);
  return segments;
}

// First pass: register every category (and every implied ancestor).
for (const product of raw) {
  for (const category of product.categories ?? []) {
    const slug = category.slug;
    const segments = segmentsFromLink(category.link, slug);
    for (let i = 0; i < segments.length; i += 1) {
      ensureCategory(segments[i], segments.slice(0, i + 1));
    }
    const node = categories.get(slug);
    node.id = category.id;
    node.sourceName = decodeEntities(category.name);
    if (!CATEGORY_LABEL_OVERRIDES[slug]) node.name = decodeEntities(category.name);
  }
}

// Register the storefront-only nodes.
for (const [slug, name, parentSlug] of EXTRA_CATEGORIES) {
  const node = ensureCategory(slug, [slug]);
  node.name = name;
  node.parentSlug = parentSlug;
}

// Apply re-parenting, then recompute paths/depths from the parent chain.
for (const [slug, parentSlug] of Object.entries(REPARENT)) {
  const node = categories.get(slug);
  if (node) node.parentSlug = parentSlug;
}

function pathFor(slug, seen = new Set()) {
  const node = categories.get(slug);
  if (!node || seen.has(slug)) return [slug];
  seen.add(slug);
  return node.parentSlug ? [...pathFor(node.parentSlug, seen), slug] : [slug];
}

for (const node of categories.values()) {
  node.path = pathFor(node.slug);
  node.depth = node.path.length - 1;
  node.childSlugs = [];
}

// Link children to parents.
for (const node of categories.values()) {
  if (!node.parentSlug) continue;
  const parent = categories.get(node.parentSlug);
  if (parent && !parent.childSlugs.includes(node.slug)) parent.childSlugs.push(node.slug);
}

/* ---------------------------------------------------- product classification */

/**
 * Keyword rules used only for products the source dump left uncategorised
 * (and for the `LE-*` decorative-light SKUs, which are lights but were filed
 * nowhere). Rules are evaluated in order against "NAME SKU", first match wins.
 */
const CLASSIFIER_RULES = [
  // Decorative lighting SKUs: LE-03, LE-59 RICE, LE-75 …
  [/\bLE[-\s]?\d{2,}/, "light-items"],
  [/\b(LED|LAMP|LIGHTS?|LANTERN|TORCH)\b/, "light-items"],
  // Anything car/bike related wins before generic rules (e.g. CAR UMBRELLA).
  [/\b(CAR|BIKE|MOTOR|PETROL|FUEL|TYRE|WINDSHIELD)\b/, "auto-accessories"],
  [/(AIR COMPRES|FOOT PUMP|BLAST PUMP|ASHTRAY|HANDLE LOCK|ALARM LOCK|GOGGLES)/, "auto-accessories"],
  [/\bNAILS?\b/, "press-on-nails-beauty-care"],
  [/\bWALLET/, "wallets-accessories-2"],
  [/(HOLI|COLOUR FOG|PYRO|BALLOON|METAL GUN|PARTY|BIRTHDAY)/, "party-festive"],
  [/\b(SHOE|SHOES|SHOW)\s*RACK/, "home-storage"],
  [/\b(SHOE|SHOES)\b/, "shoe-care"],
  [/\bCLOCK\b/, "clocks"],
  [/\bMATS?\b/, "mats-rugs"],
  [/(HAIR|TRIMMER|CURLER|STRAIGHT|BLACK ?HEADS?|CALLUS|NAIL CUTTER|SMILING FOOT|FACIAL|STEAMER)/, "personal-care"],
  [/(TAPE|SEALANT|TOOL SET|FURNITURE LIFTER|SCREW|DRILL)/, "tools-hardware"],
  [/UMBRELLA|RAIN ?COAT|PONCHO/, "umbrellas-rainwear"],
  [/MICRO ?FIBER|MICROFIBRE/, "home-cleaning"],
  [/(FAUCET|SHOWER|LOOFHA|LOOFAH|SOAP|TOOTHPASTE|TOWEL|BATH(?!ROOM CLEANER))/, "bath-essentials"],
  [
    /(MOP\b|VACUUM|VACCUM|VACUM|DUSTER|WIPER|WIPES|STAIN REMOVER|CLEANER|CLEANING|TOILET|BLUE TABLET|BRUSH|MAGIC HOSE|GLOVES)/,
    "home-cleaning",
  ],
  [/(WASHING MACHINE|AC COVER|SEWING MACHINE|DRYER)/, "home-appliances"],
  [
    /(KITCHEN|KETTLE|FRYING PAN|GRINDER|JUIC|MIXER|WAFFLE|BBQ|STOVE|GAS CYLINDER|MASALA|SPICE|SLICER|SHEDDER|TONGS|BOWL|PLATE|CUP\b|LUNCH BOX|LIGHTER|SEALING|TRAY|OIL |STRAW|CAPSULE CUTTER)/,
    "home-kitchen",
  ],
  [/(CABINET|ORGANI[SZ]ER|STORAGE|HOLDER|SHELF|STOOL|CHAIR|HOOK|DRAWER)/, "home-storage"],
  [/(WALL ?PAPER|MIRROR|CANDLE|PAINTING|PIGGY BANK|CURTAIN|MESH|VASE|FRAME)/, "home-decor"],
];

/** Hand-checked exceptions the keyword rules would otherwise mis-file. */
const EXACT_CATEGORY_OVERRIDES = {
  5966: "tumblers", // Crazy silly straw – drinkware novelty
  4658: "tumblers", // Kid plastic cup
  4656: "tumblers", // Colour cup
  4722: "tumblers", // Straw type juicing cup 500 ml
  4826: "other-toys", // Happy Bird – battery operated toy in a cage
  4830: "other-toys", // Quick sand painting – craft activity kit
  4680: "others", // Magnetic laptop side mount clip holder
  4507: "phone-accessories", // Mobile phone holder silicone sucker
  4568: "keychains", // Key cover
  5673: "personal-care", // Silicone smiling foot – moisturising foot socks
  5709: "personal-care", // Foot scrubbing mat
  6542: "home-storage", // Multi storage holder (makeup box)
  4549: "home-storage", // 4 drawer cosmetic organiser
  6146: "shoe-care", // Shoes pouch
  6144: "home-appliances", // Shoes dryer
  4487: "home-decor", // Magnetic curtain & magic mesh
  4611: "home-kitchen", // Butane gas cylinder
  6236: "home-kitchen", // Steel tongs oil filter
  6059: "home-cleaning", // Oil bottle brush
  4521: "home-cleaning", // Silicon bottle cleaning brush
  4520: "home-cleaning", // Pet brush
  6610: "personal-care", // Small hair brush
  4649: "home-decor", // Oval mirror
  4587: "home-appliances", // Washing machine round legs
  4477: "home-appliances", // 1.5 & 2 ton AC cover
  4828: "home-cleaning", // Magic hose
  4827: "home-kitchen", // Korea type mini sealing (bag sealer)
  6187: "auto-accessories", // Fuel dispenser
  4508: "auto-accessories", // Petrol pipe
  6015: "auto-accessories", // Alarm lock
  5806: "auto-accessories", // Bike goggles face mask
  6130: "home-kitchen", // Silicone hot mat (trivet)
  4620: "mats-rugs", // Kitchen floor mat set of 2
  4561: "mats-rugs", // Folding mat
  4496: "bath-essentials", // Duck soap holder
  4639: "home-storage", // Vacuum sucker shelf
  4557: "home-storage", // Broom holder
  4582: "home-storage", // Telescopic stool
  4574: "home-storage", // Rolling un-breakable chair
  4562: "tools-hardware", // Furniture lifter moving helper
  5890: "tools-hardware", // 46 pcs tool set
  6505: "home-decor", // Mini candle
  4823: "home-decor", // 3D wall paper
  4576: "home-decor", // Space piggy bank
  6283: "clocks", // Wooden clock
  6098: "home-cleaning", // Magic cotton mop
  4494: "home-cleaning", // Blue tablet (bathroom cleaner)
  4523: "home-cleaning", // Toilet brush
  6285: "auto-accessories", // Car cleaner brush
  4530: "home-cleaning", // Cleaning gun single battery
  4528: "home-cleaning", // Cleaning gun 48V dual battery
  6613: "home-cleaning", // Clothing stain remover wipes
  6078: "home-cleaning", // Stain remover
  6070: "home-cleaning", // Wiper
  4573: "umbrellas-rainwear", // Rain coat poncho
  4701: "umbrellas-rainwear", // Ball rain coat
  6026: "umbrellas-rainwear", // Car umbrella (sun/rain shade)
  4635: "bath-essentials", // Shower head (faucet)
  4637: "bath-essentials", // Stone filter faucet
  5827: "bath-essentials", // Splash head faucet
  4584: "bath-essentials", // Toothpaste squeezing set
  5695: "bath-essentials", // Bath loofah
  4691: "home-cleaning", // Micro fiber cloth towel (small)
  4690: "home-cleaning", // Micro fiber cloth towel (large)
  4689: "bath-essentials", // Magic towel
  4688: "bath-essentials", // Hand towel
  6620: "mats-rugs", // Stone mat
  6189: "mats-rugs", // Flower mat
  4551: "mats-rugs", // 5D mats
  4554: "mats-rugs", // Anti slip mat square
  6596: "home-kitchen", // Electric grinder
  6297: "home-kitchen", // Electric frying pan
  4569: "home-appliances", // Mini sewing machine
  4572: "home-appliances", // Portable washing machine
  5808: "personal-care", // Handheld garment & facial steamer
  5943: "personal-care", // Nail cutter set
  6158: "personal-care", // Hair wrap
  4638: "home-kitchen", // USB gas lighter
  4615: "home-kitchen", // E-lighter
  4510: "home-kitchen", // Travel dining tray
  4686: "home-kitchen", // Stainless steel lunch box
  4567: "tools-hardware", // Ivy gripe 3 meter tape
  6583: "tools-hardware", // Waterproof tape
  6585: "tools-hardware", // Waterproof silicone sealant
  6626: "tools-hardware", // Window screen repair tape
  6277: "light-items", // LED wind lamp KBE 418
  4499: "auto-accessories", // Air compressor
  4506: "auto-accessories", // Mini foot pump
  4503: "auto-accessories", // Car ashtray
  4505: "auto-accessories", // Car cup holder & tissue box
  4500: "auto-accessories", // Bike handle lock
  4492: "home-appliances", // Washing machine cover
  4548: "home-storage", // Shirt organiser
  4578: "home-storage", // Sunglass organiser
  4664: "home-storage", // 7 layer shoe rack zigzag
  4663: "home-storage", // 5 layer shoe rack
  4662: "home-storage", // 4 layer shoe rack
  4553: "home-storage", // 6 layer multipurpose cabinet
  4552: "home-storage", // 5 layer multipurpose cabinet
  4550: "home-storage", // 4 layer multipurpose cabinet
  4670: "shoe-care", // Shoe wipes
  4669: "shoe-care", // Shoes under
  4667: "shoe-care", // Shoe polish
  4666: "shoe-care", // Shoe brush
  6392: "personal-care", // V&G hair curler
  6388: "personal-care", // NHC hair curler roller
  6094: "personal-care", // Inova hair straightener
  6011: "personal-care", // Black heads remover
  6008: "personal-care", // Callus remover
  5892: "personal-care", // Hair ball trimmer
  4586: "personal-care", // Trimmer vintage T-9
  4648: "personal-care", // Nova hair dryer 6130
  4643: "personal-care", // Hair straight combo FH 909
  4641: "personal-care", // Chaoba hair dryer 2800
  6005: "home-cleaning", // 3 in 1 spray glass cleaner (id guard)
  6006: "home-cleaning", // 3 in 1 spray glass cleaner
  6028: "home-cleaning", // Multi function cleaner
  5684: "home-cleaning", // Multifunction gap cleaning brush
  6051: "home-kitchen", // 2 in 1 oil bottle
  5675: "home-kitchen", // 400 ml oil spray bottle
  4628: "home-kitchen", // Oil dispenser bottle
  4630: "home-kitchen", // Premium maggie bowl
  5796: "home-kitchen", // Cute pig plate set
  4607: "home-kitchen", // 4pcs crystal seasoning box
  4624: "home-kitchen", // Masala box 6pcs set
  4636: "home-kitchen", // Spice box
  4623: "home-kitchen", // Kitchen spray
  4621: "home-kitchen", // Kitchen gloves
  4619: "home-cleaning", // Kitchen cleaning scrub
  4626: "home-kitchen", // Multifunctional quick vegetable cutter
  4625: "home-kitchen", // Mini waffle maker
  4616: "home-kitchen", // Hand mixer
  4613: "home-kitchen", // Desktop BBQ
  4612: "home-kitchen", // Camping stove
  4575: "home-kitchen", // Round mandoline slicer
  4469: "home-kitchen", // Capsule cutter quarter
  4719: "home-kitchen", // Electric grinder coffee & juicer
  5939: "home-kitchen", // Electric kettle SC-20
  5886: "home-kitchen", // Folding electric kettle
  10395: "press-on-nails-beauty-care", // Romantic cool beautiful nails
  8395: "wallets-accessories-2", // Tommy Hilfiger navy wallet
  8358: "wallets-accessories-2", // Coach New York wallet
};

const FALLBACK_CATEGORY = "our-collection";

function classify(product) {
  const override = EXACT_CATEGORY_OVERRIDES[product.id];
  if (override) return { slug: override, via: "override" };
  const haystack = `${decodeEntities(product.name ?? "")} ${product.sku ?? ""}`.toUpperCase();
  for (const [pattern, slug] of CLASSIFIER_RULES) {
    if (pattern.test(haystack)) return { slug, via: "keyword" };
  }
  return { slug: FALLBACK_CATEGORY, via: "fallback" };
}

/* ------------------------------------------------------ product normalising */

const PLACEHOLDER_IMAGE = "/placeholder-product.svg";
const usedImageFiles = new Set();
const seenSlugs = new Map();
const warnings = [];

function uniqueSlug(preferred, id) {
  const base = preferred && preferred.trim() ? preferred.trim() : `product-${id}`;
  if (!seenSlugs.has(base)) {
    seenSlugs.set(base, id);
    return base;
  }
  const candidate = `${base}-${id}`;
  seenSlugs.set(candidate, id);
  return candidate;
}

/**
 * Most source alt texts are camera/WhatsApp filenames, which are useless to a
 * screen reader — fall back to the product name in those cases.
 */
const FILENAME_ALT = /^(whatsapp|img[-_\s]?\d|image[-_\s]?\d|photo|dsc|screenshot|untitled|\d+$)/i;

function altTextFor(rawAlt, productName, index) {
  const alt = decodeEntities(rawAlt ?? "").trim();
  const usable = alt.length > 2 && !FILENAME_ALT.test(alt) && !/\d{4}-\d{2}-\d{2}/.test(alt);
  if (usable) return alt;
  return index === 0 ? productName : `${productName} — view ${index + 1}`;
}

function normaliseImages(product) {
  const images = [];
  const productName = decodeEntities(product.name ?? "").trim() || "Product";
  for (const image of product.images ?? []) {
    const localPath = image.local_path;
    if (!localPath) continue;
    const file = path.basename(localPath);
    const absolute = path.join(IMAGE_SOURCE_DIR, file);
    if (!fs.existsSync(absolute)) {
      warnings.push(`missing image file for #${product.id}: ${localPath}`);
      continue;
    }
    usedImageFiles.add(file);
    images.push({
      src: `/images/${file}`,
      alt: altTextFor(image.alt, productName, images.length),
    });
  }
  if (images.length === 0) {
    images.push({ src: PLACEHOLDER_IMAGE, alt: decodeEntities(product.name ?? "Product image") });
  }
  return images;
}

function normaliseOptions(product) {
  const options = [];
  for (const attribute of product.attributes ?? []) {
    const values = (attribute.terms ?? [])
      .map((term) => decodeEntities(term.name ?? "").trim())
      .filter(Boolean);
    if (values.length === 0) continue;
    // Attribute names in the dump are inconsistently cased ("Color"/"color"/"COLOR").
    const rawName = decodeEntities(attribute.name ?? "Option").trim();
    const name = titleCase(slugify(rawName));
    const existing = options.find((option) => option.name.toLowerCase() === name.toLowerCase());
    const target = existing ?? { name, slug: slugify(name), values: [] };
    for (const value of values) if (!target.values.includes(value)) target.values.push(value);
    if (!existing) options.push(target);
  }
  return options;
}

const products = [];
const classified = [];

for (const product of raw) {
  const minorUnit = product.prices?.currency_minor_unit ?? 2;
  const price = money(product.prices?.price, minorUnit);
  const regularPrice = money(product.prices?.regular_price, minorUnit) || price;
  const salePrice = money(product.prices?.sale_price, minorUnit) || price;
  const onSale = Boolean(product.on_sale) && salePrice > 0 && salePrice < regularPrice;

  let categorySlugs = (product.categories ?? []).map((category) => category.slug);
  let categorySource = "source";
  if (categorySlugs.length === 0) {
    const { slug, via } = classify(product);
    categorySlugs = [slug];
    categorySource = via;
    classified.push({ id: product.id, name: product.name, slug, via });
  }
  const description = htmlToText(product.description);
  const shortDescription = htmlToText(product.short_description);
  const name = decodeEntities(product.name ?? "").trim() || `Product ${product.id}`;

  if (categorySource === "fallback") warnings.push(`unclassified #${product.id} (${name})`);
  if (price <= 0) warnings.push(`zero price for #${product.id} (${name})`);

  const images = normaliseImages(product);
  const options = normaliseOptions(product);

  products.push({
    id: product.id,
    name,
    slug: uniqueSlug(product.slug, product.id),
    sku: (product.sku ?? "").trim() || null,
    type: product.type === "variable" ? "variable" : "simple",
    price: onSale ? salePrice : price,
    regularPrice,
    onSale,
    discountPercent: onSale ? Math.round(((regularPrice - salePrice) / regularPrice) * 100) : 0,
    inStock: product.is_in_stock !== false,
    purchasable: product.is_purchasable !== false && price > 0,
    description,
    shortDescription,
    images,
    categorySlugs,
    categorySource,
    primaryCategory: categorySlugs[0] ?? null,
    options,
    variationCount: (product.variations ?? []).length,
    /** Deterministic ordering seed so "picked for you" style rails stay stable. */
    seed: Number(hashUnit(`${product.id}:${product.slug}`).toFixed(6)),
  });
}

/* ------------------------------------------------------------ category rollup */

const bySlug = new Map();
for (const product of products) {
  for (const slug of product.categorySlugs) {
    if (!bySlug.has(slug)) bySlug.set(slug, []);
    bySlug.get(slug).push(product);
  }
}

for (const [slug, list] of bySlug) {
  const node = categories.get(slug);
  if (!node) continue;
  node.directCount = list.length;
  // Prefer a landscape-ish, in-stock, well-priced hero image for category cards.
  const hero =
    list.find((product) => product.inStock && product.images[0].src !== PLACEHOLDER_IMAGE) ?? list[0];
  node.image = hero?.images[0]?.src ?? null;
  node.imageAlt = hero?.images[0]?.alt ?? null;
}

function rollup(slug, visited = new Set()) {
  if (visited.has(slug)) return 0;
  visited.add(slug);
  const node = categories.get(slug);
  if (!node) return 0;
  let total = node.directCount;
  for (const child of node.childSlugs) total += rollup(child, visited);
  node.totalCount = total;
  return total;
}

for (const node of categories.values()) if (!node.parentSlug) rollup(node.slug);
// Any node not reachable from a root (shouldn't happen) still needs a total.
for (const node of categories.values()) if (node.totalCount === 0) rollup(node.slug);

// Inherit a hero image from the first child that has one.
for (const node of categories.values()) {
  if (node.image) continue;
  for (const childSlug of node.childSlugs) {
    const child = categories.get(childSlug);
    if (child?.image) {
      node.image = child.image;
      node.imageAlt = child.imageAlt;
      break;
    }
  }
}

/* ---------------------------------------------------------------- image copy */

fs.mkdirSync(IMAGE_TARGET_DIR, { recursive: true });
let copied = 0;
let skipped = 0;
for (const file of usedImageFiles) {
  const from = path.join(IMAGE_SOURCE_DIR, file);
  const to = path.join(IMAGE_TARGET_DIR, file);
  const source = fs.statSync(from);
  if (fs.existsSync(to)) {
    const target = fs.statSync(to);
    if (target.size === source.size) {
      skipped += 1;
      continue;
    }
  }
  fs.copyFileSync(from, to);
  copied += 1;
}

/* -------------------------------------------------------------------- output */

const categoryList = [...categories.values()]
  .sort((a, b) => a.path.join("/").localeCompare(b.path.join("/")))
  .map((node) => ({
    id: node.id,
    slug: node.slug,
    name: node.name,
    sourceName: node.sourceName,
    path: node.path,
    parentSlug: node.parentSlug,
    depth: node.depth,
    childSlugs: node.childSlugs.sort(),
    directCount: node.directCount,
    totalCount: node.totalCount,
    image: node.image,
    imageAlt: node.imageAlt,
  }));

const prices = products.filter((product) => product.price > 0).map((product) => product.price);
const catalog = {
  generatedAt: new Date().toISOString(),
  currency: raw[0]?.prices?.currency_code ?? "INR",
  currencySymbol: raw[0]?.prices?.currency_symbol ?? "\u20b9",
  stats: {
    productCount: products.length,
    categoryCount: categoryList.length,
    imageCount: usedImageFiles.size,
    onSaleCount: products.filter((product) => product.onSale).length,
    minPrice: Math.min(...prices),
    maxPrice: Math.max(...prices),
  },
  categories: categoryList,
  products: products.sort((a, b) => b.id - a.id),
};

fs.mkdirSync(path.dirname(OUTPUT), { recursive: true });
fs.writeFileSync(OUTPUT, `${JSON.stringify(catalog)}\n`);

/* --------------------------------------------------------------------- report */

console.log(`→ Images: ${copied} copied, ${skipped} already current (${usedImageFiles.size} total)`);
console.log(
  `→ Catalog: ${catalog.stats.productCount} products, ${catalog.stats.categoryCount} categories, ` +
    `${catalog.stats.onSaleCount} on sale, price ${catalog.stats.minPrice}-${catalog.stats.maxPrice}`,
);
console.log(`→ Wrote ${path.relative(ROOT, OUTPUT)} (${(fs.statSync(OUTPUT).size / 1024).toFixed(0)} KB)`);

const byVia = classified.reduce((acc, entry) => {
  acc[entry.via] = (acc[entry.via] ?? 0) + 1;
  return acc;
}, {});
console.log(
  `→ Categorised ${classified.length} product(s) that had no source category ` +
    `(${Object.entries(byVia)
      .map(([via, count]) => `${count} by ${via}`)
      .join(", ")})`,
);

if (process.argv.includes("--classified")) {
  console.log("\nDerived categories");
  for (const entry of classified.sort((a, b) => a.slug.localeCompare(b.slug))) {
    console.log(`  ${entry.slug.padEnd(28)} ${entry.via.padEnd(9)} #${entry.id} ${entry.name}`);
  }
}

if (process.argv.includes("--tree")) {
  const printTree = (slug, indent = "") => {
    const node = categories.get(slug);
    console.log(
      `${indent}${node.name} (${node.slug}) — direct ${node.directCount}, total ${node.totalCount}`,
    );
    for (const child of node.childSlugs) printTree(child, `${indent}  `);
  };
  console.log("\nCategory tree");
  for (const node of categoryList) if (!node.parentSlug) printTree(node.slug);
}

if (warnings.length > 0) {
  const grouped = warnings.slice(0, 12);
  console.log(`\n! ${warnings.length} data warning(s):`);
  for (const warning of grouped) console.log(`  - ${warning}`);
  if (warnings.length > grouped.length) console.log(`  … ${warnings.length - grouped.length} more`);
}
