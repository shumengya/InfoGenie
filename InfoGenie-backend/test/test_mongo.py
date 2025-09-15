#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
测试MongoDB连接
"""

import os
from pymongo import MongoClient
from dotenv import load_dotenv

# 加载环境变量
load_dotenv()

def test_mongodb_connection():
    """测试MongoDB连接"""
    try:
        # 获取连接字符串
        mongo_uri = os.environ.get('MONGO_URI')
        print(f"连接字符串: {mongo_uri}")
        
        # 创建连接
        client = MongoClient(mongo_uri)
        
        # 测试连接
        client.admin.command('ping')
        print("✅ MongoDB连接成功！")
        
        # 获取数据库
        db = client.InfoGenie
        print(f"数据库: {db.name}")
        
        # 测试集合访问
        userdata_collection = db.userdata
        print(f"用户集合: {userdata_collection.name}")
        
        # 测试查询（计算文档数量）
        count = userdata_collection.count_documents({})
        print(f"用户数据集合中有 {count} 个文档")
        
        # 关闭连接
        client.close()
        
    except Exception as e:
        print(f"❌ MongoDB连接失败: {str(e)}")
        
        # 尝试其他认证数据库
        print("\n尝试使用不同的认证配置...")
        try:
            # 尝试不指定认证数据库
            uri_without_auth = "mongodb://shumengya:tyh%4019900420@192.168.1.233:27017/InfoGenie"
            client2 = MongoClient(uri_without_auth)
            client2.admin.command('ping')
            print("✅ 不使用authSource连接成功！")
            client2.close()
        except Exception as e2:
            print(f"❌ 无authSource也失败: {str(e2)}")
            
        # 尝试使用InfoGenie作为认证数据库
        try:
            uri_with_infogenie_auth = "mongodb://shumengya:tyh%4019900420@192.168.1.233:27017/InfoGenie?authSource=InfoGenie"
            client3 = MongoClient(uri_with_infogenie_auth)
            client3.admin.command('ping')
            print("✅ 使用InfoGenie作为authSource连接成功！")
            client3.close()
        except Exception as e3:
            print(f"❌ InfoGenie authSource也失败: {str(e3)}")

if __name__ == "__main__":
    print("🔧 测试MongoDB连接...")
    test_mongodb_connection()
