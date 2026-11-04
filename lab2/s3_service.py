#Взаимодействие с облаком
import os
import boto3
from dotenv import load_dotenv # для загрузки найстройки из файла .env

load_dotenv() # загрузка ключей

s3 = boto3.client( # создание S3-клиента
    "s3",
    endpoint_url=os.getenv("S3_ENDPOINT"),
    aws_access_key_id=os.getenv("S3_ACCESS_KEY"),
    aws_secret_access_key=os.getenv("S3_SECRET_KEY"),
    region_name="ru-msk",
)

# s3 - объект через который вызываются методы S3

def get_buckets(): # получение списка бакетов
    response = s3.list_buckets() # отправляем запрос в VK Cloud и получаем ответ
    return [bucket["Name"] for bucket in response["Buckets"]] # формирование списка

def create_bucket(bucket_name):
    s3.create_bucket(Bucket=bucket_name) # создание бакета с именем

def delete_bucket(bucket_name):
    s3.delete_bucket(Bucket=bucket_name)  # удаление бакета с именем

def upload_file(bucket_name, file_name, file_data): # загрузка файлов file_data - файловый объект
    s3.upload_fileobj(file_data, bucket_name, file_name)

def get_files(bucket_name): # получение списка файлов
    response = s3.list_objects_v2(Bucket=bucket_name) # запрашивает у VK Cloud список объектов внутри указанного бакета
    return [obj["Key"] for obj in response.get("Contents", [])]

def delete_file(bucket_name, file_name): # удаление файла
    s3.delete_object(Bucket=bucket_name, Key=file_name) # delete_object() удаляет объект с указанным ключом

def get_file(bucket_name, file_name): # получение содержимого файла
    response = s3.get_object(Bucket=bucket_name, Key=file_name) # запрашивает объект из S3
    return response["Body"].read() # .read() считывает его содержимое