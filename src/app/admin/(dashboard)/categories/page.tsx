// @ts-nocheck
"use client";

import { Check, FolderTree, Loader2, Pencil, Plus, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";

import { createCategory, updateCategory, deleteCategory } from "@/app/admin/actions";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState("");
  const [newSlug, setNewSlug] = useState("");
  const [newParent, setNewParent] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const fetchCategories = async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from("categories_with_count")
      .select("*")
      .order("sort_order", { ascending: true });
    setCategories(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchCategories(); }, []);

  const roots = categories.filter((c) => !c.parent_id);
  const children = categories.filter((c) => c.parent_id);

  const handleRename = async (id, name) => {
    setSaving(true);
    await updateCategory(id, { name });
    setEditingId(null);
    await fetchCategories();
    setSaving(false);
    setMessage("Category renamed");
    setTimeout(() => setMessage(""), 2000);
  };

  const handleToggleActive = async (id, current) => {
    await updateCategory(id, { is_active: !current });
    await fetchCategories();
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this category? Products won't be deleted, just unlinked.")) return;
    const result = await deleteCategory(id);
    if (result.error) setMessage(`Error: ${result.error}`);
    else await fetchCategories();
  };

  const handleAdd = async () => {
    if (!newName) return;
    setSaving(true);
    const formData = new FormData();
    formData.set("name", newName);
    formData.set("slug", newSlug || newName.toLowerCase().replace(/[^a-z0-9]+/g, "-"));
    if (newParent) formData.set("parent_id", newParent);
    const result = await createCategory(formData);
    if (result.error) setMessage(`Error: ${result.error}`);
    else {
      setNewName(""); setNewSlug(""); setNewParent(""); setShowAdd(false);
      await fetchCategories();
      setMessage("Category created");
      setTimeout(() => setMessage(""), 2000);
    }
    setSaving(false);
  };

  if (loading) return <div className="flex h-48 items-center justify-center"><Loader2 className="size-6 animate-spin text-ink-400" /></div>;

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-ink-900">Categories</h1>
          <p className="mt-1 text-sm text-ink-500">{categories.length} categories · click pencil to rename</p>
        </div>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="inline-flex items-center gap-2 rounded-lg bg-brand-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-800"
        >
          <Plus className="size-4" /> Add category
        </button>
      </div>

      {message && (
        <div className="mb-4 rounded-lg bg-emerald-50 px-4 py-2.5 text-sm font-medium text-emerald-700">{message}</div>
      )}

      {showAdd && (
        <div className="mb-6 rounded-xl border border-ink-100 bg-white p-5">
          <h3 className="mb-3 text-sm font-bold">New category</h3>
          <div className="grid gap-3 sm:grid-cols-4">
            <input value={newName} onChange={(e) => { setNewName(e.target.value); setNewSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-")); }} placeholder="Category name" className="input" />
            <input value={newSlug} onChange={(e) => setNewSlug(e.target.value)} placeholder="slug" className="input font-mono text-xs" />
            <select value={newParent} onChange={(e) => setNewParent(e.target.value)} className="input">
              <option value="">No parent (root)</option>
              {roots.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <button onClick={handleAdd} disabled={saving || !newName} className="rounded-lg bg-brand-700 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-800 disabled:bg-brand-300">
              {saving ? "Creating…" : "Create"}
            </button>
          </div>
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-ink-100 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-ink-100 bg-ink-50 text-left text-xs font-semibold text-ink-500 uppercase">
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Slug</th>
              <th className="px-4 py-3">Products</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-50">
            {roots.map((cat) => {
              const subs = children.filter((c) => c.parent_id === cat.id);
              return (
                <>
                  <CategoryRow
                    key={cat.id}
                    cat={cat}
                    isChild={false}
                    editing={editingId === cat.id}
                    editName={editName}
                    setEditName={setEditName}
                    onStartEdit={() => { setEditingId(cat.id); setEditName(cat.name); }}
                    onSaveEdit={() => handleRename(cat.id, editName)}
                    onCancelEdit={() => setEditingId(null)}
                    onToggleActive={() => handleToggleActive(cat.id, cat.is_active)}
                    onDelete={() => handleDelete(cat.id)}
                    saving={saving}
                  />
                  {subs.map((sub) => (
                    <CategoryRow
                      key={sub.id}
                      cat={sub}
                      isChild
                      editing={editingId === sub.id}
                      editName={editName}
                      setEditName={setEditName}
                      onStartEdit={() => { setEditingId(sub.id); setEditName(sub.name); }}
                      onSaveEdit={() => handleRename(sub.id, editName)}
                      onCancelEdit={() => setEditingId(null)}
                      onToggleActive={() => handleToggleActive(sub.id, sub.is_active)}
                      onDelete={() => handleDelete(sub.id)}
                      saving={saving}
                    />
                  ))}
                </>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function CategoryRow({ cat, isChild, editing, editName, setEditName, onStartEdit, onSaveEdit, onCancelEdit, onToggleActive, onDelete, saving }) {
  return (
    <tr className="hover:bg-ink-50/50">
      <td className={cn("px-4 py-3", isChild && "pl-10")}>
        {editing ? (
          <div className="flex items-center gap-2">
            <input value={editName} onChange={(e) => setEditName(e.target.value)} className="input h-8 w-48 text-sm" autoFocus onKeyDown={(e) => e.key === "Enter" && onSaveEdit()} />
            <button onClick={onSaveEdit} disabled={saving} className="text-emerald-600 hover:text-emerald-700"><Check className="size-4" /></button>
            <button onClick={onCancelEdit} className="text-ink-400 hover:text-ink-600"><X className="size-4" /></button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            {isChild && <span className="text-ink-300">└</span>}
            <FolderTree className={cn("size-4", isChild ? "text-ink-400" : "text-brand-600")} />
            <span className={cn("font-medium", isChild ? "text-ink-700" : "text-ink-900")}>{cat.name}</span>
          </div>
        )}
      </td>
      <td className="px-4 py-3 font-mono text-xs text-ink-500">{cat.slug}</td>
      <td className="px-4 py-3 font-medium">{cat.product_count}</td>
      <td className="px-4 py-3">
        <button onClick={onToggleActive} className={cn("text-xs font-semibold", cat.is_active ? "text-emerald-600" : "text-ink-400")}>
          {cat.is_active ? "Active" : "Hidden"}
        </button>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <button onClick={onStartEdit} className="rounded p-1.5 text-ink-400 hover:bg-ink-100 hover:text-ink-700" title="Rename">
            <Pencil className="size-3.5" />
          </button>
          <button onClick={onDelete} className="rounded p-1.5 text-ink-400 hover:bg-sale-50 hover:text-sale-600" title="Delete">
            <Trash2 className="size-3.5" />
          </button>
        </div>
      </td>
    </tr>
  );
}
