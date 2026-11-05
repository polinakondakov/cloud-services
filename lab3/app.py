
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import Response
from botocore.exceptions import ClientError

from s3_service import (
    get_buckets,
    create_bucket,
    delete_bucket,
    get_files,
    upload_file,
    get_file,
    delete_file
)

from vision_service import detect_objects

# Создаём приложение FastAPI
app = FastAPI()


# Получение списка бакетов
@app.get("/buckets")
def list_buckets():
    try:
        return {"buckets": get_buckets()}
    except ClientError as e:
        raise HTTPException(status_code=500, detail=str(e))


# Создание бакета
@app.post("/buckets/{bucket_name}")
def add_bucket(bucket_name: str):
    try:
        create_bucket(bucket_name)
        return {"message": "Бакет создан"}
    except ClientError as e:
        raise HTTPException(status_code=500, detail=str(e))


# Удаление бакета
@app.delete("/buckets/{bucket_name}")
def remove_bucket(bucket_name: str):
    try:
        delete_bucket(bucket_name)
        return {"message": "Бакет удалён"}
    except ClientError as e:
        raise HTTPException(status_code=500, detail=str(e))


# Получение списка файлов внутри бакета
@app.get("/buckets/{bucket_name}/files")
def list_files(bucket_name: str):
    try:
        return {"files": get_files(bucket_name)}
    except ClientError as e:
        raise HTTPException(status_code=500, detail=str(e))


# Загрузка файла в бакет
@app.post("/buckets/{bucket_name}/files")
def add_file(bucket_name: str, file: UploadFile = File(...)):
    try:
        upload_file(bucket_name, file.filename, file.file)
        return {"message": "Файл загружен"}
    except ClientError as e:
        raise HTTPException(status_code=500, detail=str(e))


# Получение содержимого файла из S3
@app.get("/buckets/{bucket_name}/files/{file_name}")
def download_file(bucket_name: str, file_name: str):
    try:
        content = get_file(bucket_name, file_name)
        return Response(
            content=content,
            media_type="application/octet-stream"
        )
    except ClientError as e:
        raise HTTPException(status_code=500, detail=str(e))


# Удаление файла из S3
@app.delete("/buckets/{bucket_name}/files/{file_name}")
def remove_file(bucket_name: str, file_name: str):
    try:
        delete_file(bucket_name, file_name)
        return {"message": "Файл удалён"}
    except ClientError as e:
        raise HTTPException(status_code=500, detail=str(e))


# Распознавание объектов на изображении через VK Cloud Vision
@app.post("/buckets/{bucket_name}/files/{file_name}/detect")
def recognize_file(bucket_name: str, file_name: str):
    try:
        # Получаем содержимое изображения из S3 в байтах
        image_data = get_file(bucket_name, file_name)

        # Передаём изображение в Vision API
        result = detect_objects(image_data, file_name)

        # Возвращаем JSON с результатами во фронтенд
        return result

    except ClientError as e:
        raise HTTPException(status_code=500, detail=str(e))
