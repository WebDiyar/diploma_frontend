// "use client";

// import { useState, useEffect, useRef } from "react";
// import { YMaps, Map, Placemark } from "@pbe/reactyandex-maps";

// const API_KEY = process.env.NEXT_PUBLIC_YANDEX_MAPS_API_KEY;

// interface Suggestion {
//   address: string;
//   coords: [number, number];
//   fullAddress: string;
// }

// export default function YandexMapAstanaOnly() {
//   const [address, setAddress] = useState("");
//   const [coords, setCoords] = useState<[number, number] | null>([
//     51.0906, 71.398,
//   ]); // начально — Назарбаев Уни
//   const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
//   const [showSuggestions, setShowSuggestions] = useState(false);
//   const [selectedIndex, setSelectedIndex] = useState(-1);
//   const [loading, setLoading] = useState(false);

//   const inputRef = useRef<HTMLInputElement>(null);
//   const suggestionsRef = useRef<HTMLDivElement>(null);
//   const timeoutRef = useRef<NodeJS.Timeout>(null);

//   // Debounced поиск предложений
//   useEffect(() => {
//     if (timeoutRef.current) {
//       clearTimeout(timeoutRef.current);
//     }

//     if (address.length < 2) {
//       setSuggestions([]);
//       setShowSuggestions(false);
//       return;
//     }

//     timeoutRef.current = setTimeout(() => {
//       searchSuggestions(address);
//     }, 300);

//     return () => {
//       if (timeoutRef.current) {
//         clearTimeout(timeoutRef.current);
//       }
//     };
//   }, [address]);

//   const searchSuggestions = async (query: string) => {
//     if (!query || query.length < 2) return;

//     setLoading(true);
//     try {
//       // Используем наш API route вместо прямых запросов
//       const response = await fetch(
//         `/api/suggest?q=${encodeURIComponent(query)}`,
//       );

//       if (!response.ok) throw new Error("Ошибка получения предложений");

//       const data = await response.json();
//       console.log("API Route Response:", data); // Для отладки

//       const results = data.results || [];

//       const newSuggestions: Suggestion[] = results
//         .map((item: any) => {
//           const text = item.text || "";
//           const uri = item.uri || "";

//           // Извлекаем координаты из uri, если есть
//           let coords: [number, number] = [51.09, 71.398]; // дефолтные координаты Астаны

//           if (uri.includes("ll=")) {
//             const llMatch = uri.match(/ll=([0-9.-]+),([0-9.-]+)/);
//             if (llMatch) {
//               coords = [parseFloat(llMatch[2]), parseFloat(llMatch[1])]; // [lat, lon]
//             }
//           }

//           // Формируем короткий адрес
//           let shortAddress = text;

//           // Убираем "Казахстан, " в начале
//           if (shortAddress.startsWith("Казахстан, ")) {
//             shortAddress = shortAddress.replace("Казахстан, ", "");
//           }

//           // Убираем ", Астана" в конце если есть другие части
//           if (
//             shortAddress.includes(", ") &&
//             shortAddress.endsWith(", Астана")
//           ) {
//             shortAddress = shortAddress.replace(", Астана", "");
//           }

//           // Если остался только "Астана", оставляем полный адрес
//           if (shortAddress === "Астана" || shortAddress === "") {
//             shortAddress = text.replace("Казахстан, ", "");
//           }

//           return {
//             address: shortAddress,
//             coords: coords,
//             fullAddress: text,
//           };
//         })
//         .filter((item: Suggestion) => {
//           // Дополнительная фильтрация - убираем слишком общие результаты
//           return (
//             item.address !== "Астана" &&
//             item.address !== "Нур-Султан" &&
//             item.address.length > 3
//           );
//         })
//         .slice(0, 10);

//       console.log("Processed suggestions:", newSuggestions); // Для отладки

//       setSuggestions(newSuggestions);
//       setShowSuggestions(newSuggestions.length > 0);
//       setSelectedIndex(-1);
//     } catch (error) {
//       console.error("Ошибка при поиске предложений:", error);
//       setSuggestions([]);
//       setShowSuggestions(false);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleSuggestionClick = (suggestion: Suggestion) => {
//     setAddress(suggestion.address);
//     setCoords(suggestion.coords);
//     setShowSuggestions(false);
//     setSuggestions([]);
//     setSelectedIndex(-1);
//   };

