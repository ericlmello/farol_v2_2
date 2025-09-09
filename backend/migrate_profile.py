#!/usr/bin/env python3

from app.db.database import engine
from sqlalchemy import text

def migrate_profile_table():
    """Remove NOT NULL constraints from first_name and last_name columns"""
    try:
        with engine.connect() as conn:
            # Remove NOT NULL constraint from first_name
            conn.execute(text('ALTER TABLE profiles ALTER COLUMN first_name DROP NOT NULL'))
            print("✅ Removida constraint NOT NULL de first_name")
            
            # Remove NOT NULL constraint from last_name
            conn.execute(text('ALTER TABLE profiles ALTER COLUMN last_name DROP NOT NULL'))
            print("✅ Removida constraint NOT NULL de last_name")
            
            conn.commit()
            print("✅ Migração concluída com sucesso!")
            
    except Exception as e:
        print(f"❌ Erro na migração: {e}")

if __name__ == "__main__":
    migrate_profile_table()
