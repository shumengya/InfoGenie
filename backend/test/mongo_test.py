#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
MongoDB连接测试
"""

from pymongo import MongoClient

def test_connection():
    # 测试不同的连接配置
    configs = [
        "mongodb://shumengya:tyh%4019900420@192.168.1.233:27017/InfoGenie",
        "mongodb://shumengya:tyh%4019900420@192.168.1.233:27017/InfoGenie?authSource=admin",
        "mongodb://shumengya:tyh%4019900420@192.168.1.233:27017/InfoGenie?authSource=InfoGenie",
        "mongodb://shumengya:tyh%4019900420@192.168.1.233:27017/?authSource=admin",
    ]
    
    for i, uri in enumerate(configs):
        print(f"\n测试配置 {i+1}: {uri}")
        try:
            client = MongoClient(uri, serverSelectionTimeoutMS=5000)
            client.admin.command('ping')
            print("✅ 连接成功！")
            
            # 测试InfoGenie数据库
            db = client.InfoGenie
            collections = db.list_collection_names()
            print(f"数据库集合: {collections}")
            
            # 测试userdata集合
            if 'userdata' in collections:
                count = db.userdata.count_documents({})
                print(f"userdata集合文档数: {count}")
            
            client.close()
            return uri
            
        except Exception as e:
            print(f"❌ 连接失败: {str(e)}")
    
    return None

if __name__ == "__main__":
    print("🔧 测试MongoDB连接...")
    success_uri = test_connection()
    if success_uri:
        print(f"\n✅ 成功的连接字符串: {success_uri}")
    else:
        print("\n❌ 所有连接尝试都失败了")
