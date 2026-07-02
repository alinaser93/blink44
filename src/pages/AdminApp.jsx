import { useState } from "react";
import {
  LayoutDashboard, PackageSearch, ShoppingCart, Store, Bike, Settings2,
  Wallet, Clock3, PackageX, Plus, Trash2, Pencil, RotateCcw, Palette, LayoutTemplate, KeyRound,
} from "lucide-react";
import {
  useStore, updateProduct, addProduct, removeProduct, updateSettings,
  setOrderStatus, assignCourier, toggleCourier, addCourier, addMerchant,
  updateMerchant, updateAppearance, updateTexts,
  addBanner, updateBanner, removeBanner, updateTrio,
  addBigStore, updateBigStore, removeBigStore,
  resetStore, ORDER_STATUSES,
} from "../store/appStore.js";
import { fmt, CUR } from "../utils/currency.js";
import { Shell, Gate, StatusBadge, Switch, Stat, timeAgo } from "../portal/PortalKit.jsx";

const TABS = [
  { id: "dash", l: "اللوحة", Icon: LayoutDashboard },
  { id: "orders", l: "الطلبات", Icon: ShoppingCart },
  { id: "products", l: "المنتجات", Icon: PackageSearch },
  { id: "content", l: "المحتوى", Icon: LayoutTemplate },
  { id: "look", l: "المظهر", Icon: Palette },
  { id: "merchants", l: "التجار", Icon: Store },
  { id: "couriers", l: "المندوبون", Icon: Bike },
  { id: "settings", l: "الإعدادات", Icon: Settings2 },
];

export default function AdminApp() {
  return (
    <Gate title="لوحة الإدارة" sub="تحكم كامل بالمتجر والطلبات والفريق" pin="1234" storageKey="bk-auth-admin" demo="1234">
      {(logout) => <Admin onLogout={logout} />}
    </Gate>
  );
}

function Admin({ onLogout }) {
  const [tab, setTab] = useState("dash");
  return (
    <Shell role="الإدارة" tabs={TABS} tab={tab} setTab={setTab} onLogout={onLogout}>
      {tab === "dash" && <Dash />}
      {tab === "orders" && <Orders />}
      {tab === "products" && <Products />}
      {tab === "content" && <Content />}
      {tab === "look" && <Look />}
      {tab === "merchants" && <Merchants />}
      {tab === "couriers" && <Couriers />}
      {tab === "settings" && <SettingsPage />}
    </Shell>
  );
}

