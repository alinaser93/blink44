import { useState } from "react";
import { Bike, PackageCheck, Wallet, MapPin, Phone, CheckCircle2, HandCoins } from "lucide-react";
import { useStore, setOrderStatus, assignCourier, toggleCourier } from "../store/appStore.js";
import { fmt, CUR } from "../utils/currency.js";
import { Shell, Gate, StatusBadge, Switch, Stat, timeAgo } from "../portal/PortalKit.jsx";

const PER_DELIVERY = 750; // أجر المندوب عن كل توصيلة (د.ع)

const TABS = [
  { id: "avail", l: "المتاحة", Icon: Bike },
  { id: "mine", l: "توصيلاتي", Icon: PackageCheck },
  { id: "earn", l: "أرباحي", Icon: Wallet },
];

export default function CourierApp() {
  const couriers = useStore((s) => s.couriers);
  const [cid, setCid] = useState(() => sessionStorage.getItem("bk-courier-id") || "c1");
  const picker = (
    <div className="pt-field">
      <label>اختر حسابك</label>
      <select className="pt-in" style={{ width: "100%" }} value={cid}
        onChange={(e) => { setCid(e.target.value); sessionStorage.setItem("bk-courier-id", e.target.value); }}>
        {couriers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
      </select>
    </div>
  );
  return (
    <Gate title="بوابة المندوب" sub="استلم الطلبات الجاهزة ووصّلها" pin="1357" storageKey="bk-auth-courier" demo="1357" extra={picker}>
      {(logout) => <Courier cid={cid} onLogout={logout} />}
    </Gate>
  );
}

function Courier({ cid, onLogout }) {
  const [tab, setTab] = useState("avail");
  const couriers = useStore((s) => s.couriers);
  const me = couriers.find((c) => c.id === cid) || couriers[0];
  return (
    <Shell role="المندوب" who={me.name} tabs={TABS} tab={tab} setTab={setTab} onLogout={onLogout}>
      <div className="pt-card" style={{ display: "flex", alignItems: "center", gap: 12, padding: 14, marginBottom: 14 }}>
        <Switch on={me.active} onToggle={() => toggleCourier(me.id)} />
        <div><b style={{ fontSize: 13.5 }}>{me.active ? "متاح لاستلام الطلبات" : "غير متاح حالياً"}</b>
          <div style={{ fontSize: 11.5, color: "#8a8a8a" }}>بدّل حالتك حسب جاهزيتك</div></div>
      </div>
      {tab === "avail" && <Available me={me} />}
      {tab === "mine" && <Mine me={me} />}
      {tab === "earn" && <Earnings me={me} />}
    </Shell>
  );
}

function OrderCard({ o, action }) {
  return (
    <div className="pt-card">
      <div className="cap"><b>#{o.id}</b><StatusBadge s={o.status} /><span className="sp" />
        <span style={{ fontWeight: 600, color: "#9a9a9a", fontSize: 11 }}>{timeAgo(o.time)}</span></div>
      <div style={{ padding: "12px 14px", fontSize: 12.5, display: "grid", gap: 8 }}>
        <div><MapPin size={13} style={{ verticalAlign: -2, color: "#c99a24" }} /> <b>{o.customer.name}</b> — {o.customer.address}</div>
        <div style={{ direction: "ltr", textAlign: "right" }}><Phone size={13} style={{ verticalAlign: -2, color: "#c99a24" }} /> {o.customer.phone}</div>
        <div className="pt-items-mini" style={{ fontSize: 20 }}>{o.items.map((i, x) => <span key={x}>{i.e}</span>)}</div>
        {o.note && <div style={{ background: "#FFF8E1", color: "#7a5c00", borderRadius: 8, padding: "6px 9px", fontSize: 11, fontWeight: 700 }}>📝 {o.note}</div>}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ color: "#5a5a5a" }}>{(o.payMethod || "").includes("نقد") ? "تحصيل نقدي" : "مدفوع مسبقاً"}: <b style={{ color: "#1c1c1c" }}>{fmt(o.total)} {CUR}</b>{o.tip > 0 && <span style={{ color: "#0C831F", fontWeight: 800 }}> · بقشيش {fmt(o.tip)}</span>}</span>
          {action}
        </div>
      </div>
    </div>
  );
}

