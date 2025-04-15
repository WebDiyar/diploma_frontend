# 🏠 ПУБЛИКАЦИЯ КВАРТИРЫ СТУДЕНТОМ (ОБНОВЛЁННОЕ)

## 🏗️ 1. Публикация квартиры

**POST** `/api/v1/my-apartments`

### 🔐 Role: User (Student / Landlord)

**Описание:**  
Студент публикует квартиру, которая сразу становится доступной для бронирования.

### 🔸 Request JSON:
```json
{
  "address": "ул. Кабанбай батыра 10, кв. 12",
  "district_name": "Yesil",
  "apartment_name": "Parque Eduardo VII",
  "description": "Уютная квартира недалеко от университета. Отличный выбор для студентов.",
  "available_from": "2025-05-01",
  "available_until": "2025-08-31",
  "number_of_rooms": 2,
  "price_per_month": 95000,
  "floor": 5,
  "area": 50.0,
  "kitchen_area": 8.0,
  "max_users": 2,
  "university_nearby": "Astana IT University",
  "pictures": [
    "https://cdn.domain.com/img1.jpg",
    "https://cdn.domain.com/img2.jpg"
  ],
  "is_promoted": false,
  "is_pet_allowed": true,
}
```

### ✅ Response JSON:
```json
{
  "message": "Apartment published successfully.",
  "apartment_id": "a12345"
}
```

---

## 🏠 2. Просмотр всех своих квартир

**GET** `/api/v1/my-apartments`

### 🔐 Role: User

**Описание:**  
Получить список всех квартир, которые ты опубликовал.

### ✅ Response JSON:
```json
{
  "apartments": [
    {
      "apartment_id": "a12345",
      .....
    },
    {
      "apartment_id": "2",
      .....
    }
  ]
}
```

---

## 🧾 3. Просмотр заявок на свою квартиру

**GET** `/api/v1/my-apartments/:id/bookings`

### 🔐 Role: User

**Описание:**  
Список бронирований твоей квартиры, с сообщениями и профилями арендаторов.

### ✅ Response JSON:
```json
{
  "bookings": [
    {
      "booking_id": "b102",
      "user": {
        "user_id": "u334",
        "name": "Andreas",
        "avatar_url": "https://cdn.domain.com/u334.jpg",
        "university": "AITU",
        "email": "andreas@mail.com"
      },
      "message": "I'm a 3rd year student at AITU, looking for a room from September to December. I’m tidy and respectful.",
      "application_date": "2023-12-09",
      "status": "pending"
    }
  ]
}
```

---

## ✅❌ 4. Принять или отклонить заявку

**PATCH** `/api/v1/my-apartments/:apartment_id/bookings/:booking_id`

### 🔐 Role: User

**Описание:**  
Принять или отклонить бронь от студента.

### 🔸 Request JSON:
```json
{
  "status": "accepted" // или rejected, или pending
}
```

### ✅ Response JSON:
```json
{
  "message": "Booking status updated."
}
```
ф
## 🧾 5. Получение списка квартир, где ты подал заявку

**GET** `/api/v1/my-bookings`

### 🔐 Role: User

**Описание:**  
Посмотреть, на какие квартиры ты подавал заявку.

### ✅ Response JSON:
```json
{
  "applications": [
    {
      "room_title": "Room 2",
      "apartment_name": "Parque Eduardo VII",
      "price": 50000,
      "landlord_name": "Dastan",
      "application_date": "2023-12-09",
      "status": "waiting_approval"
    }
  ]
}

🗺️ Интеграция карты (Yandex / Google Maps)
📌 1. Публикация квартиры — теперь с координатами
POST /api/v1/my-apartments

🔐 Role: User
🗒️ Описание: при добавлении квартиры теперь сохраняется геолокация для карты

🔸 Request JSON (добавили latitude, longitude):
json
Копировать
Редактировать
{
  "address": "ул. Кабанбай батыра 10, кв. 12",
  "latitude": 51.0909,
  "longitude": 71.4187,
  "district_name": "Yesil",
  "apartment_name": "Parque Eduardo VII",
  ...
}
✅ Response JSON:
json
Копировать
Редактировать
{
  "message": "Apartment published with map location.",
  "apartment_id": "a12345"
}
🗺️ 2. Получение одной квартиры (детальная страница)
GET /api/v1/apartments/:id

✅ Response JSON:
json
Копировать
Редактировать
{
  "apartment_id": "a12345",
  "apartment_name": "Parque Eduardo VII",
  "address": "ул. Кабанбай батыра 10",
  "latitude": 51.0909,
  "longitude": 71.4187,
  ...
}
➡️ На фронте: используем latitude и longitude для отображения карты.

❤️ Избранные квартиры
📥 1. Добавить в избранное
POST /api/v1/favorites

json
Копировать
Редактировать
{
  "apartment_id": "a12345"
}
📤 2. Удалить из избранного
DELETE /api/v1/favorites/:apartment_id

📋 3. Получить список всех избранных квартир
GET /api/v1/favorites

✅ Response JSON:
json
Копировать
Редактировать
{
  "favorites": [
    {
      "apartment_id": "a12345",
      "apartment_name": "Casa da Alegría",
      "price": 95000,
      "address": "ул. Абая 22",
      ...
    }
  ]
}
🌟 Отзывы о квартирах и владельцах
✍️ 1. Оставить отзыв
POST /api/v1/reviews

json
Копировать
Редактировать
{
  "apartment_id": "a12345",
  "landlord_id": "u789",
  "rating": 4,
  "text": "Всё понравилось, чисто, удобно. Владельцу спасибо!"
}
🧾 2. Получить отзывы по квартире
GET /api/v1/apartments/:id/reviews

✅ Response JSON:
json
Копировать
Редактировать
{
  "reviews": [
    {
      "user_name": "Aliya",
      "rating": 5,
      "text": "Очень приятное жилье, рядом с университетом.",
      "created_at": "2025-04-15"
    }
  ]
}
🧾 3. Получить отзывы по владельцу
GET /api/v1/users/:id/reviews

