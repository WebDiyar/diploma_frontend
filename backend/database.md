# 📂 Структура базы данных (MongoDB)

## 🛂 Коллекция: `users`
| Поле             | Тип       | Описание                          |
|-------------------|-----------|-----------------------------------|
| `_id`            | ObjectId  | Уникальный идентификатор          |
| `name`           | String    | Имя пользователя                  |
| `surname`        | String    | Фамилия                           |
| `email`          | String    | Почта                             |
| `password_hash`  | String    | Хэш пароля                        |
| `is_verified`    | Boolean   | Подтверждён ли email              |
| `phone`          | String    | Телефон                           |
| `bio`            | String    | Биография                         |
| `avatar_url`     | String    | Ссылка на аватар                  |
| `university`     | String    | Университет                       |

---

## 🏠 Коллекция: `apartments`
| Поле              | Тип       | Описание                          |
|--------------------|-----------|-----------------------------------|
| `_id`             | ObjectId  | Уникальный идентификатор          |
| `user_id`         | ObjectId  | ID владельца                      |
| `address`         | String    | Адрес                             |
| `latitude`        | Number    | Широта                            |
| `longitude`       | Number    | Долгота                           |
| `district_name`   | String    | Район                             |
| `apartment_name`  | String    | Название квартиры                 |
| `description`     | String    | Описание                          |
| `price_per_month` | Number    | Цена за месяц                     |
| `pictures`        | [String]  | Ссылки на изображения             |
| `is_promoted`     | Boolean   | Продвижение                       |
| `is_pet_allowed`  | Boolean   | Разрешены ли животные             |
| `available_from`  | Date      | Дата начала доступности           |
| `available_until` | Date      | Дата окончания доступности        |

---

## ❤️ Коллекция: `favorites`
| Поле              | Тип       | Описание                          |
|--------------------|-----------|-----------------------------------|
| `_id`             | ObjectId  | Уникальный идентификатор          |
| `user_id`         | ObjectId  | ID пользователя                   |
| `apartment_id`    | ObjectId  | ID квартиры                       |

---

## 🌟 Коллекция: `reviews`
| Поле              | Тип       | Описание                          |
|--------------------|-----------|-----------------------------------|
| `_id`             | ObjectId  | Уникальный идентификатор          |
| `apartment_id`    | ObjectId  | ID квартиры                       |
| `user_id`         | ObjectId  | ID пользователя                   |
| `rating`          | Number    | Рейтинг                           |
| `text`            | String    | Текст отзыва                      |
| `created_at`      | Date      | Дата создания                     |

---

## 📋 Коллекция: `bookings`
| Поле              | Тип       | Описание                          |
|--------------------|-----------|-----------------------------------|
| `_id`             | ObjectId  | Уникальный идентификатор          |
| `apartment_id`    | ObjectId  | ID квартиры                       |
| `user_id`         | ObjectId  | ID арендатора                     |
| `status`          | String    | Статус заявки (`pending`, `accepted`, `rejected`) |
| `message`         | String    | Сообщение от арендатора           |
| `application_date`| Date      | Дата подачи заявки                |

---

## 🗺️ Коллекция: `districts`
| Поле              | Тип       | Описание                          |
|--------------------|-----------|-----------------------------------|
| `_id`             | ObjectId  | Уникальный идентификатор          |
| `name`            | String    | Название района                   |
| `city`            | String    | Город                             |
| `latitude`        | Number    | Широта                            |
| `longitude`       | Number    | Долгота                           |

---

## 📊 Коллекция: `promotions`
| Поле              | Тип       | Описание                          |
|--------------------|-----------|-----------------------------------|
| `_id`             | ObjectId  | Уникальный идентификатор          |
| `apartment_id`    | ObjectId  | ID квартиры                       |
| `start_date`      | Date      | Дата начала продвижения           |
| `end_date`        | Date      | Дата окончания продвижения        |
| `is_active`       | Boolean   | Активно ли продвижение            |
