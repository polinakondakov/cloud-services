from fastapi import FastAPI, HTTPException
from botocore.exceptions import ClientError

from s3_service import (
    get_buckets, create_bucket, delete_bucket,
    upload_file, get_files, delete_file, get_file
)

from fastapi import UploadFile, File
from fastapi.responses import Response

app = FastAPI() # создание приложения


@app.get("/")
def home():
    return {"message": "S3 Lab работает!"}


@app.get("/buckets") # получение списка бакетов
def list_buckets():
    return {"buckets": get_buckets()}


@app.post("/buckets/{bucket_name}") # создание бакета
def add_bucket(bucket_name: str):
    try:
        create_bucket(bucket_name)
        return {"message": "Бакет создан"}
    except ClientError as e:
        raise HTTPException(
            status_code=400,
            detail=e.response["Error"]["Code"]
        )


@app.delete("/buckets/{bucket_name}") # удаление бакета
def remove_bucket(bucket_name: str):
    try:
        delete_bucket(bucket_name)
        return {"message": "Бакет удалён"}
    except ClientError as e:
        raise HTTPException(
            status_code=400,
            detail=e.response["Error"]["Code"]
        )

@app.post("/buckets/{bucket_name}/files")  # загрузка файла. Работаем с файлами внутри конкретного бакета
def add_file(bucket_name: str, file: UploadFile = File(...)):
    upload_file(bucket_name, file.filename, file.file) # вызываем функцию из s3_service и передаем 3 значения
    # куда, имя файла, файловый объект
    return {"message": "Файл загружен"}


@app.get("/buckets/{bucket_name}/files") # получение списка файлов
def list_files(bucket_name: str):
    return {"files": get_files(bucket_name)}


@app.get("/buckets/{bucket_name}/files/{file_name}") # получение содержимого файла, уже с уточнением файла
def download_file(bucket_name: str, file_name: str):
    content = get_file(bucket_name, file_name) # get_file() из s3_service.py
    return Response(content=content, media_type="application/octet-stream") # Response() — создаёт HTTP-ответ, 
    # content=content — помещает в ответ содержимое файла
    # media_type="application/octet-stream" — указывает, что передаются бинарные данные

@app.delete("/buckets/{bucket_name}/files/{file_name}") # удаление файла
def remove_file(bucket_name: str, file_name: str):
    delete_file(bucket_name, file_name) # вызываем фукнцию из s3_service
    return {"message": "Файл удалён"}