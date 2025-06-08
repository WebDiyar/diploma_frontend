// app/api/suggest/route.ts (для App Router)
import { NextRequest, NextResponse } from "next/server";

const API_KEY = process.env.NEXT_PUBLIC_YANDEX_MAPS_API_KEY;

export async function GET(request: NextRequest) {
  return NextResponse.json(
    { error: "This API is deprecated. Please use the new API at /api/suggest" },
    { status: 410 },
  );
}

//  {export async function GET(request: NextRequest)
//   const { searchParams } = new URL(request.url);
//   const query = searchParams.get("q");

//   if (!query || !API_KEY) {
//     return NextResponse.json(
//       { error: "Missing query or API key" },
//       { status: 400 },
//     );
//   }

//   try {
//     // Пробуем SuggestView API
//     const suggestResponse = await fetch(
//       `https://suggest-maps.yandex.ru/v1/suggest?apikey=${API_KEY}&text=${encodeURIComponent(
//         query,
//       )}&lang=ru_RU&results=10&ll=71.398,51.090&spn=0.6,0.5&rspn=1`,
//     );

//     if (suggestResponse.ok) {
//       const suggestData = await suggestResponse.json();

//       // Фильтруем только результаты из Астаны
//       const filteredResults =
//         suggestData.results?.filter((item: any) => {
//           const text = item.text || "";
//           return text.includes("Астана") || text.includes("Нур-Султан");
//         }) || [];

//       return NextResponse.json({ results: filteredResults });
//     }

//     // Fallback на Geocoding API
//     const geocodeResponse = await fetch(
//       `https://geocode-maps.yandex.ru/1.x/?apikey=${API_KEY}&geocode=${encodeURIComponent(
//         query + " Астана",
//       )}&format=json&results=10`,
//     );

//     if (!geocodeResponse.ok) {
//       throw new Error("Geocoding API failed");
//     }

//     const geocodeData = await geocodeResponse.json();
//     const features =
//       geocodeData.response.GeoObjectCollection.featureMember || [];

//     // Преобразуем в формат suggest API
//     const results = features
//       .map((item: any) => {
//         const geoObject = item.GeoObject;
//         const pos = geoObject.Point.pos.split(" ").map(Number);
//         const lat = pos[1];
//         const lon = pos[0];

//         // Проверяем, что в Астане
//         const inAstana = lat > 50.8 && lat < 51.3 && lon > 71 && lon < 71.6;
//         if (!inAstana) return null;

//         const fullAddress = geoObject.metaDataProperty.GeocoderMetaData.text;

//         return {
//           text: fullAddress,
//           uri: `ymapsbm1://geo?ll=${lon},${lat}&z=17`,
//         };
//       })
//       .filter(Boolean);

//     return NextResponse.json({ results });
//   } catch (error) {
//     console.error("API Error:", error);
//     return NextResponse.json(
//       { error: "Failed to fetch suggestions" },
//       { status: 500 },
//     );
//   }
// }

// import type { NextApiRequest, NextApiResponse } from "next";

// export default async function handler(
//   req: NextApiRequest,
//   res: NextApiResponse,
// ) {
//   const { q: query } = req.query;

//   if (!query || !API_KEY) {
//     return res.status(400).json({ error: "Missing query or API key" });
//   }

//   try {
//     const response = await fetch(
//       `https://suggest-maps.yandex.ru/v1/suggest?apikey=${API_KEY}&text=${encodeURIComponent(
//         query as string,
//       )}&lang=ru_RU&results=10&ll=71.398,51.090&spn=0.6,0.5&rspn=1`,
//     );

//     if (!response.ok) {
//       throw new Error("API request failed");
//     }

//     const data = await response.json();

//     const filteredResults =
//       data.results?.filter((item: any) => {
//         const text = item.text || "";
//         return text.includes("Астана") || text.includes("Нур-Султан");
//       }) || [];

//     res.status(200).json({ results: filteredResults });
//   } catch (error) {
//     console.error("API Error:", error);
//     res.status(500).json({ error: "Failed to fetch suggestions" });
//   }
// }
