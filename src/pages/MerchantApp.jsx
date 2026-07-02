import { useState } from "react";
import { LayoutDashboard, ShoppingCart, PackageSearch, Wallet, Clock3, CheckCircle2 } from "lucide-react";
import { useStore, updateProduct, setOrderStatus } from "../store/appStore.js";
import { fmt, CUR } from "../utils/currency.js";
import { Shell, StatusBadge, Switch, Stat, timeAgo } from "../portal/PortalKit.jsx";

const TABS = [
  { id: "dash", l: "اللوحة", Icon: LayoutDashboard },
  { id: "orders", l: "طلباتي", Icon: ShoppingCart },
  { id: "products", l: "منتجاتي", Icon: PackageSearch },
];

export default function MerchantApp() {
  const merchants = useStore((s) => s.merchants);
  const [authId, setAuthId] = useState(() => sessionStorage.getItem("bk-merchant-id") || "");
  const logout = () => { sessionStorage.removeItem("bk-merchant-id"); setAuthId(""); };
  const me = merchants.find((m) => m.id === authId);
  if (!me) return <MerchantLogin merchants={merchants} onOk={(id) => { sessionStorage.setItem("bk-merchant-id", id); setAuthId(id); }} />;
  return <Merchant mid={me.id} onLogout={logout} />;
}