//   const handleKeyDown = (e: React.KeyboardEvent) => {
//     if (!showSuggestions || suggestions.length === 0) return;

//     switch (e.key) {
//       case "ArrowDown":
//         e.preventDefault();
//         setSelectedIndex((prev) =>
//           prev < suggestions.length - 1 ? prev + 1 : 0,
//         );
//         break;
//       case "ArrowUp":
//         e.preventDefault();
//         setSelectedIndex((prev) =>
//           prev > 0 ? prev - 1 : suggestions.length - 1,
//         );
//         break;
//       case "Enter":
//         e.preventDefault();
//         if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
//           handleSuggestionClick(suggestions[selectedIndex]);
//         }
//         break;
//       case "Escape":
//         setShowSuggestions(false);
//         setSelectedIndex(-1);
//         inputRef.current?.blur();
//         break;
//     }
//   };

//   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     setAddress(e.target.value);
//   };

//   const handleInputFocus = () => {
//     if (suggestions.length > 0) {
//       setShowSuggestions(true);
//     }
//   };

//   // Закрытие списка при клике вне его
//   useEffect(() => {
//     const handleClickOutside = (event: MouseEvent) => {
//       if (
//         suggestionsRef.current &&
//         !suggestionsRef.current.contains(event.target as Node) &&
//         inputRef.current &&
//         !inputRef.current.contains(event.target as Node)
//       ) {
//         setShowSuggestions(false);
//         setSelectedIndex(-1);
//       }
//     };

//     document.addEventListener("mousedown", handleClickOutside);
//     return () => document.removeEventListener("mousedown", handleClickOutside);
//   }, []);

//   return (
//     <div className="w-full p-4">
//       <h2 className="text-xl font-bold mb-4">Где вы будете</h2>

//       <div className="relative mb-4">
//         <div className="flex gap-2">
//           <div className="relative flex-1">
//             <input
//               ref={inputRef}
//               type="text"
//               placeholder="Введите адрес в Астане"
//               value={address}
//               onChange={handleInputChange}
//               onFocus={handleInputFocus}
//               onKeyDown={handleKeyDown}
//               className="w-full border rounded px-3 py-2 text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
//             />

//             {loading && (
//               <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
//                 <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
//               </div>
//             )}

//             {showSuggestions && suggestions.length > 0 && (
//               <div
//                 ref={suggestionsRef}
//                 className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-b-md shadow-lg z-50 max-h-60 overflow-y-auto"
//               >
//                 {suggestions.map((suggestion, index) => (
//                   <div
//                     key={index}
//                     className={`px-3 py-2 cursor-pointer border-b border-gray-100 last:border-b-0 ${
//                       index === selectedIndex
//                         ? "bg-blue-100 text-blue-800"
//                         : "hover:bg-gray-50"
//                     }`}
//                     onClick={() => handleSuggestionClick(suggestion)}
//                     onMouseEnter={() => setSelectedIndex(index)}
//                   >
//                     <div className="text-sm font-medium text-gray-900">
//                       {suggestion.address}
//                     </div>
//                     <div className="text-xs text-gray-600 truncate">
//                       {suggestion.fullAddress}
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             )}
//           </div>
//         </div>
//       </div>

//       <YMaps query={{ lang: "ru_RU", apikey: API_KEY }}>
//         <Map
//           defaultState={{ center: [51.0906, 71.398], zoom: 13 }}
//           state={{ center: coords || [51.0906, 71.398], zoom: 14 }}
//           width="100%"
//           height="500px"
//           options={{
//             suppressMapOpenBlock: true,
//             yandexMapDisablePoiInteractivity: true,
//           }}
//           modules={["control.ZoomControl", "control.FullscreenControl"]}
//         >
//           {coords && <Placemark geometry={coords} />}
//         </Map>
//       </YMaps>
//     </div>
//   );
// }

"use client";

export default function YandexPage() {
  return (
    <div className="w-full h-screen flex items-center justify-center">
      <h1 className="text-2xl font-bold">Yandex Maps Integration</h1>
    </div>
  );
}
