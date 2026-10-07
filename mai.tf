terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.region
}


resource "aws_instance" "my_server" {
  ami           = var.ami.id
  instance_type = var.instance_type
  tags = {
    "name" = "my_server"
  }

}

resource "aws_vpc" "my_vps" {
    cidr_block = "10.0.0.0/16"
    tags = {
        name = my_vpc
    }
}

resource "aws_subnet" "public_subnet" {
    vpc_id = aws_vpc.my_vps.id
    cidr_block = "0.0.0.0/0"
    tags = {
      "name" = "public"
    }
  
}

