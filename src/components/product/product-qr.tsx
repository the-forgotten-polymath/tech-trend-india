import QRCode from "react-qr-code";
import { QrCode } from "lucide-react";

export function ProductQR({ url }: { url: string }) {
  return (
    <div className="rounded-2xl border border-ink-100 bg-white p-6 mt-6 flex flex-col items-center text-center">
      <div className="flex items-center gap-2 mb-4 text-ink-900 font-semibold">
        <QrCode className="size-5 text-brand-600" aria-hidden />
        <h3>Scan to buy on mobile</h3>
      </div>
      <div className="p-3 bg-white rounded-xl shadow-sm border border-ink-50">
        <QRCode
          value={url}
          size={140}
          bgColor="#FFFFFF"
          fgColor="#1a1a1a"
          level="L"
        />
      </div>
      <p className="mt-4 text-xs text-ink-500">
        Point your phone's camera at this code to quickly open this page and checkout.
      </p>
    </div>
  );
}
