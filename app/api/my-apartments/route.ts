// app/api/my-apartments/route.js
import { NextResponse, NextRequest } from "next/server";

export async function GET(request: NextRequest) {
    // Fake data for apartments published by the user
    const myApartments = [
      {
        "apartment_id": "1",
        "apartment_name": "Студенческий уют AITU",
        "description": "Сдаётся светлая квартира рядом с университетом. Отлично подойдёт для студентов.",
        "address": {
          "street": "ул. Кабанбай батыра",
          "house_number": "10",
          "apartment_number": "12",
          "entrance": "2",
          "has_intercom": true,
          "landmark": "рядом с Burger King"
        },
        "district_name": "Yesil",
        "latitude": 51.0909,
        "longitude": 71.4187,
        "price_per_month": 95000,
        "area": 50.0,
        "kitchen_area": 8.0,
        "floor": 5,
        "number_of_rooms": 2,
        "max_users": 2,
        "available_from": "2025-05-01",
        "available_until": "2025-08-31",
        "university_nearby": "Astana IT University",
        "pictures": [
          "https://cdn.domain.com/img1.jpg",
          "https://cdn.domain.com/img2.jpg"
        ],
        "is_promoted": false,
        "is_pet_allowed": true,
        "rental_type": "room",
        "roommate_preferences": "не шумные, девушки, без животных",
        "included_utilities": ["Wi-Fi", "вода", "мебель", "стиральная машина"],
        "rules": ["только девушкам", "нельзя курить"],
        "contact_phone": "+77001234567",
        "contact_telegram": "@aitu_host"
      },
      {
        "apartment_id": "2",
        "apartment_name": "Уютная квартира в центре",
        "description": "Комфортная квартира для студентов в центре города. В шаговой доступности от всех необходимых объектов инфраструктуры.",
        "address": {
          "street": "ул. Достык",
          "house_number": "5",
          "apartment_number": "42",
          "entrance": "1",
          "has_intercom": true,
          "landmark": "напротив ТРЦ Керуен"
        },
        "district_name": "Есильский",
        "latitude": 51.1209,
        "longitude": 71.4307,
        "price_per_month": 120000,
        "area": 65.0,
        "kitchen_area": 12.0,
        "floor": 8,
        "number_of_rooms": 3,
        "max_users": 3,
        "available_from": "2025-06-01",
        "available_until": "2025-12-31",
        "university_nearby": "Nazarbayev University",
        "pictures": [
          "https://cdn.domain.com/apartment2-1.jpg",
          "https://cdn.domain.com/apartment2-2.jpg",
          "https://cdn.domain.com/apartment2-3.jpg"
        ],
        "is_promoted": true,
        "is_pet_allowed": false,
        "rental_type": "full",
        "roommate_preferences": "студенты, чистоплотные",
        "included_utilities": ["интернет", "коммунальные услуги", "телевидение"],
        "rules": ["не курить в квартире", "без шумных вечеринок"],
        "contact_phone": "+77012345678",
        "contact_telegram": "@central_apartment"
      },
      {
        "apartment_id": "3",
        "apartment_name": "Просторная квартира для студентов",
        "description": "Большая светлая квартира идеально подходит для совместного проживания студентов. Просторные комнаты и удобное расположение.",
        "address": {
          "street": "ул. Сыганак",
          "house_number": "15",
          "apartment_number": "89",
          "entrance": "3",
          "has_intercom": true,
          "landmark": "рядом с парком"
        },
        "district_name": "Алматинский",
        "latitude": 51.0876,
        "longitude": 71.4023,
        "price_per_month": 150000,
        "area": 85.0,
        "kitchen_area": 14.0,
        "floor": 12,
        "number_of_rooms": 4,
        "max_users": 4,
        "available_from": "2025-05-15",
        "available_until": "2026-05-15",
        "university_nearby": "Eurasian National University",
        "pictures": [
          "https://cdn.domain.com/apartment3-1.jpg",
          "https://cdn.domain.com/apartment3-2.jpg"
        ],
        "is_promoted": false,
        "is_pet_allowed": true,
        "rental_type": "full",
        "roommate_preferences": "студенты, спокойные, аккуратные",
        "included_utilities": ["вода", "электричество", "интернет", "мебель", "бытовая техника"],
        "rules": ["соблюдение тишины после 22:00", "бережное отношение к мебели"],
        "contact_phone": "+77023456789",
        "contact_telegram": "@spacious_flat"
      }
    ];
  
    // Определение, хочет ли пользователь получить список всех ID или полные данные
    const url = new URL(request.url);
    const listOnly = url.searchParams.get('list_only') === 'true';
  
    if (listOnly) {
      // Возвращаем только список ID квартир
      return Response.json({
        apartments: myApartments.map(apt => ({ apartment_id: apt.apartment_id }))
      });
    } else {
      // Возвращаем полные данные о квартирах
      return Response.json({ apartments: myApartments });
    }
  }
  
  // Обработка POST запроса для публикации новой квартиры
  export async function POST(request: NextRequest) {
    try {
      const apartmentData = await request.json();
      
      // В реальном приложении здесь был бы код для сохранения данных
      // Имитируем успешное создание с генерацией ID
      
      return Response.json({
        message: "Apartment published with map location.",
        apartment_id: `a${Math.floor(Math.random() * 100000)}`
      }, { status: 201 });
    } catch (error: any) {
      return Response.json({ 
        error: "Failed to process apartment data",
        message: error.message 
      }, { status: 400 });
    }
  }