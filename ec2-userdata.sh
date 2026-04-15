#!/bin/bash
# Node.js 20.x 설치
curl -fsSL https://rpm.nodesource.com/setup_20.x | bash -
yum install -y nodejs git

# PM2 글로벌 설치
npm install -g pm2

# 앱 디렉토리 생성
mkdir -p /home/ec2-user/app
chown ec2-user:ec2-user /home/ec2-user/app
mkdir -p /home/ec2-user/app/tmp/uploads
chown -R ec2-user:ec2-user /home/ec2-user/app
