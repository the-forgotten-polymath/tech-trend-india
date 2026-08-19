// @ts-nocheck
"use client";

import { Check, Loader2, Plus, Ticket, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";

import { createCoupon, updateCoupon, deleteCoupon, toggleCoupon } from "@/app/admin/actions";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ code: "", label: "", type: "percent", value: "", min_subtotal: "", max_discount: "", is_active: true, usage_limit: "", expires_at: "" });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const fetchCoupons = async () => {
    const supabase = createClient();
    const { data } = await supabase.from("coupons").select("*").order("created_at", { ascending: false });
    setCoupons(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchCoupons(); }, []);

  const resetForm = () => {
    setForm({ code: "", label: "", type: "percent", value: "", min_subtotal: "", max_discount: "", is_active: true, usage_limit: "", expires_at: "" });
    setEditId(null);
    setShowForm(false);
  };

  const startEdit = (coupon) => {
    setForm({
      code: coupon.code,
      label: coupon.label,
      type: coupon.type,
      value: String(coupon.value),
      min_subtotal: String(coupon.min_subtotal),
      max_discount: String(coupon.max_discount),
      is_active: coupon.is_active,
      usage_limit: coupon.usage_limit ? String(coupon.usage_limit) : "",
      expires_at: coupon.expires_at ? coupon.expires_at.split("T")[0] : "",
    });
    setEditId(coupon.id);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const formData = new FormData();
    Object.entries(form).forEach(([k, v]) => formData.set(k, String(v)));

    let result;
    if (editId) {
      result = await updateCoupon(editId, formData);
    } else {
      result = await createCoupon(formData);
    }

    if (result.error) setMessage(`Error: ${result.error}`);
    else {
      resetForm();
      await fetchCoupons();
      setMessage(editId ? "Coupon updated" : "Coupon created");
      setTimeout(() => setMessage(""), 2000);
    }
    setSaving(false);
  };

  const handleToggle = async (id, current) => {
    await toggleCoupon(id, !current);
    await fetchCoupons();
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this coupon?")) return;
    await deleteCoupon(id);
    await fetchCoupons();
  };

  if (loading) return <div className="flex h-48 items-center justify-center"><Loader2 className="size-6 animate-spin text-ink-400" /></div>;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-ink-900">Coupons</h1>
          <p className="mt-1 text-sm text-ink-500">{coupons.length} coupon codes</p>
        </div>
        <button onClick={() => { resetForm(); setShowForm(!showForm); }} className="inline-flex items-center gap-2 rounded-lg bg-brand-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-800">
          <Plus className="size-4" /> {showForm ? "Cancel" : "Add coupon"}
        </button>
      </div>

      {message && <div className="mb-4 rounded-lg bg-emerald-50 px-4 py-2.5 text-sm font-medium text-emerald-700">{message}</div>}

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-6 rounded-xl border border-ink-100 bg-white p-5">
          <h3 className="mb-4 text-sm font-bold">{editId ? "Edit coupon" : "New coupon"}</h3>
          <div className="grid gap-3 sm:grid-cols-3">
            <input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} placeholder="CODE" className="input font-mono" required />
            <input value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} placeholder="Description (shown to user)" className="input sm:col-span-2" required />
            <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="input">
              <option value="percent">Percentage</option>
              <option value="amount">Fixed amount</option>
              <option value="shipping">Free shipping</option>
            </select>
            <input type="number" value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} placeholder={form.type === "percent" ? "% off" : "₹ off"} className="input" />
            <input type="number" value={form.min_subtotal} onChange={(e) => setForm({ ...form, min_subtotal: e.target.value })} placeholder="Min order ₹" className="input" />
            <input type="number" value={form.max_discount} onChange={(e) => setForm({ ...form, max_discount: e.target.value })} placeholder="Max discount ₹" className="input" />
            <input type="number" value={form.usage_limit} onChange={(e) => setForm({ ...form, usage_limit: e.target.value })} placeholder="Usage limit (blank = unlimited)" className="input" />
            <input type="date" value={form.expires_at} onChange={(e) => setForm({ ...form, expires_at: e.target.value })} className="input" />
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} className="size-4 accent-brand-700" />
              Active
            </label>
          </div>
          <div className="mt-4 flex gap-2">
            <button type="submit" disabled={saving} className="rounded-lg bg-brand-700 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-800 disabled:bg-brand-300">
              {saving ? "Saving…" : editId ? "Update" : "Create"}
            </button>
            <button type="button" onClick={resetForm} className="rounded-lg border border-ink-200 px-4 py-2 text-sm font-medium text-ink-600 hover:bg-ink-50">Cancel</button>
          </div>
        </form>
      )}

      <div className="overflow-hidden rounded-xl border border-ink-100 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-ink-100 bg-ink-50 text-left text-xs font-semibold text-ink-500 uppercase">
              <th className="px-4 py-3">Code</th>
              <th className="px-4 py-3">Label</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Value</th>
              <th className="px-4 py-3">Min order</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-50">
            {coupons.map((coupon) => (
              <tr key={coupon.id} className="hover:bg-ink-50/50">
                <td className="px-4 py-3"><span className="rounded bg-ink-100 px-2 py-0.5 font-mono text-xs font-bold">{coupon.code}</span></td>
                <td className="px-4 py-3 text-ink-700">{coupon.label}</td>
                <td className="px-4 py-3 capitalize text-ink-600">{coupon.type}</td>
                <td className="px-4 py-3 font-semibold">{coupon.type === "percent" ? `${coupon.value}%` : coupon.type === "amount" ? `₹${coupon.value}` : "Free"}</td>
                <td className="px-4 py-3 text-ink-500">₹{coupon.min_subtotal}</td>
                <td className="px-4 py-3">
                  <button onClick={() => handleToggle(coupon.id, coupon.is_active)} className={cn("text-xs font-semibold", coupon.is_active ? "text-emerald-600" : "text-ink-400")}>
                    {coupon.is_active ? "Active" : "Inactive"}
                  </button>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <button onClick={() => startEdit(coupon)} className="rounded p-1.5 text-ink-400 hover:bg-ink-100 hover:text-ink-700"><Ticket className="size-3.5" /></button>
                    <button onClick={() => handleDelete(coupon.id)} className="rounded p-1.5 text-ink-400 hover:bg-sale-50 hover:text-sale-600"><Trash2 className="size-3.5" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
