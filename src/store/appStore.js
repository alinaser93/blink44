import { useSyncExternalStore } from "react";
import { PRODUCTS } from "../data/products.js";
import { toIQD } from "../utils/currency.js";
import { WIDE_BANNERS, TRIO_PROMOS, BIG_STORES } from "../data/collections.js";

/* ============================================================
   المخزن المركزي — مصدر الحقيقة الوحيد للمتجر والبوابات.
   يُحفظ في localStorage ليبقى التحكم (الأدمن/التاجر) فعّالاً
   بعد إعادة التحميل، ولتنعكس التغييرات على واجهة المتجر فوراً.
   ============================================================ */

const KEY = "bk-app-store-v1";

// توزيع المنتجات على التجار حسب الفئة
const merchantFor = (id) => (id >= 6 && id <= 8 ? "m2" : id >= 9 && id <= 11 ? "m3" : "m1");

const seedProducts = () =>
  PRODUCTS.map((p) => ({
    ...p,
    priceIQD: toIQD(p.price),
    mrpIQD: toIQD(p.mrp),
    stock: true,
    merchantId: merchantFor(p.id),
    desc: `منتج أصلي 100% بجودة مضمونة. ${p.name} — ${p.weight}. يصلك خلال دقائق بتغليف آمن يحافظ على الجودة والنضارة.`,
    highlights: [
      ["النوع", p.cat || "بقالة"],
      ["الوزن / الحجم", p.weight],
      ["بلد المنشأ", "العراق / مستورد"],
      ["التخزين", "بحسب التعليمات على العبوة"],
    ],
  }));

const T = (minsAgo) => new Date(Date.now() - minsAgo * 60000).toISOString();

const seedOrders = (prods) => {
  const pick = (ids) => ids.map((id) => {
    const p = prods.find((x) => x.id === id);
    return { id: p.id, name: p.name, qty: 1, priceIQD: p.priceIQD, e: p.e };
  });
  const mk = (id, items, merchantId, status, courierId, minsAgo, name, phone, address) => {
    const subtotal = items.reduce((a, i) => a + i.priceIQD * i.qty, 0);
    return { id, items, merchantId, courierId, status, time: T(minsAgo),
      customer: { name, phone, address }, subtotal, fee: 1000, total: subtotal + 1000 };
  };
  return [
    mk(1006, pick([1, 3, 5]), "m1", "جديد", null, 4, "علي حسين", "0770 111 2233", "الكرادة، شارع 62، بناية 14"),
    mk(1005, pick([6, 8]), "m2", "قيد التجهيز", null, 18, "زهراء محمد", "0781 555 8899", "المنصور، حي دراغ، دار 7"),
    mk(1004, pick([9]), "m3", "جاهز للتوصيل", null, 32, "مصطفى كاظم", "0790 222 4455", "زيونة، شارع الربيعي"),
    mk(1003, pick([2, 12, 13]), "m1", "في الطريق", "c1", 47, "نور صباح", "0771 999 1122", "اليرموك، حي الأطباء"),
    mk(1002, pick([4, 5]), "m1", "تم التوصيل", "c2", 130, "حيدر جبار", "0782 333 6677", "الكاظمية، قرب الصحن"),
    mk(1001, pick([7]), "m2", "تم التوصيل", "c1", 210, "سارة أمير", "0791 444 5566", "الجادرية، مجمع النخيل"),
  ];
};

