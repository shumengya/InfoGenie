#!/bin/bash

# InfoGenie 后端 Docker 镜像构建脚本
# Created by: 万象口袋
# Date: 2025-09-16

set -e

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 配置
IMAGE_NAME="infogenie-backend"
IMAGE_TAG="latest"
DOCKERFILE_PATH="."

# 函数：打印信息
print_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查Docker是否安装
check_docker() {
    if ! command -v docker &> /dev/null; then
        print_error "Docker 未安装，请先安装 Docker"
        exit 1
    fi
    print_info "Docker 版本: $(docker --version)"
}

# 检查Dockerfile是否存在
check_dockerfile() {
    if [ ! -f "Dockerfile" ]; then
        print_error "Dockerfile 不存在"
        exit 1
    fi
    print_info "找到 Dockerfile"
}

# 构建Docker镜像
build_image() {
    print_info "开始构建 Docker 镜像: ${IMAGE_NAME}:${IMAGE_TAG}"

    # 构建镜像
    docker build \
        --no-cache \
        -t ${IMAGE_NAME}:${IMAGE_TAG} \
        -f ${DOCKERFILE_PATH}/Dockerfile \
        ${DOCKERFILE_PATH}

    if [ $? -eq 0 ]; then
        print_info "Docker 镜像构建成功!"
        print_info "镜像信息:"
        docker images ${IMAGE_NAME}:${IMAGE_TAG}
    else
        print_error "Docker 镜像构建失败"
        exit 1
    fi
}

# 显示使用说明
show_usage() {
    echo ""
    print_info "构建完成! 使用方法:"
    echo ""
    echo "1. 运行容器 (需要MongoDB):"
    echo "   docker run -d \\"
    echo "     --name infogenie-backend \\"
    echo "     -p 5002:5002 \\"
    echo "     -e MONGO_URI=mongodb://host.docker.internal:27017/InfoGenie \\"
    echo "     -e SECRET_KEY=your-secret-key \\"
    echo "     -e MAIL_USERNAME=your-email@qq.com \\"
    echo "     -e MAIL_PASSWORD=your-app-password \\"
    echo "     ${IMAGE_NAME}:${IMAGE_TAG}"
    echo ""
    echo "2. 使用 Docker Compose (推荐):"
    echo "   创建 docker-compose.yml 文件并运行:"
    echo "   docker-compose up -d"
    echo ""
    echo "3. 查看日志:"
    echo "   docker logs infogenie-backend"
    echo ""
    echo "4. 停止容器:"
    echo "   docker stop infogenie-backend"
    echo "   docker rm infogenie-backend"
}

# 主函数
main() {
    print_info "InfoGenie 后端 Docker 镜像构建脚本"
    print_info "=================================="

    # 检查环境
    check_docker
    check_dockerfile

    # 构建镜像
    build_image

    # 显示使用说明
    show_usage

    print_info "构建脚本执行完成!"
}

# 执行主函数
main "$@"