/* ---------------- اللوحة ---------------- */
function Dash() {
  const orders = useStore((s) => s.orders);
  const products = useStore((s) => s.products);
  const revenue = orders.filter((o) => o.status !== "ملغي").reduce((a, o) => a + o.total, 0);
  const active = orders.filter((o) => !["تم التوصيل", "ملغي"].includes(o.status)).length;
  const oos = products.filter((p) => p.stock === false).length;
  const days = ["سبت", "أحد", "اثنين", "ثلاثاء", "أربعاء", "خميس", "اليوم"];
  const bars = [42, 65, 51, 78, 60, 88, Math.max(20, Math.min(100, orders.length * 12))];
  return (
    <>
      <div className="pt-h1">لوحة المتابعة<small>نظرة سريعة على أداء المتجر اليوم</small></div>
      <div className="pt-stats">
        <Stat Icon={ShoppingCart} l="إجمالي الطلبات" v={orders.length} d="+2 اليوم" />
        <Stat Icon={Wallet} l="الإيراد" v={`${fmt(revenue)} ${CUR}`} d="↑ 12% عن أمس" />
        <Stat Icon={Clock3} l="طلبات نشطة" v={active} />
        <Stat Icon={PackageX} l="منتجات نافدة" v={oos} />
      </div>
      <div className="pt-card">
        <div className="cap">الطلبات خلال الأسبوع</div>
        <div className="pt-chart" style={{ paddingBottom: 30 }}>
          {bars.map((h, i) => <div key={i} className="b" style={{ height: `${h}%` }}><span>{days[i]}</span></div>)}
        </div>
      </div>
      <div className="pt-card">
        <div className="cap">أحدث الطلبات</div>
        <div className="pt-scroll">
          <table className="pt-table">
            <thead><tr><th>رقم</th><th>الزبون</th><th>الحالة</th><th>الإجمالي</th><th>الوقت</th></tr></thead>
            <tbody>
              {orders.slice(0, 5).map((o) => (
                <tr key={o.id}>
                  <td><b>#{o.id}</b></td><td>{o.customer.name}</td>
                  <td><StatusBadge s={o.status} /></td>
                  <td>{fmt(o.total)} {CUR}</td><td>{timeAgo(o.time)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

/* ---------------- الطلبات ---------------- */
function Orders() {
  const orders = useStore((s) => s.orders);
  const couriers = useStore((s) => s.couriers);
  const merchants = useStore((s) => s.merchants);
  const [filter, setFilter] = useState("الكل");
  const list = filter === "الكل" ? orders : orders.filter((o) => o.status === filter);
  const mName = (id) => merchants.find((m) => m.id === id)?.name || "—";
  return (
    <>
      <div className="pt-h1">إدارة الطلبات<small>تغيير الحالات وتعيين المندوبين</small></div>
      <div className="pt-card">
        <div className="cap">
          كل الطلبات<span className="sp" />
          <select className="pt-in" value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option>الكل</option>
            {ORDER_STATUSES.map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>
        <div className="pt-scroll">
          <table className="pt-table">
            <thead><tr><th>رقم</th><th>الزبون</th><th>العناصر</th><th>المتجر</th><th>الإجمالي</th><th>الدفع</th><th>بقشيش</th><th>الحالة</th><th>المندوب</th><th>الوقت</th></tr></thead>
            <tbody>
              {list.map((o) => (
                <tr key={o.id}>
                  <td><b>#{o.id}</b></td>
                  <td>{o.customer.name}<div style={{ color: "#9a9a9a", fontSize: 10.5 }}>{o.customer.phone}</div></td>
                  <td><span className="pt-items-mini">{o.items.slice(0, 4).map((i, x) => <span key={x}>{i.e}</span>)}</span></td>
                  <td>{mName(o.merchantId)}</td>
                  <td><b>{fmt(o.total)} {CUR}</b></td>
                  <td style={{ fontSize: 11 }}>{o.payMethod || "نقداً"}{o.note ? <div style={{ color: "#c99a24", fontSize: 10 }}>📝 {o.note}</div> : null}</td>
                  <td style={{ color: "#0C831F", fontWeight: 800 }}>{o.tip ? "+" + fmt(o.tip) : "—"}</td>
                  <td>
                    <select className="pt-in" value={o.status} onChange={(e) => setOrderStatus(o.id, e.target.value)}>
                      {ORDER_STATUSES.map((s) => <option key={s}>{s}</option>)}
                    </select>
                  </td>
                  <td>
                    <select className="pt-in" value={o.courierId || ""} onChange={(e) => assignCourier(o.id, e.target.value || null)}>
                      <option value="">بدون</option>
                      {couriers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </td>
                  <td>{timeAgo(o.time)}</td>
                </tr>
              ))}
              {list.length === 0 && <tr><td colSpan="10"><div className="pt-empty">لا توجد طلبات بهذه الحالة</div></td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

/* ---------------- المنتجات ---------------- */
const CATS = ["بقالة أساسية","ألبان وخبز وبيض","مشروبات","تسالي وحلويات","جمال وعناية","إلكترونيات","منزل وديكور","أطفال وألعاب","خضار وفواكه","آيس كريم ومثلجات"];
const EMPTY = { name: "", e: "🛒", weight: "", priceIQD: 1000, mrpIQD: 1500, merchantId: "m1", cat: CATS[0], desc: "", highlights: [] };
function Products() {
  const products = useStore((s) => s.products);
  const merchants = useStore((s) => s.merchants);
  const [q, setQ] = useState("");
  const [modal, setModal] = useState(null); // null | {mode:'add'|'edit', data}
  const list = products.filter((p) => p.name.includes(q));
  const save = () => {
    const d = { ...modal.data, priceIQD: +modal.data.priceIQD || 0, mrpIQD: +modal.data.mrpIQD || 0 };
    // المواصفات: سطر لكل خاصية بصيغة «المفتاح: القيمة»
    if (typeof d.hlText === "string") {
      d.highlights = d.hlText.split("\n").map((l) => l.split(":")).filter((a) => a.length >= 2)
        .map((a) => [a[0].trim(), a.slice(1).join(":").trim()]);
      delete d.hlText;
    }
    if (modal.mode === "add") addProduct(d); else updateProduct(d.id, d);
    setModal(null);
  };
  const openEdit = (p) => setModal({ mode: "edit", data: { ...p, hlText: (p.highlights || []).map(([k, v]) => k + ": " + v).join("\n") } });
  return (
    <>
      <div className="pt-h1">إدارة المنتجات<small>التعديلات تنعكس فوراً على واجهة المتجر</small></div>
      <div className="pt-card">
        <div className="cap">
          {products.length} منتج<span className="sp" />
          <input className="pt-in" style={{ width: 150 }} placeholder="بحث…" value={q} onChange={(e) => setQ(e.target.value)} />
          <button className="pt-btn sm" onClick={() => setModal({ mode: "add", data: { ...EMPTY } })}><Plus size={13} style={{ verticalAlign: -2 }} /> إضافة</button>
        </div>
        <div className="pt-scroll">
          <table className="pt-table">
            <thead><tr><th>المنتج</th><th>الوزن</th><th>السعر</th><th>قبل الخصم</th><th>التاجر</th><th>متوفر</th><th></th></tr></thead>
            <tbody>
              {list.map((p) => (
                <tr key={p.id} style={p.stock === false ? { opacity: 0.55 } : undefined}>
                  <td><span style={{ fontSize: 18, marginLeft: 6 }}>{p.e}</span><b>{p.name}</b></td>
                  <td>{p.weight}</td>
                  <td><b>{fmt(p.priceIQD)} {CUR}</b></td>
                  <td style={{ color: "#9a9a9a", textDecoration: "line-through" }}>{fmt(p.mrpIQD)}</td>
                  <td>{merchants.find((m) => m.id === p.merchantId)?.name || "—"}</td>
                  <td><Switch on={p.stock !== false} onToggle={() => updateProduct(p.id, { stock: !(p.stock !== false) })} /></td>
                  <td style={{ display: "flex", gap: 6 }}>
                    <button className="pt-btn ghost sm" onClick={() => openEdit(p)}><Pencil size={12} /></button>
                    <button className="pt-btn warn sm" onClick={() => confirm(`حذف «${p.name}»؟`) && removeProduct(p.id)}><Trash2 size={12} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {modal && (
        <div className="pt-dim" onClick={(e) => e.target === e.currentTarget && setModal(null)}>
          <div className="pt-modal">
            <h3>{modal.mode === "add" ? "إضافة منتج" : "تعديل المنتج"}</h3>
            <div className="pt-field"><label>الاسم</label>
              <input className="pt-in" value={modal.data.name} onChange={(e) => setModal({ ...modal, data: { ...modal.data, name: e.target.value } })} /></div>
            <div className="pt-row2">
              <div className="pt-field"><label>الإيموجي (مؤقتاً بدل الصورة)</label>
                <input className="pt-in" value={modal.data.e} onChange={(e) => setModal({ ...modal, data: { ...modal.data, e: e.target.value } })} /></div>
              <div className="pt-field"><label>الوزن/الحجم</label>
                <input className="pt-in" value={modal.data.weight} onChange={(e) => setModal({ ...modal, data: { ...modal.data, weight: e.target.value } })} /></div>
            </div>
            <div className="pt-row2">
              <div className="pt-field"><label>السعر ({CUR})</label>
                <input className="pt-in" type="number" step="50" value={modal.data.priceIQD} onChange={(e) => setModal({ ...modal, data: { ...modal.data, priceIQD: e.target.value } })} /></div>
              <div className="pt-field"><label>السعر قبل الخصم</label>
                <input className="pt-in" type="number" step="50" value={modal.data.mrpIQD} onChange={(e) => setModal({ ...modal, data: { ...modal.data, mrpIQD: e.target.value } })} /></div>
            </div>
            <div className="pt-field"><label>التصنيف (يحدد مكانه في صفحات الفئات والبحث)</label>
              <select className="pt-in" style={{ width: "100%" }} value={modal.data.cat || CATS[0]} onChange={(e) => setModal({ ...modal, data: { ...modal.data, cat: e.target.value } })}>
                {CATS.map((c) => <option key={c}>{c}</option>)}
              </select></div>
            <div className="pt-field"><label>الوصف (يظهر في صفحة تفاصيل المنتج)</label>
              <textarea className="pt-in" rows="3" value={modal.data.desc || ""} onChange={(e) => setModal({ ...modal, data: { ...modal.data, desc: e.target.value } })} /></div>
            <div className="pt-field"><label>المواصفات — سطر لكل خاصية بصيغة «المفتاح: القيمة»</label>
              <textarea className="pt-in" rows="4" placeholder={"النوع: ألبان\nالوزن: 1 لتر"} value={modal.data.hlText || ""} onChange={(e) => setModal({ ...modal, data: { ...modal.data, hlText: e.target.value } })} /></div>
            <div className="pt-field"><label>رابط الصورة (اختياري — يحلّ محل الإيموجي)</label>
              <input className="pt-in" dir="ltr" placeholder="https://…" value={modal.data.img || ""} onChange={(e) => setModal({ ...modal, data: { ...modal.data, img: e.target.value } })} /></div>
            <div className="pt-field"><label>التاجر</label>
              <select className="pt-in" style={{ width: "100%" }} value={modal.data.merchantId} onChange={(e) => setModal({ ...modal, data: { ...modal.data, merchantId: e.target.value } })}>
                {merchants.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select></div>
            <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
              <button className="pt-btn" style={{ flex: 1 }} onClick={save}>حفظ</button>
              <button className="pt-btn ghost" onClick={() => setModal(null)}>إلغاء</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/* ---------------- التجار ---------------- */
function Merchants() {
  const merchants = useStore((s) => s.merchants);
  const products = useStore((s) => s.products);
  const orders = useStore((s) => s.orders);
  const [f, setF] = useState({ name: "", cat: "", phone: "", password: "" });
  const submit = () => {
    if (!f.name) return;
    addMerchant(f.name, f.cat, f.phone, f.password || "0000");
    setF({ name: "", cat: "", phone: "", password: "" });
  };
  return (
    <>
      <div className="pt-h1">التجار<small>المتاجر الشريكة ومنتجاتها</small></div>
      <div className="pt-card">
        <div className="cap">إضافة تاجر</div>
        <div style={{ padding: 14 }} className="pt-row2">
          <input className="pt-in" placeholder="اسم المتجر" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
          <input className="pt-in" placeholder="التخصص" value={f.cat} onChange={(e) => setF({ ...f, cat: e.target.value })} />
          <input className="pt-in" placeholder="الهاتف" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} />
          <input className="pt-in" dir="ltr" placeholder="كلمة مرور البوابة" value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} />
          <button className="pt-btn" onClick={submit}>إضافة</button>
        </div>
      </div>
      <div className="pt-card">
        <div className="cap">قائمة التجار</div>
        <div className="pt-scroll">
          <table className="pt-table">
            <thead><tr><th>المتجر</th><th>التخصص</th><th>الهاتف</th><th>كلمة مرور البوابة</th><th>المنتجات</th><th>الطلبات</th></tr></thead>
            <tbody>
              {merchants.map((m) => (
                <tr key={m.id}>
                  <td><b>{m.name}</b></td><td>{m.cat}</td><td style={{ direction: "ltr" }}>{m.phone}</td>
                  <td><span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><KeyRound size={13} color="#c99a24" />
                    <input className="pt-in" style={{ width: 90, padding: "5px 9px", fontSize: 12 }} dir="ltr"
                      value={m.password || ""} onChange={(e) => updateMerchant(m.id, { password: e.target.value })} /></span></td>
                  <td>{products.filter((p) => p.merchantId === m.id).length}</td>
                  <td>{orders.filter((o) => o.merchantId === m.id).length}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

/* ---------------- المندوبون ---------------- */
function Couriers() {
  const couriers = useStore((s) => s.couriers);
  const orders = useStore((s) => s.orders);
  const [f, setF] = useState({ name: "", phone: "" });
  const delivered = (id) => orders.filter((o) => o.courierId === id && o.status === "تم التوصيل").length;
  return (
    <>
      <div className="pt-h1">المندوبون<small>فريق التوصيل وحالته</small></div>
      <div className="pt-card">
        <div className="cap">إضافة مندوب</div>
        <div style={{ padding: 14, display: "flex", gap: 10 }}>
          <input className="pt-in" placeholder="الاسم" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
          <input className="pt-in" placeholder="الهاتف" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} />
          <button className="pt-btn" onClick={() => { if (f.name) { addCourier(f.name, f.phone); setF({ name: "", phone: "" }); } }}>إضافة</button>
        </div>
      </div>
      <div className="pt-card">
        <div className="cap">الفريق</div>
        <div className="pt-scroll">
          <table className="pt-table">
            <thead><tr><th>المندوب</th><th>الهاتف</th><th>توصيلات مكتملة</th><th>نشط</th></tr></thead>
            <tbody>
              {couriers.map((c) => (
                <tr key={c.id}>
                  <td><b>{c.name}</b></td><td style={{ direction: "ltr" }}>{c.phone}</td>
                  <td>{delivered(c.id)}</td>
                  <td><Switch on={c.active} onToggle={() => toggleCourier(c.id)} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

/* ---------------- الإعدادات ---------------- */
function SettingsPage() {
  const settings = useStore((s) => s.settings);
  return (
    <>
      <div className="pt-h1">إعدادات المتجر<small>تنعكس فوراً على واجهة الزبائن</small></div>
      <div className="pt-card">
        <div className="cap">الواجهة والتوصيل</div>
        <div style={{ padding: 14 }}>
          <div className="pt-field"><label>نص شريط العرض (أعلى المتجر)</label>
            <input className="pt-in" value={settings.promoText} onChange={(e) => updateSettings({ promoText: e.target.value })} /></div>
          <div className="pt-row2">
            <div className="pt-field"><label>زمن التوصيل (دقيقة)</label>
              <input className="pt-in" type="number" value={settings.eta} onChange={(e) => updateSettings({ eta: +e.target.value || 0 })} /></div>
            <div className="pt-field"><label>رسوم التوصيل ({CUR})</label>
              <input className="pt-in" type="number" step="250" value={settings.deliveryFee} onChange={(e) => updateSettings({ deliveryFee: +e.target.value || 0 })} /></div>
          </div>
          <div className="pt-row2">
            <div className="pt-field"><label>توصيل مجاني للطلبات فوق ({CUR})</label>
              <input className="pt-in" type="number" step="1000" value={settings.freeAbove} onChange={(e) => updateSettings({ freeAbove: +e.target.value || 0 })} /></div>
            <div className="pt-field"><label>رسوم الخدمة ({CUR})</label>
              <input className="pt-in" type="number" step="50" value={settings.serviceFee} onChange={(e) => updateSettings({ serviceFee: +e.target.value || 0 })} /></div>
          </div>
          <div className="pt-field"><label>خيارات بقشيش المندوب (أرقام مفصولة بفاصلة)</label>
            <input className="pt-in" dir="ltr" value={(settings.tipOptions || []).join(", ")}
              onChange={(e) => updateSettings({ tipOptions: e.target.value.split(",").map((x) => +x.trim()).filter(Boolean) })} /></div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "6px 0" }}>
            <Switch on={settings.storeOpen} onToggle={() => updateSettings({ storeOpen: !settings.storeOpen })} />
            <div><b style={{ fontSize: 13.5 }}>المتجر مفتوح</b>
              <div style={{ fontSize: 11.5, color: "#8a8a8a" }}>عند الإغلاق يظهر شريط أحمر ويتوقف استقبال الطلبات</div></div>
          </div>
        </div>
      </div>
      <div className="pt-card">
        <div className="cap">البيانات التجريبية</div>
        <div style={{ padding: 14 }}>
          <button className="pt-btn ghost" onClick={() => confirm("إعادة كل البيانات لحالتها الأولى؟") && resetStore()}>
            <RotateCcw size={13} style={{ verticalAlign: -2 }} /> إعادة ضبط البيانات
          </button>
        </div>
      </div>
    </>
  );
}

/* ---------------- المظهر: ألوان ونصوص الموقع ---------------- */
function ColorField({ label, value, onChange }) {
  return (
    <div className="pt-field">
      <label>{label}</label>
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <input type="color" value={value} onChange={(e) => onChange(e.target.value)}
          style={{ width: 44, height: 38, border: "1.5px solid #e2e2e2", borderRadius: 10, padding: 2, background: "#fff", cursor: "pointer" }} />
        <input className="pt-in" dir="ltr" style={{ width: 110 }} value={value} onChange={(e) => onChange(e.target.value)} />
      </div>
    </div>
  );
}

function Look() {
  const a = useStore((s) => s.appearance);
  const t = useStore((s) => s.texts);
  const T = (label, key, dir) => (
    <div className="pt-field"><label>{label}</label>
      <input className="pt-in" dir={dir} value={t[key]} onChange={(e) => updateTexts({ [key]: e.target.value })} /></div>
  );
  return (
    <>
      <div className="pt-h1">مظهر الموقع<small>الألوان والنصوص — تنعكس مباشرة على المتجر</small></div>

      <div className="pt-card">
        <div className="cap"><Palette size={15} color="#c99a24" /> ألوان الهوية</div>
        <div style={{ padding: 14 }} className="pt-row2">
          <ColorField label="الهيدر — أعلى التدرّج" value={a.headTop} onChange={(v) => updateAppearance({ headTop: v })} />
          <ColorField label="الهيدر — أسفل التدرّج" value={a.headBot} onChange={(v) => updateAppearance({ headBot: v })} />
          <ColorField label="اللون الأساسي (أزرار الإضافة والتأكيد)" value={a.green} onChange={(v) => updateAppearance({ green: v })} />
          <ColorField label="الأصفر المميز (الشعار والبداية)" value={a.yellow} onChange={(v) => updateAppearance({ yellow: v })} />
          <ColorField label="الأصفر الداكن" value={a.yellowDk} onChange={(v) => updateAppearance({ yellowDk: v })} />
        </div>
      </div>

      <div className="pt-card">
        <div className="cap">نصوص الهوية</div>
        <div style={{ padding: 14 }}>
          <div className="pt-row2">
            {T("اسم التطبيق", "appName")}
            {T("حرف الشعار", "logoLetter")}
          </div>
          {T("سطر الشعار (شاشة البداية)", "tagline")}
          {T("رسالة الترحيب (شاشة البداية)", "splashWelcome")}
          <div className="pt-row2">
            {T("عنوان البانر الرئيسي", "welcomeTitle")}
            {T("وصف البانر الرئيسي", "welcomeSub")}
          </div>
        </div>
      </div>

      <div className="pt-card">
        <div className="cap">نصوص عامة</div>
        <div style={{ padding: 14 }}>
          <div className="pt-row2">
            {T("عنوان موقع التوصيل", "addressTitle")}
            {T("العنوان التفصيلي", "address")}
          </div>
          {T("رسالة إغلاق المتجر", "closedMsg")}
          <div className="pt-row2">
            {T("الفوتر — الاسم الكبير", "footerBig")}
            {T("الفوتر — السطر الثاني", "footerTag")}
          </div>
          {T("الفوتر — السطر الصغير", "footerMini")}
        </div>
      </div>
    </>
  );
}

/* ---------------- المحتوى: بانرات وأقسام الصفحة الرئيسية ---------------- */
function Content() {
  const banners = useStore((s) => s.banners);
  const trio = useStore((s) => s.trio);
  const bigStores = useStore((s) => s.bigStores);
  const In = (val, on, w, dir) => (
    <input className="pt-in" dir={dir} style={{ width: w || "100%", padding: "6px 9px", fontSize: 12 }} value={val} onChange={(e) => on(e.target.value)} />
  );
  return (
    <>
      <div className="pt-h1">محتوى الصفحة الرئيسية<small>حرّر البانرات والأقسام — تظهر فوراً في المتجر</small></div>

      <div className="pt-card">
        <div className="cap">بانرات العروض العريضة<span className="sp" />
          <button className="pt-btn sm" onClick={addBanner}><Plus size={13} style={{ verticalAlign: -2 }} /> بانر</button></div>
        <div className="pt-scroll">
          <table className="pt-table">
            <thead><tr><th>العنوان</th><th>الوصف</th><th>زر</th><th>إيموجي</th><th>الخلفية (CSS)</th><th></th></tr></thead>
            <tbody>
              {banners.map((b) => (
                <tr key={b.id}>
                  <td>{In(b.t, (v) => updateBanner(b.id, { t: v }), 120)}</td>
                  <td>{In(b.sub, (v) => updateBanner(b.id, { sub: v }), 190)}</td>
                  <td>{In(b.cta, (v) => updateBanner(b.id, { cta: v }), 80)}</td>
                  <td>{In(b.e, (v) => updateBanner(b.id, { e: v }), 55)}</td>
                  <td>{In(b.bg, (v) => updateBanner(b.id, { bg: v }), 230, "ltr")}</td>
                  <td><button className="pt-btn warn sm" onClick={() => removeBanner(b.id)}><Trash2 size={12} /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="pt-card">
        <div className="cap">البطاقات الثلاثية (صيدلية/حيوانات/أطفال)</div>
        <div className="pt-scroll">
          <table className="pt-table">
            <thead><tr><th>العنوان</th><th>الوصف</th><th>إيموجي</th><th>الخلفية</th><th>لون العنوان</th></tr></thead>
            <tbody>
              {trio.map((c, i) => (
                <tr key={i}>
                  <td>{In(c.t, (v) => updateTrio(i, { t: v }), 130)}</td>
                  <td>{In(c.sub, (v) => updateTrio(i, { sub: v }), 200)}</td>
                  <td>{In(c.e, (v) => updateTrio(i, { e: v }), 55)}</td>
                  <td>{In(c.bg, (v) => updateTrio(i, { bg: v }), 95, "ltr")}</td>
                  <td>{In(c.fg, (v) => updateTrio(i, { fg: v }), 95, "ltr")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="pt-card">
        <div className="cap">متاجر يحبها الجميع<span className="sp" />
          <button className="pt-btn sm" onClick={addBigStore}><Plus size={13} style={{ verticalAlign: -2 }} /> متجر</button></div>
        <div className="pt-scroll">
          <table className="pt-table">
            <thead><tr><th>الاسم</th><th>الوصف</th><th>إيموجي</th><th>الخلفية</th><th></th></tr></thead>
            <tbody>
              {bigStores.map((g) => (
                <tr key={g.id}>
                  <td>{In(g.t, (v) => updateBigStore(g.id, { t: v }), 140)}</td>
                  <td>{In(g.sub, (v) => updateBigStore(g.id, { sub: v }), 180)}</td>
                  <td>{In(g.e, (v) => updateBigStore(g.id, { e: v }), 55)}</td>
                  <td>{In(g.bg, (v) => updateBigStore(g.id, { bg: v }), 95, "ltr")}</td>
                  <td><button className="pt-btn warn sm" onClick={() => removeBigStore(g.id)}><Trash2 size={12} /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
