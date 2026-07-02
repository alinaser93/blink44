import TileGrid from "./TileGrid.jsx";
import ProductRow from "./ProductRow.jsx";
import Bestsellers from "./Bestsellers.jsx";
import TrioPromos from "./TrioPromos.jsx";
import BannerCarousel from "./BannerCarousel.jsx";
import BigStores from "./BigStores.jsx";
import {
  GROCERY, SNACKS, BEAUTY, HOUSEHOLD, STORES_SPOTLIGHT, PICKS_LIFESTYLE,
} from "../data/collections.js";

export default function HomeContent({ cart, add, inc, dec, openList }) {
  return (
    <>
      <Bestsellers onOpen={openList} />

      <div className="bk-sec"><div className="bk-sec-h"><div className="bk-sec-t">البقالة والمطبخ</div></div></div>
      <TileGrid items={GROCERY} onOpen={openList} />

      <div className="bk-sec"><div className="bk-sec-h"><div className="bk-sec-t">وجبات خفيفة ومشروبات</div></div></div>
      <TileGrid items={SNACKS} onOpen={openList} />

      <div className="bk-sec"><div className="bk-sec-h"><div className="bk-sec-t">الجمال والعناية الشخصية</div></div></div>
      <TileGrid items={BEAUTY} onOpen={openList} />

      <div className="bk-sec"><div className="bk-sec-h"><div className="bk-sec-t">مستلزمات المنزل</div></div></div>
      <TileGrid items={HOUSEHOLD} onOpen={openList} />

      <div className="bk-sec"><div className="bk-sec-h"><div className="bk-sec-t">متاجر مميّزة</div></div></div>
      <TileGrid items={STORES_SPOTLIGHT} onOpen={openList} />

      <div className="bk-sec"><div className="bk-sec-h"><div className="bk-sec-t">مختارات لأسلوب حياتك</div></div></div>
      <TileGrid items={PICKS_LIFESTYLE} onOpen={openList} />

      <TrioPromos onOpen={openList} />

      <BannerCarousel onOpen={openList} />

      <ProductRow title="منتجات رائجة قربك" ids={[32, 33, 1, 28]} cart={cart} add={add} inc={inc} dec={dec} onSeeAll={() => openList("الرائج الآن")} />

      <div className="bk-ad">
        <h4>احتفال البرياني هنا</h4>
        <p>أحضر أجود أنواع الأرز</p>
        <div className="shop">تسوّق الآن</div>
        <div className="em">🍚</div>
        <div className="tag">إعلان</div>
      </div>

      <ProductRow title="لِعشّاق الحلويات" ids={[12, 25, 24, 22]} cart={cart} add={add} inc={inc} dec={dec} onSeeAll={() => openList("حلويات وشوكولاتة")} />

      <ProductRow title="مشروبات باردة وعصائر" ids={[3, 26, 23, 27]} cart={cart} add={add} inc={inc} dec={dec} onSeeAll={() => openList("مشروبات وعصائر")} />

      <ProductRow title="الألبان والخبز والبيض" ids={[28, 29, 30, 31]} cart={cart} add={add} inc={inc} dec={dec} onSeeAll={() => openList("ألبان وخبز وبيض")} />

      <BigStores onOpen={openList} />

      <ProductRow title="الأساسيات اليومية، توصيل سريع" ids={[4, 5, 14, 2]} cart={cart} add={add} inc={inc} dec={dec} onSeeAll={() => openList("البقالة")} />
    </>
  );
}
