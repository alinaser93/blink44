import { useMemo, useState } from "react";
import { ChevronRight, ChevronDown, Search, User, ArrowUpDown } from "lucide-react";
import { useStore } from "../store/appStore.js";
import ProductCard from "./ProductCard.jsx";

const CAT_ICON = {
  "ألبان وخبز وبيض": "🥛", "مشروبات": "🥤", "تسالي وحلويات": "🍫", "بقالة أساسية": "🌾",
  "جمال وعناية": "💄", "إلكترونيات": "🎧", "منزل وديكور": "🪴", "أطفال وألعاب": "🧸",
  "خضار وفواكه": "🍌", "آيس كريم ومثلجات": "🍦",
};
const SORTS = ["الأكثر رواجاً", "السعر: الأقل أولاً", "السعر: الأعلى أولاً", "أعلى خصم"];

/* صفحة التصنيف — شريط جانبي للفئات الفرعية + فرز + شبكة (كما في التطبيق الأصلي) */
export default function Listing({ title, cart, add, inc, dec, onBack }) {
  const PRODUCTS = useStore((s) => s.products);
  const cats = useMemo(() => [...new Set(PRODUCTS.map((p) => p.cat || "بقالة أساسية"))], [PRODUCTS]);

  const initial = cats.find((c) => title.includes(c) || c.includes(title)) || "الكل";
  const [cat, setCat] = useState(initial);
  const [sort, setSort] = useState(SORTS[0]);
  const [sortOpen, setSortOpen] = useState(false);

  const list = useMemo(() => {
    let l = cat === "الكل" ? PRODUCTS : PRODUCTS.filter((p) => (p.cat || "") === cat);
    l = [...l];
    if (sort === SORTS[1]) l.sort((a, b) => a.priceIQD - b.priceIQD);
    if (sort === SORTS[2]) l.sort((a, b) => b.priceIQD - a.priceIQD);
    if (sort === SORTS[3]) l.sort((a, b) => (b.mrpIQD - b.priceIQD) / b.mrpIQD - (a.mrpIQD - a.priceIQD) / a.mrpIQD);
    return l;
  }, [PRODUCTS, cat, sort]);

  const also = useMemo(() => PRODUCTS.filter((p) => (p.cat || "") !== cat).slice(0, 4), [PRODUCTS, cat]);

  return (
    <div className="bk-page" style={{ zIndex: 25 }}>
      <div className="bk-phead">
        <div className="bk-back" onClick={onBack}><ChevronRight size={22} strokeWidth={2.5} /></div>
        <div className="ti">{title}<small>التوصيل خلال 8 دقائق · {list.length} منتج</small></div>
        <Search size={19} color="#4a4a4a" />
        <div className="bk-profile" style={{ background: "rgba(0,0,0,.06)", borderColor: "rgba(0,0,0,.08)" }}>
          <User size={18} strokeWidth={2} color="#3a3a3a" />
        </div>
      </div>

      <div className="bk-cat-wrap">
        <div className="bk-cat-side hide-sb">
          <div className={"it" + (cat === "الكل" ? " on" : "")} onClick={() => setCat("الكل")}>
            <span className="e">🛒</span><span className="l">الكل</span>
          </div>
          {cats.map((c) => (
            <div key={c} className={"it" + (cat === c ? " on" : "")} onClick={() => setCat(c)}>
              <span className="e">{CAT_ICON[c] || "🧺"}</span><span className="l">{c}</span>
            </div>
          ))}
        </div>

        <div className="bk-cat-main">
          <div className="bk-filters hide-sb">
            <span className={"bk-fchip" + (sortOpen ? " on" : "")} onClick={() => setSortOpen(!sortOpen)}>
              <ArrowUpDown size={12} strokeWidth={2.6} /> {sort} <ChevronDown size={13} />
            </span>
            <span className="bk-fchip">السعر <ChevronDown size={13} /></span>
            <span className="bk-fchip">الخصومات <ChevronDown size={13} /></span>
            <span className="bk-fchip">الماركة <ChevronDown size={13} /></span>
          </div>
          {sortOpen && (
            <div className="bk-chips" style={{ padding: "0 0 10px" }}>
              {SORTS.map((s) => (
                <span key={s} className={"bk-chip" + (sort === s ? " on" : "")}
                  onClick={() => { setSort(s); setSortOpen(false); }}>{s}</span>
              ))}
            </div>
          )}

          <div className="bk-cat-grid">
            {list.map((p) => (
              <ProductCard key={p.id} p={p} grid qty={cart[p.id] || 0} onAdd={add} onInc={inc} onDec={dec} />
            ))}
          </div>
          {list.length === 0 && <div className="bk-noresult"><div className="e">🧺</div>لا منتجات في هذه الفئة بعد</div>}

          {also.length > 0 && (
            <>
              <div className="bk-srch-sec" style={{ padding: "16px 0 10px" }}>اشترى الناس أيضاً</div>
              <div className="bk-cat-grid">
                {also.map((p) => (
                  <ProductCard key={p.id} p={p} grid qty={cart[p.id] || 0} onAdd={add} onInc={inc} onDec={dec} />
                ))}
              </div>
            </>
          )}
          <div style={{ height: 140 }} />
        </div>
      </div>
    </div>
  );
}
