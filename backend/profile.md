# 👤 ПРОФИЛЬ ПОЛЬЗОВАТЕЛЯ (FastAPI)

## 🧾 1. Получить информацию о пользователе

**GET** `/api/v1/profile`

### 🔐 Role: User (авторизованный)

**Описание:**  
Получает полную информацию о себе для отображения в профиле на фронте.

**Примечание:**  
- Имя (`name`) и почта (`email`) сохраняются в БД при регистрации.  
- При запросе `/profile` данные извлекаются из БД по `user_id`, который содержится в JWT токене.  
- Остальные поля (`surname`, `phone`, `bio` и т.д.) будут `null` или пустыми, пока пользователь сам не заполнит их через `PATCH /profile`.

### ✅ Response JSON:
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

## ✏️ 2. Обновить профиль пользователя

**PATCH** `/api/v1/profile`

### 🔐 Role: User

**Описание:**  
Обновляет любые поля профиля пользователя.

### 🔸 Request JSON (можно отправлять частично):
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

### ✅ Response JSON:
```json
{
  "message": "Profile updated successfully."
}
```

---

## 🔐 JWT Защита

Для этих роутов обязателен токен:

```
Authorization: Bearer <jwt_token>
```
