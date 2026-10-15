import { NextResponse } from "next/server";

const TMDB = "https://api.themoviedb.org/3";
const RAWG = "https://api.rawg.io/api";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type") || "movie";
  const q = (searchParams.get("q") || "").trim();

  try {
    if (type === "game") {
      const key = process.env.RAWG_API_KEY;
      if (!key) return NextResponse.json({ error: "RAWG_API_KEY غير موجود في .env.local" }, { status: 500 });
      const url = new URL(RAWG + "/games");
      url.searchParams.set("key", key);
      url.searchParams.set("page_size", "24");
      if (q) url.searchParams.set("search", q);
      else url.searchParams.set("ordering", "-added");
      const data = await (await fetch(url, { next: { revalidate: 3600 } })).json();
      const items = (data.results || []).map((g) => ({
        id: g.id,
        type: "game",
        title: g.name,
        year: g.released ? g.released.slice(0, 4) : "",
        image: g.background_image,
        overview: (g.genres || []).map((x) => x.name).join(" · "),
        rating: g.rating,
      }));
      return NextResponse.json({ items });
    }

    const key = process.env.TMDB_API_KEY;
    if (!key) return NextResponse.json({ error: "TMDB_API_KEY غير موجود في .env.local" }, { status: 500 });
    const path = q ? `/search/${type}` : `/trending/${type}/week`;
    const url = new URL(TMDB + path);
    url.searchParams.set("api_key", key);
    url.searchParams.set("language", "ar");
    if (q) url.searchParams.set("query", q);
    const data = await (await fetch(url, { next: { revalidate: 3600 } })).json();
    const items = (data.results || []).map((m) => ({
      id: m.id,
      type,
      title: m.title || m.name,
      year: (m.release_date || m.first_air_date || "").slice(0, 4),
      image: m.poster_path ? `https://image.tmdb.org/t/p/w500${m.poster_path}` : null,
      overview: m.overview,
      rating: m.vote_average,
    }));
    return NextResponse.json({ items });
  } catch (e) {
    return NextResponse.json({ error: "تعذر جلب البيانات" }, { status: 500 });
  }
}
