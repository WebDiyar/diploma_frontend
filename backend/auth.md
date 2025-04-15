# 🛂 АВТОРИЗАЦИЯ И РЕГИСТРАЦИЯ API (FastAPI)

## 📌 1. Регистрация пользователя

**POST** `/api/v1/auth/register`

### 🔸 Request JSON:
```json
{
  "name": "Diyar",
  "email": "diyar@gmail.com", // любая почта
  "password": "12345678", 
  "confirm_password": "12345678" // с паролем должен совподать но на фроннте сделаю
}
```

### ✅ Response JSON (успех):
```json
{
  "message": "Verification code sent to your email."
}
```

### 🔴 Возможные ошибки:
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

## 📩 2. Подтверждение email

**POST** `/api/v1/auth/verify`

### 🔸 Request JSON:
```json
{
  "email": "diyar@mail.com",
  "code": "8352"
}
```

### ✅ Response JSON:
```json
{
  "message": "Email verified successfully. You can now log in."
}
```

### 🔴 Ошибки:
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

## 🔐 3. Логин пользователя

**POST** `/api/v1/auth/login` - доступ разрешён только после подтверждения email.


### 🔸 Request JSON:
```json
{
  "email": "diyar@mail.com",
  "password": "12345678"
}
```

### ✅ Response JSON:
```json
{
  "access_token": "jwt_token_here",
  "token_type": "bearer",
}
```

### 🔴 Ошибки:
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

## 🛡️ JWT Защищенные роуты

Все защищённые роуты требуют в заголовке:

```
Authorization: Bearer <jwt_token>
```


