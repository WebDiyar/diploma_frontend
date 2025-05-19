// "use client";

// import { useEffect, useRef, useState } from "react";
// import { Map, Placemark, YMaps } from "@pbe/react-yandex-maps";

// const DADATA_API_KEY = "";

// interface Suggestion {
//   value: string;
//   data: {
//     geo_lat: string;
//     geo_lon: string;
//   };
// }

// export default function MapWithAddressSuggest() {
//   const [input, setInput] = useState("");
//   const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
//   const [selectedCoords, setSelectedCoords] = useState<[number, number] | null>(null);
//   const [showSuggestions, setShowSuggestions] = useState(false);
//   const wrapperRef = useRef<HTMLDivElement>(null);

//   // Скрытие при клике вне
//   useEffect(() => {
//     const handleClickOutside = (e: MouseEvent) => {
//       if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
//         setShowSuggestions(false);
//       }
//     };
//     document.addEventListener("mousedown", handleClickOutside);
//     return () => document.removeEventListener("mousedown", handleClickOutside);
//   }, []);

//   // Фетч подсказок
//   useEffect(() => {
//     const fetchSuggestions = async () => {
//       if (input.length < 3) {
//         setSuggestions([]);
//         return;
//       }

//       try {
//         const res = await fetch("https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/address", {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//             Accept: "application/json",
//             Authorization: `Token ${DADATA_API_KEY}`,
//           },
//           body: JSON.stringify({
//             query: input,
//             count: 5,
//             locations: [
//               {
//                 city: "Астана",
//                 country: "Казахстан",
//               },
//             ],
//           }),
//         });

//         const data = await res.json();
//         setSuggestions(data.suggestions || []);
//         setShowSuggestions(true);
//       } catch (err) {
//         console.error("Ошибка при получении подсказок:", err);
//       }
//     };

//     const timeout = setTimeout(fetchSuggestions, 300);
//     return () => clearTimeout(timeout);
//   }, [input]);

//   const handleSelect = (suggestion: Suggestion) => {
//     setInput(suggestion.value);
//     setShowSuggestions(false);
//     const lat = parseFloat(suggestion.data.geo_lat);
//     const lon = parseFloat(suggestion.data.geo_lon);
//     setSelectedCoords([lat, lon]);
//   };

//   return (
//     <div className="w-full p-4" ref={wrapperRef}>
//       <div className="relative mb-4">
//         <input
//           className="w-full border px-4 py-2 rounded text-black"
//           placeholder="Введите адрес"
//           value={input}
//           onChange={(e) => setInput(e.target.value)}
//           onFocus={() => setShowSuggestions(true)}
//         />
//         {showSuggestions && suggestions.length > 0 && (
//           <div className="absolute z-50 top-full left-0 right-0 bg-white border mt-1 shadow rounded max-h-60 overflow-y-auto">
//             {suggestions.map((s, i) => (
//               <div
//                 key={i}
//                 className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-black"
//                 onClick={() => handleSelect(s)}
//               >
//                 {s.value}
//               </div>
//             ))}
//           </div>
//         )}
//       </div>

//       <YMaps query={{ apikey: "5e2f4ec8-c30d-4472-a94e-bbac01472caf", lang: "ru_RU" }}>
//         <Map
//           defaultState={{ center: [51.0906, 71.398], zoom: 13 }}
//           state={{ center: selectedCoords || [51.0906, 71.398], zoom: 14 }}
//           width="100%"
//           height="500px"
//           modules={["control.ZoomControl", "control.FullscreenControl"]}
//         >
//           {selectedCoords && <Placemark geometry={selectedCoords} />}
//         </Map>
//       </YMaps>
//     </div>
//   );
// }
