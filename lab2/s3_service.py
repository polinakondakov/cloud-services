#Взаимодействие с облаком
import os
import boto3
from dotenv import load_dotenv

load_dotenv()

s3 = boto3.client(
    "s3",
    endpoint_url=os.getenv("S3_ENDPOINT"),
    aws_access_key_id=os.getenv("S3_ACCESS_KEY"),
    aws_secret_access_key=os.getenv("S3_SECRET_KEY"),
    region_name="ru-msk",
)

def get_buckets():
    response = s3.list_buckets()
    return [bucket["Name"] for bucket in response["Buckets"]]

def create_bucket(bucket_name):
    s3.create_bucket(Bucket=bucket_name)


def delete_bucket(bucket_name):
    s3.delete_bucket(Bucket=bucket_name)

def upload_file(bucket_name, file_name, file_data):
    s3.upload_fileobj(file_data, bucket_name, file_name)


def get_files(bucket_name):
    response = s3.list_objects_v2(Bucket=bucket_name)
    return [obj["Key"] for obj in response.get("Contents", [])]


def delete_file(bucket_name, file_name):
    s3.delete_object(Bucket=bucket_name, Key=file_name)


def get_file(bucket_name, file_name):
    response = s3.get_object(Bucket=bucket_name, Key=file_name)
    return response["Body"].read()