const defaults = () => {
  const products = seedProducts();
  return {
    settings: {
      promoText: "⚡ اطلب الآن واحصل على توصيل مجاني",
      eta: 12,
      deliveryFee: 1000,
      serviceFee: 250,          // رسوم الخدمة تظهر في الفاتورة
      freeAbove: 25000,         // توصيل مجاني فوق هذا المبلغ
      tipOptions: [250, 500, 1000], // خيارات بقشيش المندوب
      storeOpen: true,
    },
    // هوية الموقع — يتحكم بها الأدمن من تبويب «المظهر»
    appearance: {
      headTop: "#C99A24",
      headBot: "#8E6112",
      green: "#0C831F",
      yellow: "#F8CB46",
      yellowDk: "#F0B500",
    },
    // نصوص الموقع — يتحكم بها الأدمن من تبويب «المظهر»
    texts: {
      appName: "بلينكيت",
      logoLetter: "ب",
      tagline: "تطبيق الدقائق الأخيرة",
      splashWelcome: "اطلب الآن واستمتع بتوصيل مجاني",
      welcomeTitle: "أهلاً بك",
      welcomeSub: "اطلب الآن واحصل على توصيل مجاني",
      addressTitle: "المنزل",
      address: "علي، 22، منطقة راجباث",
      closedMsg: "المتجر مغلق حالياً — نعود قريباً 🌙",
      footerBig: "بلينكيت",
      footerTag: "تطبيق الدقائق الأخيرة 🇮🇶",
      footerMini: "صُنع بـ ❤️ في العراق",
      customerName: "زبون التطبيق",
    },
    // محتوى الأقسام القابلة للتحرير من تبويب «المحتوى»
    banners: WIDE_BANNERS.map((b, i) => ({ id: "b" + (i + 1), ...b })),
    trio: TRIO_PROMOS.map((t) => ({ ...t })),
    bigStores: BIG_STORES.map((g, i) => ({ id: "g" + (i + 1), ...g })),
    merchants: [
      { id: "m1", name: "سوبرماركت النخيل", cat: "بقالة وأغذية", phone: "0770 100 1000", password: "1111" },
      { id: "m2", name: "بيوتي لاند", cat: "جمال وعناية", phone: "0781 200 2000", password: "2222" },
      { id: "m3", name: "تك ستور", cat: "إلكترونيات", phone: "0790 300 3000", password: "3333" },
    ],
    couriers: [
      { id: "c1", name: "أحمد كريم", phone: "0770 111 0001", active: true },
      { id: "c2", name: "حسن علي", phone: "0781 222 0002", active: true },
      { id: "c3", name: "مرتضى سعد", phone: "0790 333 0003", active: false },
    ],
    products,
    addresses: [
      { id: "a1", label: "المنزل", details: "علي، 22، منطقة راجباث", phone: "0770 000 0000" },
      { id: "a2", label: "العمل", details: "شارع السعدون، بناية 40، ط3", phone: "0770 000 0000" },
    ],
    selectedAddress: "a1",
    orders: seedOrders(products),
    nextOrderId: 1007,
  };
};

const load = () => {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
};

const mergeSaved = (d, saved) => {
  if (!saved) return d;
  const out = { ...d, ...saved };
  ["settings", "appearance", "texts"].forEach((k) => { out[k] = { ...d[k], ...(saved[k] || {}) }; });
  ["banners", "trio", "bigStores", "addresses"].forEach((k) => { if (!Array.isArray(saved[k])) out[k] = d[k]; });
  out.merchants = (saved.merchants || d.merchants).map((m) => ({ password: "0000", ...m }));
  return out;
};
let state = mergeSaved(defaults(), load());
try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* بيئة بلا تخزين */ }
const listeners = new Set();
const emit = () => {
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* تجاهل */ }
  listeners.forEach((l) => l());
};

export const getState = () => state;
export const setState = (patch) => {
  state = { ...state, ...(typeof patch === "function" ? patch(state) : patch) };
  emit();
};
export const resetStore = () => { state = defaults(); emit(); };

export function useStore(selector = (s) => s) {
  return useSyncExternalStore(
    (cb) => { listeners.add(cb); return () => listeners.delete(cb); },
    () => selector(state)
  );
}

/* ---------- إجراءات جاهزة ---------- */
export const findProduct = (id) => state.products.find((p) => p.id === id);

export const updateProduct = (id, patch) =>
  setState((s) => ({ products: s.products.map((p) => (p.id === id ? { ...p, ...patch } : p)) }));

export const addProduct = (data) =>
  setState((s) => {
    const id = Math.max(...s.products.map((p) => p.id)) + 1;
    return { products: [...s.products, { rating: 4.3, reviews: "جديد", eta: "10 دقائق", bg: "#F2F2F2", stock: true, ...data, id }] };
  });

export const removeProduct = (id) =>
  setState((s) => ({ products: s.products.filter((p) => p.id !== id) }));

export const updateSettings = (patch) =>
  setState((s) => ({ settings: { ...s.settings, ...patch } }));

export const setOrderStatus = (id, status) =>
  setState((s) => ({ orders: s.orders.map((o) => (o.id === id ? { ...o, status } : o)) }));

export const assignCourier = (id, courierId) =>
  setState((s) => ({ orders: s.orders.map((o) => (o.id === id ? { ...o, courierId } : o)) }));

