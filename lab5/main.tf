# Создание бакета
resource "aws_s3_bucket" "example-bucket" {
    bucket = "my-lab5-bucket-konda-2024"
    force_destroy = true
    region = "ru-msk"
}

# Создание объектов (файлов)
resource "aws_s3_object" "object-one" {
  bucket = aws_s3_bucket.example-bucket.bucket
  key    = "object-one"
  source = "docs/readme.md"
  acl    = "private"
  etag   = filemd5("docs/readme.md")
}

resource "aws_s3_object" "object-two" {
  bucket = aws_s3_bucket.example-bucket.bucket
  key    = "tmp/object-two"
  source = "docs/video.mp4"
  acl    = "private"
  source_hash = filemd5("docs/video.mp4")
}