/* دخول مستقل لكل تاجر — كلمة المرور خاصة بمتجره ويديرها الأدمن */
function MerchantLogin({ merchants, onOk }) {
  const [mid, setMid] = useState(merchants[0]?.id || "");
  const [pw, setPw] = useState("");
  const [err, setErr] = useState(false);
  const submit = () => {
    const m = merchants.find((x) => x.id === mid);
    if (m && pw === m.password) onOk(m.id); else setErr(true);
  };
  return (
    <div className="pt-login">
      <div className="box">
        <div className="lg"><span className="b">ب</span>بوابة التاجر</div>
        <div className="sub">إدارة متجرك وطلباتك ومنتجاتك</div>
        <div className="pt-field">
          <label>متجرك</label>
          <select className="pt-in" style={{ width: "100%" }} value={mid} onChange={(e) => { setMid(e.target.value); setErr(false); }}>
            {merchants.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
        </div>
        <div className="pt-field">
          <label>كلمة مرور متجرك</label>
          <input className="pt-in" type="password" value={pw}
            onChange={(e) => { setPw(e.target.value); setErr(false); }}
            onKeyDown={(e) => e.key === "Enter" && submit()} placeholder="••••" />
        </div>
        {err && <div className="pt-err">كلمة المرور غير صحيحة لهذا المتجر</div>}
        <button className="pt-btn" style={{ width: "100%", marginTop: 6 }} onClick={submit}>دخول</button>
        <div className="demo">🔑 تجريبي — النخيل: <b>1111</b> · بيوتي لاند: <b>2222</b> · تك ستور: <b>3333</b><br />يغيّرها الأدمن من تبويب «التجار»</div>
      </div>
    </div>
  );
}

function Merchant({ mid, onLogout }) {
  const [tab, setTab] = useState("dash");
  const merchants = useStore((s) => s.merchants);
  const me = merchants.find((m) => m.id === mid) || merchants[0];
  return (
    <Shell role="التاجر" who={me.name} tabs={TABS} tab={tab} setTab={setTab} onLogout={onLogout}>
      {tab === "dash" && <Dash mid={me.id} />}
      {tab === "orders" && <Orders mid={me.id} />}
      {tab === "products" && <Products mid={me.id} />}
    </Shell>
  );
}

function Dash({ mid }) {
  const orders = useStore((s) => s.orders).filter((o) => o.merchantId === mid);
  const products = useStore((s) => s.products).filter((p) => p.merchantId === mid);
  const revenue = orders.filter((o) => o.status === "تم التوصيل").reduce((a, o) => a + o.subtotal, 0);
  const pending = orders.filter((o) => ["جديد", "قيد التجهيز"].includes(o.status)).length;
  return (
    <>
      <div className="pt-h1">لوحة المتجر<small>أداء متجرك اليوم</small></div>
      <div className="pt-stats">
        <Stat Icon={ShoppingCart} l="طلبات متجري" v={orders.length} />
        <Stat Icon={Wallet} l="إيراد المُسلَّم" v={`${fmt(revenue)} ${CUR}`} />
        <Stat Icon={Clock3} l="بانتظار التجهيز" v={pending} />
        <Stat Icon={PackageSearch} l="منتجاتي" v={products.length} />
      </div>
      <div className="pt-card">
        <div className="cap">أحدث طلبات متجري</div>
        <div className="pt-scroll">
          <table className="pt-table">
            <thead><tr><th>رقم</th><th>الزبون</th><th>الحالة</th><th>قيمة السلة</th><th>الوقت</th></tr></thead>
            <tbody>
              {orders.slice(0, 6).map((o) => (
                <tr key={o.id}>
                  <td><b>#{o.id}</b></td><td>{o.customer.name}</td>
                  <td><StatusBadge s={o.status} /></td>
                  <td>{fmt(o.subtotal)} {CUR}</td><td>{timeAgo(o.time)}</td>
                </tr>
              ))}
              {orders.length === 0 && <tr><td colSpan="5"><div className="pt-empty">لا توجد طلبات بعد</div></td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

function Orders({ mid }) {
  const orders = useStore((s) => s.orders).filter((o) => o.merchantId === mid);
  const next = (o) =>
    o.status === "جديد" ? { l: "قبول وبدء التجهيز", to: "قيد التجهيز" }
    : o.status === "قيد التجهيز" ? { l: "جاهز للتوصيل", to: "جاهز للتوصيل" }
    : null;
  return (
    <>
      <div className="pt-h1">طلبات متجري<small>قبول الطلبات وتجهيزها للمندوب</small></div>
      <div className="pt-card">
        <div className="cap">قائمة الطلبات</div>
        <div className="pt-scroll">
          <table className="pt-table">
            <thead><tr><th>رقم</th><th>العناصر</th><th>الزبون</th><th>قيمة السلة</th><th>الحالة</th><th>إجراء</th></tr></thead>
            <tbody>
              {orders.map((o) => {
                const n = next(o);
                return (
                  <tr key={o.id}>
                    <td><b>#{o.id}</b><div style={{ color: "#9a9a9a", fontSize: 10.5 }}>{timeAgo(o.time)}</div></td>
                    <td><span className="pt-items-mini">{o.items.map((i, x) => <span key={x}>{i.e}</span>)}</span>
                      <div style={{ color: "#8a8a8a", fontSize: 10.5 }}>{o.items.length} عنصر</div></td>
                    <td>{o.customer.name}</td>
                    <td><b>{fmt(o.subtotal)} {CUR}</b></td>
                    <td><StatusBadge s={o.status} /></td>
                    <td>{n
                      ? <button className="pt-btn sm" onClick={() => setOrderStatus(o.id, n.to)}><CheckCircle2 size={12} style={{ verticalAlign: -2 }} /> {n.l}</button>
                      : <span style={{ color: "#9a9a9a", fontSize: 11.5 }}>—</span>}</td>
                  </tr>
                );
              })}
              {orders.length === 0 && <tr><td colSpan="6"><div className="pt-empty">لا توجد طلبات بعد</div></td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

function Products({ mid }) {
  const products = useStore((s) => s.products).filter((p) => p.merchantId === mid);
  return (
    <>
      <div className="pt-h1">منتجاتي<small>سعرك وتوفّرك — يظهران فوراً للزبائن</small></div>
      <div className="pt-card">
        <div className="cap">{products.length} منتج</div>
        <div className="pt-scroll">
          <table className="pt-table">
            <thead><tr><th>المنتج</th><th>الوزن</th><th>السعر ({CUR})</th><th>رابط الصورة</th><th>متوفر</th></tr></thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} style={p.stock === false ? { opacity: 0.55 } : undefined}>
                  <td><span style={{ fontSize: 18, marginLeft: 6 }}>{p.e}</span><b>{p.name}</b></td>
                  <td>{p.weight}</td>
                  <td>
                    <input className="pt-in" type="number" step="50" style={{ width: 110 }}
                      value={p.priceIQD}
                      onChange={(e) => updateProduct(p.id, { priceIQD: +e.target.value || 0 })} />
                  </td>
                  <td><input className="pt-in" dir="ltr" placeholder="https://…" style={{ width: 150, padding: "6px 9px", fontSize: 11 }}
                    value={p.img || ""} onChange={(e) => updateProduct(p.id, { img: e.target.value })} /></td>
                  <td><Switch on={p.stock !== false} onToggle={() => updateProduct(p.id, { stock: !(p.stock !== false) })} /></td>
                </tr>
              ))}
              {products.length === 0 && <tr><td colSpan="5"><div className="pt-empty">لا توجد منتجات مسندة لمتجرك</div></td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
