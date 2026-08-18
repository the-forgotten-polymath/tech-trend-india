export type ProductImage = {
  src: string;
  alt: string;
};

export type ProductOption = {
  name: string;
  slug: string;
  values: string[];
};

export type Product = {
  id: number;
  name: string;
  slug: string;
  sku: string | null;
  type: "simple" | "variable";
  /** Current selling price in rupees. */
  price: number;
  /** Pre-discount price in rupees (equals `price` when not discounted). */
  regularPrice: number;
  onSale: boolean;
  discountPercent: number;
  inStock: boolean;
  purchasable: boolean;
  description: string;
  shortDescription: string;
  images: ProductImage[];
  categorySlugs: string[];
  categorySource: "source" | "keyword" | "override" | "fallback";
  primaryCategory: string | null;
  options: ProductOption[];
  variationCount: number;
  /** Stable 0–1 value used for deterministic shuffles and demo review counts. */
  seed: number;
};

export type Category = {
  id: number | null;
  slug: string;
  name: string;
  sourceName: string | null;
  path: string[];
  parentSlug: string | null;
  depth: number;
  childSlugs: string[];
  directCount: number;
  totalCount: number;
  image: string | null;
  imageAlt: string | null;
};

export type CatalogStats = {
  productCount: number;
  categoryCount: number;
  imageCount: number;
  onSaleCount: number;
  minPrice: number;
  maxPrice: number;
};

export type Catalog = {
  generatedAt: string;
  currency: string;
  currencySymbol: string;
  stats: CatalogStats;
  categories: Category[];
  products: Product[];
};

export type SortKey = "featured" | "newest" | "price-asc" | "price-desc" | "discount" | "name-asc";

export type ProductQuery = {
  categorySlug?: string;
  /** Free-text query matched against name, SKU and category names. */
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  onSale?: boolean;
  inStock?: boolean;
  sort?: SortKey;
  page?: number;
  perPage?: number;
};

export type ProductQueryResult = {
  items: Product[];
  total: number;
  page: number;
  perPage: number;
  pageCount: number;
};
