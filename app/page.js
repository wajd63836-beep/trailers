"use client";
import { useEffect, useState, useCallback } from "react";

const TABS = [
  { k: "movie", label: "🎬 أفلام" },
  { k: "tv", label: "📺 مسلسلات" },
  { k: "game", label: "🎮 ألعاب" },
  { k: "fav", label: "❤ المفضلة" },
];

export default function Home() {
  const [tab, setTab] = useState("movie");
  const [q, setQ] = useState("");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [favs, setFavs] = useState([]);
  const [active, setActive] = useState(null);

  useEffect(() => {
    try { setFavs(JSON.parse(localStorage.getItem("favs") || "[]")); } catch {}
  }, []);

  const saveFavs = (next) => {
    setFavs(next);
    try { localStorage.setItem("favs", JSON.stringify(next)); } catch {}
  };
  const isFav = (x) => favs.some((f) => f.id === x.id && f.type === x.type);
  const toggleFav = (x) =>
    saveFavs(isFav(x) ? favs.filter((f) => !(f.id === x.id && f.type === x.type)) : [...favs, x]);

  const load = useCallback(async () => {
    if (tab === "fav") return;
    setLoading(true); setError("");
    try {
      const res = await fetch(`/api/list?type=${tab}&q=${encodeURIComponent(q)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "خطأ");
      setItems(data.items);
    } catch (e) {
      setError(e.message); setItems([]);
    }
    setLoading(false);
  }, [tab, q]);

  useEffect(() => {
    const t = setTimeout(load, 350); // تأخير بسيط أثناء الكتابة
    return () => clearTimeout(t);
  }, [load]);

  const shown = tab === "fav" ? favs : items;
  const random = () => shown.length && setActive(shown[Math.floor(Math.random() * shown.length)]);

  return (
    <>
      <header>
        <div className="logo">تريلرز<span>.</span></div>
        <button className="btn" onClick={random}>🎲 تريلر عشوائي</button>
      </header>
      <main>
        <div className="tabs">
          {TABS.map((t) => (
            <button key={t.k} className={"tab" + (tab === t.k ? " on" : "")} onClick={() => setTab(t.k)}>
              {t.label}
            </button>
          ))}
        </div>
        {tab !== "fav" && (
          <input className="search" value={q} onChange={(e) => setQ(e.target.value)}
            placeholder="ابحثي عن فلم أو مسلسل أو لعبة…" />
        )}
        {error && <div className="msg err">{error}</div>}
        {loading && <div className="msg">جاري التحميل…</div>}
        {!loading && !error && shown.length === 0 && <div className="msg">لا توجد نتائج</div>}
        <div className="grid">
          {shown.map((x) => (
            <div className="card" key={x.type + x.id} onClick={() => setActive(x)}>
              <div className="poster">
                {x.image ? <img src={x.image} alt={x.title} loading="lazy" /> : <div className="noimg">{x.title}</div>}
                <div className="play">▶</div>
              </div>
              <div className="info">
                <div>
                  <div className="t">{x.title}</div>
                  <div className="y">{x.year}{x.rating ? ` · ⭐ ${x.rating.toFixed ? x.rating.toFixed(1) : x.rating}` : ""}</div>
                </div>
                <button className={"fav" + (isFav(x) ? " on" : "")}
                  onClick={(e) => { e.stopPropagation(); toggleFav(x); }}>♥</button>
              </div>
            </div>
          ))}
        </div>
      </main>
      {active && <TrailerModal item={active} onClose={() => setActive(null)} />}
      <footer>
        البيانات من TMDB وRAWG. هذا المنتج يستخدم TMDB API لكنه غير معتمد أو مصدّق من TMDB.
      </footer>
    </>
  );
}

function TrailerModal({ item, onClose }) {
  const [t, setT] = useState(null);

  useEffect(() => {
    fetch(`/api/trailer?type=${item.type}&id=${item.id}`)
      .then((r) => r.json()).then(setT).catch(() => setT({}));
  }, [item]);

  const yt = "https://www.youtube.com/results?search_query=" +
    encodeURIComponent(item.title + " official trailer");

  return (
    <div className="modal" onClick={onClose}>
      <div className="box" onClick={(e) => e.stopPropagation()}>
        <div className="player">
          {t === null && <div className="msg">جاري تحميل التريلر…</div>}
          {t?.youtube && (
            <iframe src={`https://www.youtube-nocookie.com/embed/${t.youtube}?autoplay=1`}
              allow="autoplay; encrypted-media; fullscreen" allowFullScreen title={item.title} />
          )}
          {t?.video && <video src={t.video} controls autoPlay />}
          {t && !t.youtube && !t.video && (
            <div className="msg">لا يوجد تريلر مضمّن لهذا العنوان.<br />
              <a className="btn" href={yt} target="_blank" rel="noopener noreferrer">ابحثي عنه في يوتيوب</a>
            </div>
          )}
        </div>
        <div className="body">
          <h2>{item.title} <small>{item.year}</small></h2>
          <p>{item.overview || "—"}</p>
          <button className="btn ghost" onClick={onClose}>إغلاق</button>
        </div>
      </div>
    </div>
  );
}