export const toggleCourier = (id) =>
  setState((s) => ({ couriers: s.couriers.map((c) => (c.id === id ? { ...c, active: !c.active } : c)) }));

export const addCourier = (name, phone) =>
  setState((s) => ({ couriers: [...s.couriers, { id: "c" + Date.now(), name, phone, active: true }] }));

export const addMerchant = (name, cat, phone, password = "0000") =>
  setState((s) => ({ merchants: [...s.merchants, { id: "m" + Date.now(), name, cat, phone, password }] }));

export const placeOrder = (items, extra = {}) => {
  const s = state;
  const addr = s.addresses.find((a) => a.id === s.selectedAddress) || s.addresses[0];
  const customer = {
    name: s.texts.customerName,
    phone: addr?.phone || "0770 000 0000",
    address: addr ? `${addr.label} — ${addr.details}` : s.texts.address,
  };
  const subtotal = items.reduce((a, i) => a + i.priceIQD * i.qty, 0);
  const fee = subtotal >= s.settings.freeAbove ? 0 : s.settings.deliveryFee;
  const tip = extra.tip || 0;
  const merchantId = items[0] ? (findProduct(items[0].id)?.merchantId || "m1") : "m1";
  const merchantCount = new Set(items.map((i) => findProduct(i.id)?.merchantId)).size;
  const order = {
    id: s.nextOrderId, items, merchantId, merchantCount, courierId: null, status: "جديد",
    time: new Date().toISOString(), customer, mine: true,
    subtotal, fee, serviceFee: s.settings.serviceFee, tip,
    payMethod: extra.payMethod || "نقداً عند الاستلام",
    note: extra.note || "",
    total: subtotal + fee + s.settings.serviceFee + tip,
  };
  setState({ orders: [order, ...s.orders], nextOrderId: s.nextOrderId + 1 });
  return order;
};

export const cancelOrder = (id) =>
  setState((s) => ({ orders: s.orders.map((o) => (o.id === id && o.status === "جديد" ? { ...o, status: "ملغي" } : o)) }));

export const addAddress = (label, details, phone) => {
  const id = "a" + Date.now();
  setState((s) => ({ addresses: [...s.addresses, { id, label, details, phone }], selectedAddress: id }));
};
export const selectAddress = (id) => setState({ selectedAddress: id });
export const removeAddress = (id) =>
  setState((s) => ({
    addresses: s.addresses.filter((a) => a.id !== id),
    selectedAddress: s.selectedAddress === id ? (s.addresses[0]?.id || null) : s.selectedAddress,
  }));

export const updateAppearance = (patch) =>
  setState((s) => ({ appearance: { ...s.appearance, ...patch } }));

export const updateTexts = (patch) =>
  setState((s) => ({ texts: { ...s.texts, ...patch } }));

export const updateMerchant = (id, patch) =>
  setState((s) => ({ merchants: s.merchants.map((m) => (m.id === id ? { ...m, ...patch } : m)) }));

export const addBanner = () =>
  setState((s) => ({ banners: [...s.banners, { id: "b" + Date.now(), t: "عنوان جديد", sub: "وصف قصير", cta: "تسوّق", e: "🛍️", bg: "linear-gradient(120deg,#0C831F,#0a6b1a)", fg: "#fff" }] }));
export const updateBanner = (id, patch) =>
  setState((s) => ({ banners: s.banners.map((b) => (b.id === id ? { ...b, ...patch } : b)) }));
export const removeBanner = (id) =>
  setState((s) => ({ banners: s.banners.filter((b) => b.id !== id) }));

export const updateTrio = (i, patch) =>
  setState((s) => ({ trio: s.trio.map((t, x) => (x === i ? { ...t, ...patch } : t)) }));

export const addBigStore = () =>
  setState((s) => ({ bigStores: [...s.bigStores, { id: "g" + Date.now(), t: "متجر جديد", sub: "وصف", e: "🏬", bg: "#EFEFEF" }] }));
export const updateBigStore = (id, patch) =>
  setState((s) => ({ bigStores: s.bigStores.map((b) => (b.id === id ? { ...b, ...patch } : b)) }));
export const removeBigStore = (id) =>
  setState((s) => ({ bigStores: s.bigStores.filter((b) => b.id !== id) }));

export const ORDER_STATUSES = ["جديد", "قيد التجهيز", "جاهز للتوصيل", "في الطريق", "تم التوصيل", "ملغي"];
