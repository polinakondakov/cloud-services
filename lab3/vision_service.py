import os
import json
import requests  # Отправка HTTP-запросов
from dotenv import load_dotenv # Загрузка переменных из файла .env

load_dotenv()

VISION_TOKEN = os.getenv("VISION_TOKEN") # Получаем токен авторизации
VISION_URL = os.getenv("VISION_URL") # Получаем адрес Vision API

# Функция отправки изображения на распознавание
# здесь мы формируем отдельный HTTP-запрос к VK Cloud Vision. 
# Библиотека requests объединяет files и data в тело формата multipart/form-data.
def detect_objects(image_data, filename):
    # Описание задания для Vision
    meta = {
        "mode": ["multiobject"], # Режим обнаружения нескольких объектов
        "images": [{"name": "file"}] # Имя изображения в HTTP-форме
    }

    # Отправляем POST-запрос в VK Cloud Vision
    response = requests.post(
        VISION_URL,  # Адрес облачного API
        params={     # Параметры URL
            "oauth_token": VISION_TOKEN,
            "oauth_provider": "mcs"
        },
        files={
            "file": (filename, image_data) # Имя файла и его байты
        },
        data={
            "meta": json.dumps(meta) # Описание задания в формате JSON
        },
        timeout=60  # Максимальное ожидание ответа - 60 секунд
    )

    response.raise_for_status() # Проверяем HTTP-статус ответа
    return response.json() # Возвращаем JSON как данные Python