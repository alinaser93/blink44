import { ChevronLeft } from "lucide-react";
import ProductCard from "./ProductCard.jsx";
import { useStore } from "../store/appStore.js";

export default function ProductRow({ title, sub, ids, cart, add, inc, dec, onSeeAll, cardBg, cardBorder }) {
  const products = useStore((s) => s.products);
  return (
    <>
      {title && (
        <div className="bk-sec">
          <div className="bk-sec-h">
            <div>
              <div className="bk-sec-t">{title}</div>
              {sub && <div className="bk-sec-sub">{sub}</div>}
            </div>
            <div className="bk-sec-link" onClick={onSeeAll}>عرض الكل <ChevronLeft size={15} strokeWidth={2.6} /></div>
          </div>
        </div>
      )}
      <div className="bk-hs hide-sb">
        {ids.map((id) => products.find((x) => x.id === id)).filter(Boolean).map((p) => (
          <ProductCard key={p.id} p={p} qty={cart[p.id] || 0} onAdd={add} onInc={inc} onDec={dec} cardBg={cardBg} cardBorder={cardBorder} />
        ))}
      </div>
    </>
  );
}
