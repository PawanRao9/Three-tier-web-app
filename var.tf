variable "region" {
  description = "The AWS region to deploy resources in."
  type        = string
  default     = "us-east-1"

}


variable "ami" {
  description = "provide your ami"
  type        = string
  default     = "----------------"
}

variable "instance_type" {
  description = "provide your instance type"
  type        = string
  default     = "t2.micro"
}
