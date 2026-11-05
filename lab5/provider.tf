terraform {
    required_providers {
        aws = {
            source = "hashicorp/aws"
            version = "< 6.71.0"
        }
    }
}

provider "aws" {
    region                      = "ru-msk"
    access_key                  = "?????????"
    secret_key                  = "?????????"
    skip_credentials_validation = true
    skip_metadata_api_check     = true
    skip_requesting_account_id  = true
    skip_region_validation      = true
    endpoints {
        s3 = "https://hb.ru-msk.vkcloud-storage.ru"
    }
}