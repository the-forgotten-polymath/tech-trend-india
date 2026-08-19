// @ts-nocheck
"use client";

import { Image as ImageIcon, Loader2, Plus, Save, Trash2, Upload, X } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useRef, useState } from "react";

import { createProduct, updateProduct, deleteProduct, uploadProductImage, deleteProductImage } from "@/app/admin/actions";
import { cn } from "@/lib/utils";

type ProductImage = { id?: number; url: string; alt: string; sort_order: number };
type ProductOption = { name: string; slug: string; values: string[] };
type Category = { id: number; slug: string; name: string; parent_id: number | null };

type ProductData = {
  id?: number;
  name: string;
  slug: string;
  sku: string;
  type: string;
  description: string;
  short_description: string;
  price: number;
  regular_price: number;
  in_stock: boolean;
  is_featured: boolean;
  primary_category_id: number | null;
  images: ProductImage[];
  options: ProductOption[];
};

const EMPTY_PRODUCT: ProductData = {
  name: "",
  slug: "",
  sku: "",
  type: "simple",
  description: "",
  short_description: "",
  price: 0,
  regular_price: 0,
  in_stock: true,
  is_featured: false,
  primary_category_id: null,
  images: [],
  options: [],
};

export function ProductForm({
  product = EMPTY_PRODUCT,
  categories,
  isEdit = false,
}: {
  product?: ProductData;
  categories: Category[];
  isEdit?: boolean;
}) {
  const router = useRouter();
  const [data, setData] = useState<ProductData>(product);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const set = (key: keyof ProductData, value: any) => setData((d) => ({ ...d, [key]: value }));

  const autoSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 80);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);

    const formData = new FormData();
    formData.set("name", data.name);
    formData.set("slug", data.slug || autoSlug(data.name));
    formData.set("sku", data.sku);
    formData.set("type", data.type);
    formData.set("description", data.description);
    formData.set("short_description", data.short_description);
    formData.set("price", String(data.price));
    formData.set("regular_price", String(data.regular_price || data.price));
    formData.set("in_stock", String(data.in_stock));
    formData.set("is_featured", String(data.is_featured));
    formData.set("primary_category_id", String(data.primary_category_id || ""));
    formData.set("options_json", JSON.stringify(data.options));

    let result;
    if (isEdit && data.id) {
      result = await updateProduct(data.id, formData);
    } else {
      result = await createProduct(formData);
    }

    if (result.error) {
      setError(result.error);
      setSaving(false);
      return;
    }

    if (!isEdit && result.productId) {
      router.push(`/admin/products/${result.productId}`);
    } else {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!data.id || !confirm("Delete this product permanently? This cannot be undone.")) return;
    setDeleting(true);
    const result = await deleteProduct(data.id);
    if (result.error) { setError(result.error); setDeleting(false); return; }
    router.push("/admin/products");
  };

  const handleImageUpload = async (files: FileList | null) => {
    if (!files || !data.id) return;
    setUploadingImage(true);
    for (const file of Array.from(files)) {
      const formData = new FormData();
      formData.set("file", file);
      const result = await uploadProductImage(data.id, formData);
      if (result.error) { setError(result.error); break; }
      if (result.url) {
        setData((d) => ({
          ...d,
          images: [...d.images, { url: result.url!, alt: file.name, sort_order: d.images.length }],
        }));
      }
    }
    setUploadingImage(false);
  };

  const handleImageDelete = async (imageId: number | undefined, index: number) => {
    if (imageId && data.id) {
      await deleteProductImage(imageId, data.id);
    }
    setData((d) => ({ ...d, images: d.images.filter((_, i) => i !== index) }));
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    handleImageUpload(e.dataTransfer.files);
  }, [data.id]);

  // Options management
  const addOption = () => {
    setData((d) => ({ ...d, options: [...d.options, { name: "", slug: "", values: [] }] }));
  };
  const updateOption = (index: number, field: string, value: any) => {
    setData((d) => ({
      ...d,
      options: d.options.map((o, i) => i === index ? { ...o, [field]: value } : o),
    }));
  };
  const removeOption = (index: number) => {
    setData((d) => ({ ...d, options: d.options.filter((_, i) => i !== index) }));
  };

  const roots = categories.filter((c) => !c.parent_id);
  const children = categories.filter((c) => c.parent_id);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-lg bg-sale-50 px-4 py-3 text-sm font-medium text-sale-700">
          {error}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main content */}
        <div className="space-y-6 lg:col-span-2">
          <Card title="Basic info">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Product name" required className="sm:col-span-2">
                <input
                  value={data.name}
                  onChange={(e) => {
                    set("name", e.target.value);
                    if (!isEdit) set("slug", autoSlug(e.target.value));
                  }}
                  className="input"
                  required
                />
              </Field>
              <Field label="URL slug">
                <input
                  value={data.slug}
                  onChange={(e) => set("slug", e.target.value)}
                  className="input font-mono text-xs"
                  placeholder="auto-generated-from-name"
                />
              </Field>
              <Field label="SKU">
                <input value={data.sku} onChange={(e) => set("sku", e.target.value)} className="input" />
              </Field>
              <Field label="Short description" className="sm:col-span-2">
                <input
                  value={data.short_description}
                  onChange={(e) => set("short_description", e.target.value)}
                  className="input"
                  placeholder="Brief tagline for search results"
                />
              </Field>
              <Field label="Full description" className="sm:col-span-2">
                <textarea
                  value={data.description}
                  onChange={(e) => set("description", e.target.value)}
                  rows={5}
                  className="input"
                  placeholder="Detailed product description"
                />
              </Field>
            </div>
          </Card>

          <Card title="Pricing">
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Selling price (₹)" required>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={data.price || ""}
                  onChange={(e) => set("price", parseFloat(e.target.value) || 0)}
                  className="input"
                  required
                />
              </Field>
              <Field label="MRP / Regular price (₹)">
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={data.regular_price || ""}
                  onChange={(e) => set("regular_price", parseFloat(e.target.value) || 0)}
                  className="input"
                  placeholder="Leave blank if no discount"
                />
              </Field>
              <Field label="Discount">
                <div className="flex h-11 items-center rounded-lg border border-ink-200 bg-ink-50 px-3 text-sm text-ink-600">
                  {data.regular_price > data.price && data.price > 0
                    ? `${Math.round(((data.regular_price - data.price) / data.regular_price) * 100)}% off`
                    : "No discount"}
                </div>
              </Field>
            </div>
          </Card>

          {/* Images */}
          {isEdit && data.id ? (
            <Card title="Images">
              <div
                className="rounded-xl border-2 border-dashed border-ink-200 p-6 text-center transition hover:border-brand-300"
                onDragOver={(e) => e.preventDefault()}
                onDrop={onDrop}
              >
                {uploadingImage ? (
                  <div className="flex items-center justify-center gap-2 text-sm text-ink-500">
                    <Loader2 className="size-4 animate-spin" />
                    Uploading…
                  </div>
                ) : (
                  <>
                    <Upload className="mx-auto size-8 text-ink-300" />
                    <p className="mt-2 text-sm text-ink-600">
                      Drag & drop images here, or{" "}
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="font-semibold text-brand-700 hover:underline"
                      >
                        browse
                      </button>
                    </p>
                    <p className="mt-1 text-xs text-ink-400">JPEG, PNG, WebP — max 5 MB each</p>
                  </>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/avif"
                  multiple
                  className="hidden"
                  onChange={(e) => handleImageUpload(e.target.files)}
                />
              </div>

              {data.images.length > 0 && (
                <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-5">
                  {data.images.map((img, index) => (
                    <div key={img.url} className="group relative aspect-square overflow-hidden rounded-xl border border-ink-100 bg-ink-50">
                      <Image src={img.url} alt={img.alt} fill sizes="120px" className="object-cover" />
                      <button
                        type="button"
                        onClick={() => handleImageDelete(img.id, index)}
                        className="absolute top-1.5 right-1.5 flex size-7 items-center justify-center rounded-full bg-white/90 text-ink-500 opacity-0 shadow-card transition group-hover:opacity-100 hover:text-sale-600"
                        aria-label="Delete image"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                      {index === 0 && (
                        <span className="absolute bottom-1.5 left-1.5 rounded bg-brand-700 px-1.5 py-0.5 text-[9px] font-bold text-white">
                          MAIN
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </Card>
          ) : (
            <Card title="Images">
              <p className="text-sm text-ink-500">
                Save the product first, then you can upload images.
              </p>
            </Card>
          )}

          {/* Options */}
          <Card title="Options / Variants">
            {data.options.map((opt, index) => (
              <div key={index} className="mb-4 rounded-lg border border-ink-100 bg-ink-50 p-4">
                <div className="flex items-center gap-3">
                  <input
                    value={opt.name}
                    onChange={(e) => {
                      updateOption(index, "name", e.target.value);
                      updateOption(index, "slug", e.target.value.toLowerCase().replace(/\s+/g, "-"));
                    }}
                    placeholder="Option name (e.g. Color)"
                    className="input flex-1"
                  />
                  <button type="button" onClick={() => removeOption(index)} className="p-2 text-ink-400 hover:text-sale-600">
                    <X className="size-4" />
                  </button>
                </div>
                <div className="mt-3">
                  <input
                    value={opt.values.join(", ")}
                    onChange={(e) => updateOption(index, "values", e.target.value.split(",").map((v) => v.trim()).filter(Boolean))}
                    placeholder="Values separated by commas (e.g. Red, Blue, Green)"
                    className="input text-sm"
                  />
                  <p className="mt-1 text-xs text-ink-400">{opt.values.length} values</p>
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={addOption}
              className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-ink-300 px-3 py-2 text-sm font-medium text-ink-600 hover:border-brand-400 hover:text-brand-700"
            >
              <Plus className="size-4" /> Add option
            </button>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card title="Status">
            <div className="space-y-3">
              <label className="flex items-center gap-3 text-sm">
                <input
                  type="checkbox"
                  checked={data.in_stock}
                  onChange={(e) => set("in_stock", e.target.checked)}
                  className="size-4 accent-brand-700"
                />
                <span className="font-medium">In stock</span>
              </label>
              <label className="flex items-center gap-3 text-sm">
                <input
                  type="checkbox"
                  checked={data.is_featured}
                  onChange={(e) => set("is_featured", e.target.checked)}
                  className="size-4 accent-brand-700"
                />
                <span className="font-medium">Featured product</span>
              </label>
              <Field label="Product type">
                <select
                  value={data.type}
                  onChange={(e) => set("type", e.target.value)}
                  className="input"
                >
                  <option value="simple">Simple</option>
                  <option value="variable">Variable (has options)</option>
                </select>
              </Field>
            </div>
          </Card>

          <Card title="Category">
            <select
              value={data.primary_category_id || ""}
              onChange={(e) => set("primary_category_id", e.target.value ? parseInt(e.target.value) : null)}
              className="input"
            >
              <option value="">No category</option>
              {roots.map((cat) => (
                <optgroup key={cat.id} label={cat.name}>
                  <option value={cat.id}>{cat.name}</option>
                  {children.filter((c) => c.parent_id === cat.id).map((child) => (
                    <option key={child.id} value={child.id}>
                      — {child.name}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </Card>

          <Card title="Actions">
            <div className="space-y-3">
              <button
                type="submit"
                disabled={saving || !data.name}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-800 disabled:bg-brand-300"
              >
                {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
                {saving ? "Saving…" : isEdit ? "Save changes" : "Create product"}
              </button>

              {isEdit && (
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={deleting}
                  className="flex w-full items-center justify-center gap-2 rounded-lg border border-sale-200 bg-sale-50 px-4 py-2.5 text-sm font-semibold text-sale-700 transition hover:bg-sale-100 disabled:opacity-50"
                >
                  {deleting ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
                  {deleting ? "Deleting…" : "Delete product"}
                </button>
              )}
            </div>
          </Card>
        </div>
      </div>
    </form>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-ink-100 bg-white p-5">
      <h3 className="mb-4 text-sm font-bold text-ink-900">{title}</h3>
      {children}
    </div>
  );
}

function Field({ label, required, className, children }: { label: string; required?: boolean; className?: string; children: React.ReactNode }) {
  return (
    <div className={className}>
      <label className="mb-1.5 block text-sm font-medium text-ink-700">
        {label}{required && <span className="text-sale-600"> *</span>}
      </label>
      {children}
    </div>
  );
}
