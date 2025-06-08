import type { NextApiRequest, NextApiResponse } from "next";

const API_KEY = process.env.NEXT_PUBLIC_YANDEX_MAPS_API_KEY;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { q: query } = req.query;

  if (!query || !API_KEY) {
    return res.status(400).json({ error: "Missing query or API key" });
  }

  try {
    const response = await fetch(
      `https://suggest-maps.yandex.ru/v1/suggest?apikey=${API_KEY}&text=${encodeURIComponent(
        query as string,
      )}&lang=ru_RU&results=10&ll=71.398,51.090&spn=0.6,0.5&rspn=1`,
    );

    if (!response.ok) {
      throw new Error("API request failed");
    }

    const data = await response.json();

    const filteredResults =
      data.results?.filter((item: any) => {
        const text = item.text || "";
        return text.includes("Астана") || text.includes("Нур-Султан");
      }) || [];

    res.status(200).json({ results: filteredResults });
  } catch (error) {
    console.error("API Error:", error);
    res.status(500).json({ error: "Failed to fetch suggestions" });
  }
}
