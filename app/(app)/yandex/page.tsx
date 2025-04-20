"use client";

import { useState } from "react";
import { YMaps, Map, Placemark } from "@pbe/react-yandex-maps";
// import toast, { Toaster } from 'react-hot-toast';

const API_KEY = process.env.NEXT_PUBLIC_YANDEX_MAPS_API_KEY;

export default function YandexMapAstanaOnly() {
  const [address, setAddress] = useState("");
  const [coords, setCoords] = useState<[number, number] | null>([
    51.0906, 71.398,
  ]); // начально — Назарбаев Уни

  const handleSearch = async () => {
    if (!address) {
      alert("Введите адрес!");
      return;
    }

    try {
      const response = await fetch(
        `https://geocode-maps.yandex.ru/1.x/?apikey=${API_KEY}&geocode=${encodeURIComponent(
          address,
        )}&format=json`,
      );

      if (!response.ok) throw new Error("Ошибка геокодирования");

      const data = await response.json();
      const found =
        data.response.GeoObjectCollection.featureMember?.[0]?.GeoObject;

      if (!found) {
        alert("Адрес не найден!");
        return;
      }

      const pos = found.Point.pos.split(" ").map(Number); // [долгота, широта]
      const lat = pos[1];
      const lon = pos[0];

      // Проверим, в пределах ли это Астаны
      const inAstana = lat > 50.8 && lat < 51.3 && lon > 71 && lon < 71.6;

      if (!inAstana) {
        alert("Адрес вне города Астана!");
        return;
      }

      setCoords([lat, lon]);
    } catch (error) {
      alert("Произошла ошибка при поиске!");
    }
  };

  return (
    <div className="w-full p-4">
      <h2 className="text-xl font-bold mb-4">Где вы будете</h2>

      <div className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder="Введите адрес в Астане"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className="w-full border rounded px-3 py-2 text-black"
        />
        <button
          onClick={handleSearch}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Показать
        </button>
      </div>

      <YMaps query={{ lang: "ru_RU", apikey: API_KEY }}>
        <Map
          defaultState={{ center: [51.0906, 71.398], zoom: 13 }}
          state={{ center: coords || [51.0906, 71.398], zoom: 14 }}
          width="100%"
          height="500px"
          options={{
            suppressMapOpenBlock: true,
            yandexMapDisablePoiInteractivity: true,
          }}
          modules={["control.ZoomControl", "control.FullscreenControl"]}
        >
          {coords && <Placemark geometry={coords} />}
        </Map>
      </YMaps>
    </div>
  );
}
