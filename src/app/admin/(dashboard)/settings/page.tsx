// @ts-nocheck
"use client";

import { Check, Loader2, Save, Settings } from "lucide-react";
import { useEffect, useState } from "react";

import { updateSettings } from "@/app/admin/actions";
import { createClient } from "@/lib/supabase/client";

const SETTING_LABELS = {
  store_name: "Store name",
  store_tagline: "Tagline",
  store_email: "Contact email",
  store_phone: "Phone number",
  store_whatsapp: "WhatsApp number",
  store_address: "Warehouse address",
  free_shipping_threshold: "Free shipping threshold (₹)",
  shipping_flat_rate: "Standard shipping rate (₹)",
  express_shipping_rate: "Express shipping rate (₹)",
  cod_fee: "COD handling fee (₹)",
  return_window_days: "Return window (days)",
  announcement_text: "Announcement bar text",
};

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.from("store_settings").select("key, value").then(({ data }) => {
      const map = {};
      (data || []).forEach((s) => { map[s.key] = typeof s.value === "string" ? s.value.replace(/^"|"$/g, "") : s.value; });
      setSettings(map);
      setLoading(false);
    });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    const entries = Object.entries(settings).map(([key, value]) => ({
      key,
      value: typeof value === "number" ? value : JSON.stringify(value),
    }));
    await updateSettings(entries);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  if (loading) return <div className="flex h-48 items-center justify-center"><Loader2 className="size-6 animate-spin text-ink-400" /></div>;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-ink-900">Store Settings</h1>
          <p className="mt-1 text-sm text-ink-500">Changes affect the live storefront immediately</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-lg bg-brand-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-800 disabled:bg-brand-300"
        >
          {saving ? <Loader2 className="size-4 animate-spin" /> : saved ? <Check className="size-4" /> : <Save className="size-4" />}
          {saving ? "Saving…" : saved ? "Saved!" : "Save all changes"}
        </button>
      </div>

      <div className="rounded-xl border border-ink-100 bg-white p-6">
        <div className="grid gap-5 sm:grid-cols-2">
          {Object.entries(SETTING_LABELS).map(([key, label]) => (
            <div key={key}>
              <label className="mb-1.5 block text-sm font-medium text-ink-700">{label}</label>
              <input
                value={settings[key] ?? ""}
                onChange={(e) => setSettings((s) => ({ ...s, [key]: e.target.value }))}
                className="input"
              />
            </div>
          ))}
        </div>

        <div className="mt-6 rounded-lg bg-ink-50 p-4">
          <h3 className="text-sm font-bold text-ink-700">Other settings</h3>
          <p className="mt-1 text-xs text-ink-500">These are stored as JSON and can be edited in Supabase Dashboard directly:</p>
          <ul className="mt-2 text-xs text-ink-500">
            {Object.keys(settings).filter((k) => !SETTING_LABELS[k]).map((k) => (
              <li key={k} className="font-mono">{k}: {JSON.stringify(settings[k]).slice(0, 60)}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
