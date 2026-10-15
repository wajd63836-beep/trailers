import { NextResponse } from "next/server";

const TMDB = "https://api.themoviedb.org/3";
const RAWG = "https://api.rawg.io/api";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type");
  const id = searchParams.get("id");
  if (!type || !id) return NextResponse.json({}, { status: 400 });

  try {
    if (type === "game") {
      const url = `${RAWG}/games/${id}/movies?key=${process.env.RAWG_API_KEY}`;
      const data = await (await fetch(url, { next: { revalidate: 86400 } })).json();
      const v = data.results?.[0]?.data;
      return NextResponse.json({ video: v?.max || v?.["480"] || null });
    }
    // التريلرات في TMDB غالباً بالإنجليزية، لذلك نطلبها بـ en-US
    const url = `${TMDB}/${type}/${id}/videos?api_key=${process.env.TMDB_API_KEY}&language=en-US`;
    const data = await (await fetch(url, { next: { revalidate: 86400 } })).json();
    const vids = (data.results || []).filter((v) => v.site === "YouTube");
    const pick =
      vids.find((v) => v.type === "Trailer" && v.official) ||
      vids.find((v) => v.type === "Trailer") ||
      vids.find((v) => v.type === "Teaser");
    return NextResponse.json({ youtube: pick?.key || null });
  } catch (e) {
    return NextResponse.json({});
  }
}
