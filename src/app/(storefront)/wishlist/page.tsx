import type { Metadata } from "next";

import { PageHeader } from "@/components/shop/page-header";
import { WishlistView } from "@/components/product/wishlist-view";

export const metadata: Metadata = {
  title: "Your wishlist",
  robots: { index: false, follow: false },
};

export default function WishlistPage() {
  return (
    <>
      <PageHeader
        crumbs={[{ label: "Home", href: "/" }, { label: "Wishlist" }]}
        title="Your wishlist"
        description="Saved for later, stored in this browser. Move items to your bag when you're ready."
      />
      <div className="container-page py-8 sm:py-10">
        <WishlistView />
      </div>
    </>
  );
}