function Available({ me }) {
  const orders = useStore((s) => s.orders)
    .filter((o) => o.status === "جاهز للتوصيل" && (!o.courierId || o.courierId === me.id));
  const take = (o) => { assignCourier(o.id, me.id); setOrderStatus(o.id, "في الطريق"); };
  return (
    <>
      <div className="pt-h1">طلبات جاهزة للاستلام<small>استلمها من المتجر وانطلق</small></div>
      {orders.map((o) => (
        <OrderCard key={o.id} o={o}
          action={<button className="pt-btn sm" disabled={!me.active} style={!me.active ? { opacity: 0.5 } : undefined}
            onClick={() => me.active && take(o)}><Bike size={12} style={{ verticalAlign: -2 }} /> استلام وانطلاق</button>} />
      ))}
      {orders.length === 0 && <div className="pt-card"><div className="pt-empty">لا توجد طلبات جاهزة الآن — ستظهر هنا فور تجهيزها</div></div>}
    </>
  );
}

function Mine({ me }) {
  const orders = useStore((s) => s.orders).filter((o) => o.courierId === me.id && o.status === "في الطريق");
  return (
    <>
      <div className="pt-h1">توصيلاتي الجارية<small>سلّم الطلب ثم أكّد التسليم</small></div>
      {orders.map((o) => (
        <OrderCard key={o.id} o={o}
          action={<button className="pt-btn sm" onClick={() => setOrderStatus(o.id, "تم التوصيل")}>
            <CheckCircle2 size={12} style={{ verticalAlign: -2 }} /> تم التوصيل</button>} />
      ))}
      {orders.length === 0 && <div className="pt-card"><div className="pt-empty">لا توجد توصيلات جارية</div></div>}
    </>
  );
}

function Earnings({ me }) {
  const done = useStore((s) => s.orders).filter((o) => o.courierId === me.id && o.status === "تم التوصيل");
  const tips = done.reduce((a, o) => a + (o.tip || 0), 0);
  const today = done.length * PER_DELIVERY + tips;
  return (
    <>
      <div className="pt-h1">أرباحي<small>{PER_DELIVERY.toLocaleString("en-US")} {CUR} عن كل توصيلة</small></div>
      <div className="pt-stats" style={{ gridTemplateColumns: "1fr 1fr 1fr" }}>
        <Stat Icon={PackageCheck} l="توصيلات مكتملة" v={done.length} />
        <Stat Icon={HandCoins} l="بقشيش الزبائن 💚" v={`${fmt(tips)} ${CUR}`} />
        <Stat Icon={Wallet} l="إجمالي الأرباح" v={`${fmt(today)} ${CUR}`} />
      </div>
      <div className="pt-card">
        <div className="cap">سجل التوصيلات</div>
        <div className="pt-scroll">
          <table className="pt-table">
            <thead><tr><th>رقم</th><th>الزبون</th><th>العنوان</th><th>الأجر</th><th>بقشيش</th><th>الوقت</th></tr></thead>
            <tbody>
              {done.map((o) => (
                <tr key={o.id}>
                  <td><b>#{o.id}</b></td><td>{o.customer.name}</td>
                  <td style={{ whiteSpace: "normal", maxWidth: 180 }}>{o.customer.address}</td>
                  <td style={{ color: "#0C831F", fontWeight: 800 }}>+{fmt(PER_DELIVERY)}</td>
                  <td style={{ color: "#0C831F", fontWeight: 800 }}>{o.tip ? "+" + fmt(o.tip) : "—"}</td>
                  <td>{timeAgo(o.time)}</td>
                </tr>
              ))}
              {done.length === 0 && <tr><td colSpan="6"><div className="pt-empty">لا توجد توصيلات مكتملة بعد</div></td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
