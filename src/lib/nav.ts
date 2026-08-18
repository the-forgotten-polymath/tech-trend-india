import { getCategory } from "./catalog";
import { collections, departments } from "./taxonomy";

/** Serialisable navigation payload handed to the client header. */
export type NavLink = {
  slug: string;
  name: string;
  count: number;
};

export type NavSpotlight = NavLink & {
  image: string | null;
};

export type NavDepartment = {
  slug: string;
  label: string;
  blurb: string;
  count: number;
  columns: { heading: string; items: NavLink[] }[];
  spotlight: NavSpotlight[];
};

export type NavData = {
  departments: NavDepartment[];
  collections: { slug: string; title: string }[];
};

function toLink(slug: string): NavLink | null {
  const category = getCategory(slug);
  if (!category) return null;
  return { slug: category.slug, name: category.name, count: category.totalCount };
}

export function getNavData(): NavData {
  return {
    departments: departments.map((department) => {
      const self = getCategory(department.slug);
      return {
        slug: department.slug,
        label: department.label,
        blurb: department.blurb,
        count: self?.totalCount ?? 0,
        columns: department.columns.map((column) => ({
          heading: column.heading,
          items: column.items
            .map(toLink)
            .filter((item): item is NavLink => Boolean(item)),
        })),
        spotlight: department.spotlight
          .map((slug) => {
            const category = getCategory(slug);
            if (!category) return null;
            return {
              slug: category.slug,
              name: category.name,
              count: category.totalCount,
              image: category.image,
            };
          })
          .filter((item): item is NavSpotlight => Boolean(item)),
      };
    }),
    collections: collections.map((collection) => ({
      slug: collection.slug,
      title: collection.title,
    })),
  };
}
