<!-- # 📖 API ДОКУМЕНТАЦИЯ (FastAPI)

## 🛂 АВТОРИЗАЦИЯ И РЕГИСТРАЦИЯ

### 1. Регистрация пользователя

**POST** `/api/v1/auth/register`

#### 🔸 Request JSON:
```json
{
  "name": "Diyar",
  "email": "diyar@gmail.com",
  "password": "12345678",
  "confirm_password": "12345678"
}
```

#### ✅ Response JSON (успех):
```json
{
  "message": "Verification code sent to your email."
}
```

#### 🔴 Возможные ошибки:
```json
{
  "error": "Passwords do not match"
}
```
```json
{
  "error": "User with this email already exists"
}
```

---

### 2. Подтверждение email

**POST** `/api/v1/auth/verify`

#### 🔸 Request JSON:
```json
{
  "email": "diyar@gmail.com",
  "code": "8352"
}
```

#### ✅ Response JSON:
```json
{
  "message": "Email verified successfully. You can now log in."
}
```

#### 🔴 Возможные ошибки:
```json
{
  "error": "Invalid verification code"
}
```
```json
{
  "error": "User not found or already verified"
}
```

---

### 3. Логин пользователя

**POST** `/api/v1/auth/login`

#### 🔐 Требование: Email должен быть подтверждён.

#### 🔸 Request JSON:
```json
{
  "email": "diyar@gmail.com",
  "password": "12345678"
}
```

#### ✅ Response JSON:
```json
{
  "access_token": "jwt_token_here",
  "token_type": "bearer"
}
```

#### 🔴 Возможные ошибки:
```json
{
  "error": "Invalid email or password"
}
```
```json
{
  "error": "Email is not verified"
}
```

---

## 👤 ПРОФИЛЬ ПОЛЬЗОВАТЕЛЯ

### 1. Получить информацию о пользователе

**GET** `/api/v1/profile`

#### 🔐 Role: User (авторизованный)

#### ✅ Response JSON:
```json
{
  "user_id": "123",
  "name": "Diyar",
  "surname": "Amangeldi",
  "gender": "male",
  "email": "diyar@gmail.com",
  "phone": "+77001234567",
  "nationality": "Kazakh",
  "country": "Kazakhstan",
  "city": "Astana",
  "bio": "I’m a 3rd year student at Astana IT University.",
  "avatar_url": "https://cdn.domain.com/avatar.jpg",
  "id_document_url": "https://cdn.domain.com/id-card.png",
  "university": "Astana IT University"
}
```

---

### 2. Обновить профиль пользователя

**PATCH** `/api/v1/profile`

#### 🔐 Role: User

#### 🔸 Request JSON:
```json
{
  "name": "Diyar",
  "surname": "Amangeldi",
  "gender": "male",
  "email": "diyar@gmail.com",
  "phone": "+77001234567",
  "nationality": "Kazakh",
  "country": "Kazakhstan",
  "city": "Astana",
  "bio": "I’m a 3rd year student at Astana IT University.",
  "avatar_url": "https://cdn.domain.com/avatar.jpg",
  "id_document_url": "https://cdn.domain.com/id-card.png",
  "university": "Astana IT University"
}
```

#### ✅ Response JSON:
```json
{
  "message": "Profile updated successfully."
}
```

---

## 🏠 УПРАВЛЕНИЕ КВАРТИРАМИ

### 1. Публикация квартиры

**POST** `/api/v1/my-apartments`

#### 🔐 Role: User (Student / Landlord)

#### 🔸 Request JSON:
```json
{
  "address": "ул. Кабанбай батыра 10, кв. 12",
  "latitude": 51.0909,
  "longitude": 71.4187,
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
  "is_pet_allowed": true
}
```

#### ✅ Response JSON:
```json
{
  "message": "Apartment published with map location.",
  "apartment_id": "a12345"
}
```

---

### 2. Просмотр всех своих квартир

**GET** `/api/v1/my-apartments`

#### 🔐 Role: User

#### ✅ Response JSON:
```json
{
  "apartments": [
    {
      "apartment_id": "a12345",
      "apartment_name": "Parque Eduardo VII",
      "price_per_month": 95000,
      "address": "ул. Кабанбай батыра 10, кв. 12"
    }
  ]
}
```

---

### 3. Просмотр заявок на свою квартиру

**GET** `/api/v1/my-apartments/:id/bookings`

#### 🔐 Role: User

#### ✅ Response JSON:
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

### 4. Принять или отклонить заявку

**PATCH** `/api/v1/my-apartments/:apartment_id/bookings/:booking_id`

#### 🔐 Role: User

#### 🔸 Request JSON:
```json
{
  "status": "accepted" // или rejected
}
```

#### ✅ Response JSON:
```json
{
  "message": "Booking status updated."
}
```

---

### 5. Получение списка квартир, где ты подал заявку

**GET** `/api/v1/my-bookings`

#### 🔐 Role: User

#### ✅ Response JSON:
```json
{
  "applications": [
    {
      "apartment_name": "Parque Eduardo VII",
      "price": 50000,
      "name": "Dastan",
      "application_date": "2023-12-09",
      "status": "waiting_approval"
    }
  ]
}
```

---

## ❤️ ИЗБРАННЫЕ КВАРТИРЫ

### 1. Добавить в избранное

**POST** `/api/v1/favorites`

#### 🔸 Request JSON:
```json
{
  "apartment_id": "a12345"
}
```

---

### 2. Удалить из избранного

**DELETE** `/api/v1/favorites/:apartment_id`

---

### 3. Получить список всех избранных квартир

**GET** `/api/v1/favorites`

#### ✅ Response JSON:
```json
{
  "favorites": [
    {
      "apartment_id": "a12345",
      "apartment_name": "Casa da Alegría",
      "price": 95000,
      "address": "ул. Абая 22"
    }
  ]
}
```

---

## 🌟 ОТЗЫВЫ

### 1. Оставить отзыв

**POST** `/api/v1/reviews`

#### 🔸 Request JSON:
```json
{
  "apartment_id": "a12345",
  "landlord_id": "u789",
  "rating": 4,
  "text": "Всё понравилось, чисто, удобно. Владельцу спасибо!"
}
```

---

### 2. Получить отзывы по квартире

**GET** `/api/v1/apartments/:id/reviews`

#### ✅ Response JSON:
```json
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
```

---

### 3. Получить отзывы по владельцу

**GET** `/api/v1/users/:id/reviews`

#### ✅ Response JSON:
```json
{
  "reviews": [
    {
      "user_name": "Dastan",
      "rating": 4,
      "text": "Хороший арендодатель, рекомендую.",
      "created_at": "2025-04-10"
    }
  ]
}
``` -->
