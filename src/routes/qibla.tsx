import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useRef } from "react";
import { MapPin, Navigation2, RefreshCw, Compass, AlertCircle } from "lucide-react";
import { qiblaBearing } from "@/lib/islamic";
import { useGeolocation } from "@/lib/geo";

export const Route = createFileRoute("/qibla")({
  head: () => ({
    meta: [
      { title: "اتجاه القبلة — سكينة" },
      { name: "description", content: "بوصلة قبلة دقيقة مع حساب المسافة إلى مكة المكرمة." },
    ],
  }),
  component: QiblaPage,
});

const KAABA = { lat: 21.4225, lng: 39.8262 };

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function QiblaPage() {
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [heading, setHeading] = useState<number | null>(null);
  const [bearing, setBearing] = useState<number | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "no-location" | "no-compass">("idle");
  const [permError, setPermError] = useState<string | null>(null);
  const [accuracy, setAccuracy] = useState<"high" | "low" | null>(null);
  const headingHistory = useRef<number[]>([]);

  // Smooth heading using moving average
  function smoothHeading(raw: number): number {
    headingHistory.current.push(raw);
    if (headingHistory.current.length > 8) headingHistory.current.shift();
    // Circular mean
    let sinSum = 0, cosSum = 0;
    for (const h of headingHistory.current) {
      const rad = (h * Math.PI) / 180;
      sinSum += Math.sin(rad);
      cosSum += Math.cos(rad);
    }
    return ((Math.atan2(sinSum, cosSum) * 180) / Math.PI + 360) % 360;
  }

  // Request iOS compass permission
  async function requestCompassPermission() {
    const D = (window as any).DeviceOrientationEvent;
    if (D && typeof D.requestPermission === "function") {
      try {
        const result = await D.requestPermission();
        if (result !== "granted") {
          setPermError("لم يُسمح باستخدام البوصلة. يرجى السماح في إعدادات المتصفح.");
        }
      } catch {
        setPermError("تعذّر طلب إذن البوصلة.");
      }
    }
  }

  useEffect(() => {
    setStatus("loading");

    // Get location
    useGeolocation().then((c) => {
      if (c) {
        setCoords(c);
        const b = qiblaBearing(c.lat, c.lng);
        setBearing(b);
        setDistance(haversineKm(c.lat, c.lng, KAABA.lat, KAABA.lng));
        setStatus("ok");
      } else {
        // Try cached coords
        const cached = localStorage.getItem("coords");
        if (cached) {
          const c2 = JSON.parse(cached);
          setCoords(c2);
          setBearing(qiblaBearing(c2.lat, c2.lng));
          setDistance(haversineKm(c2.lat, c2.lng, KAABA.lat, KAABA.lng));
          setStatus("ok");
        } else {
          setStatus("no-location");
        }
      }
    });

    // Request iOS permission proactively
    requestCompassPermission();

    // Listen for device orientation
    function handleOrientation(e: DeviceOrientationEvent & { webkitCompassHeading?: number }) {
      // webkitCompassHeading: iOS (0 = North, increases clockwise) — most reliable
      const iosHeading = (e as any).webkitCompassHeading;
      if (iosHeading != null && !isNaN(iosHeading)) {
        setHeading(smoothHeading(iosHeading));
        setAccuracy(iosHeading >= 0 ? "high" : "low");
        return;
      }
      // alpha: rotation around Z axis (Android) — 0=North but increases counter-clockwise
      if (e.alpha != null && !isNaN(e.alpha)) {
        const androidHeading = (360 - e.alpha) % 360;
        setHeading(smoothHeading(androidHeading));
        setAccuracy(e.absolute ? "high" : "low");
      }
    }

    if (typeof window !== "undefined" && "DeviceOrientationEvent" in window) {
      window.addEventListener("deviceorientationabsolute" as any, handleOrientation as any, true);
      window.addEventListener("deviceorientation", handleOrientation as any, true);
      return () => {
        window.removeEventListener("deviceorientationabsolute" as any, handleOrientation as any, true);
        window.removeEventListener("deviceorientation", handleOrientation as any, true);
      };
    }
  }, []);

  // Rotation to apply to compass needle
  // needle rotation = bearing (qibla direction from North) - heading (where device points)
  const rotation = bearing != null && heading != null
    ? bearing - heading
    : (bearing ?? 0);

  const aligned =
    heading != null &&
    bearing != null &&
    Math.abs(((rotation % 360) + 360) % 360 - 0) < 8;

  const hasGyro = heading !== null;

  return (
    <div className="fade-up min-h-dvh flex flex-col">
      {/* Header */}
      <header className="px-5 pt-6 pb-4">
        <h1 className="font-quran text-3xl text-foreground">اتجاه القبلة</h1>
        <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            {coords
              ? `${coords.lat.toFixed(2)}°, ${coords.lng.toFixed(2)}°`
              : status === "loading" ? "جاري تحديد الموقع…"
              : status === "no-location" ? "تعذّر تحديد الموقع"
              : "—"}
          </span>
          {distance && (
            <span className="flex items-center gap-1 text-primary font-semibold">
              <Navigation2 className="h-3 w-3" />
              {distance.toLocaleString("ar", { maximumFractionDigits: 0 })} كم
            </span>
          )}
        </div>
      </header>

      {/* Compass */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-6">
        {/* Compass container */}
        <div className="relative w-72 h-72 sm:w-80 sm:h-80">
          {/* Outer ring */}
          <div className={`absolute inset-0 rounded-full border-4 transition-all duration-300 ${
            aligned
              ? "border-emerald-500 shadow-[0_0_40px_rgba(16,185,129,0.4)]"
              : "border-border/40"
          }`} />

          {/* Cardinal directions */}
          {[
            { label: "N", deg: 0,   cls: "top-3 left-1/2 -translate-x-1/2" },
            { label: "S", deg: 180, cls: "bottom-3 left-1/2 -translate-x-1/2" },
            { label: "E", deg: 90,  cls: "right-3 top-1/2 -translate-y-1/2" },
            { label: "W", deg: 270, cls: "left-3 top-1/2 -translate-y-1/2" },
          ].map(({ label, cls }) => (
            <span key={label} className={`absolute text-xs font-bold text-muted-foreground z-10 ${cls}`}>
              {label}
            </span>
          ))}

          {/* Tick marks */}
          {Array.from({ length: 36 }).map((_, i) => (
            <div
              key={i}
              className="absolute inset-0 flex items-start justify-center"
              style={{ transform: `rotate(${i * 10}deg)` }}
            >
              <div className={`mt-4 rounded-full ${i % 9 === 0 ? "h-4 w-1 bg-border" : "h-2 w-0.5 bg-border/50"}`} />
            </div>
          ))}

          {/* Rotating compass body */}
          <div
            className="absolute inset-8 rounded-full flex items-center justify-center transition-all"
            style={{
              transform: `rotate(${-heading ?? 0}deg)`,
              transition: heading != null ? "transform 0.15s linear" : "none",
            }}
          >
            {/* Kaaba needle */}
            <div
              className="absolute inset-0 flex items-center justify-center"
              style={{ transform: `rotate(${bearing ?? 0}deg)` }}
            >
              {/* Needle pointing to Qibla */}
              <div className="absolute" style={{ top: "8%" }}>
                <div className="flex flex-col items-center">
                  <div className="w-0 h-0"
                    style={{
                      borderLeft: "8px solid transparent",
                      borderRight: "8px solid transparent",
                      borderBottom: `30px solid ${aligned ? "oklch(0.62 0.145 162)" : "oklch(0.55 0.18 30)"}`,
                    }}
                  />
                  <div className="w-0 h-0 mt-0.5"
                    style={{
                      borderLeft: "8px solid transparent",
                      borderRight: "8px solid transparent",
                      borderTop: "24px solid oklch(0.65 0.05 0)",
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Kaaba icon in center */}
            <div className={`relative z-10 grid h-14 w-14 place-items-center rounded-2xl shadow-lg transition-all ${
              aligned
                ? "bg-emerald-600 text-white shadow-[0_0_20px_rgba(16,185,129,0.5)]"
                : "bg-card border border-border/60"
            }`}>
              <span className="text-2xl">🕋</span>
            </div>
          </div>
        </div>

        {/* Status info */}
        <div className="mt-8 text-center space-y-3">
          {aligned && (
            <div className="flex items-center justify-center gap-2 rounded-full px-5 py-2.5 bg-emerald-500/15 border border-emerald-500/30">
              <span className="text-lg">✅</span>
              <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                أنت تواجه القبلة
              </p>
            </div>
          )}

          {bearing !== null && (
            <p className="text-sm text-muted-foreground">
              اتجاه القبلة: <span className="font-bold text-foreground">{Math.round(bearing)}°</span> من الشمال
            </p>
          )}

          {!hasGyro && status === "ok" && (
            <div className="flex items-start gap-2 rounded-2xl bg-amber-500/10 border border-amber-500/20 p-3 text-right max-w-xs">
              <AlertCircle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs text-amber-700 dark:text-amber-300 font-semibold">البوصلة غير متاحة</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  السهم يشير لاتجاه القبلة لكن بدون جيروسكوب. وجّه الهاتف للشمال أولاً.
                </p>
              </div>
            </div>
          )}

          {permError && (
            <div className="rounded-2xl bg-rose-500/10 border border-rose-500/20 p-3 text-xs text-rose-600 dark:text-rose-400 max-w-xs">
              {permError}
            </div>
          )}

          {status === "no-location" && (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">تعذّر الوصول للموقع</p>
              <button
                onClick={() => window.location.reload()}
                className="flex items-center gap-2 mx-auto rounded-full px-4 py-2 text-sm font-semibold text-white shadow-lg"
                style={{ background: "var(--g-primary)" }}
              >
                <RefreshCw className="h-4 w-4" />
                إعادة المحاولة
              </button>
            </div>
          )}

          {accuracy && (
            <div className={`flex items-center justify-center gap-1.5 text-xs ${
              accuracy === "high" ? "text-emerald-500" : "text-amber-500"
            }`}>
              <Compass className="h-3 w-3" />
              {accuracy === "high" ? "دقة عالية" : "دقة متوسطة"}
            </div>
          )}
        </div>
      </div>

      {/* Distance info */}
      {distance && (
        <div className="mx-4 mb-6 rounded-3xl p-4 border border-border/60 bg-card shadow-soft">
          <div className="flex items-center justify-around text-center">
            <div>
              <p className="font-quran text-2xl text-primary">
                {distance.toLocaleString("ar", { maximumFractionDigits: 0 })}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">كيلومتر</p>
            </div>
            <div className="h-10 w-px bg-border" />
            <div>
              <p className="font-quran text-2xl text-gold">
                {bearing !== null ? Math.round(bearing) : "—"}°
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">درجة</p>
            </div>
            <div className="h-10 w-px bg-border" />
            <div>
              <p className="font-quran text-2xl text-foreground">🕋</p>
              <p className="text-xs text-muted-foreground mt-0.5">مكة</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
