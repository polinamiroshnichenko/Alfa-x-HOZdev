import pandas as pd
import psycopg2
from psycopg2.extras import execute_values
import json
import os

CSV_PATH = 'tender_info_with_embeddings.csv'

print("Запуск скрипта загрузки метаданных тендеров")

db_url = os.getenv("DATABASE_URL_INFO")

if not db_url:
    raise ValueError("Переменная окружения DATABASE_URL_INFO не установлена")

conn = None
cur = None

try:
    print("Подключение к базе данных...")
    conn = psycopg2.connect(db_url)
    cur = conn.cursor()
    print("Подключение успешно.")

    print(f"Чтение данных из файла: {CSV_PATH}")
    if not os.path.exists(CSV_PATH):
        raise FileNotFoundError(f"Файл не найден по пути: {CSV_PATH}")

    df = pd.read_csv(CSV_PATH, dtype=str).fillna("")

    df['embedding'] = df['embedding'].apply(
        lambda x: json.loads(x) if isinstance(x, str) and x.startswith('[') else None)

    df['created_at'] = pd.to_datetime(df['created_at'], errors='coerce').dt.tz_localize(
        None)
    df['created_at'] = df['created_at'].where(pd.notna(df['created_at']), None)

    print("Подготовка данных для вставки")
    rows = [
        tuple(row) for row in df[[
            'law_type', 'registry_number', 'procurement_method', 'procurement_name',
            'auction_subject', 'procurement_code', 'lot_number', 'lot_name',
            'starting_price', 'okdp_classification', 'okpd_classification', 'okpd2_classification',
            'position_code', 'customer_name', 'organizing_organization', 'procurement_stage',
            'application_start_date', 'application_end_date', 'short_name', 'created_at', 'embedding'
        ]].values
    ]

    insert_query = """
                   INSERT INTO tender_info (law_type, registry_number, procurement_method, procurement_name, \
                                            auction_subject, procurement_code, lot_number, lot_name, \
                                            starting_price, okdp_classification, okpd_classification, \
                                            okpd2_classification, \
                                            position_code, customer_name, organizing_organization, procurement_stage, \
                                            application_start_date, application_end_date, short_name, created_at, \
                                            embedding)
                   VALUES %s ON CONFLICT (registry_number) DO \
                   UPDATE SET
                       law_type = EXCLUDED.law_type, \
                       procurement_method = EXCLUDED.procurement_method, \
                       procurement_name = EXCLUDED.procurement_name, \
                       embedding = EXCLUDED.embedding; \
                   """

    print(f"Вставка/обновление {len(rows)} записей")
    execute_values(cur, insert_query, rows)
    conn.commit()
    print("Данные успешно загружены и сохранены.")

except Exception as e:
    print(f"Произошла ошибка: {e}")
    raise

finally:
    if cur is not None:
        cur.close()
    if conn is not None:
        conn.close()
    print("Соединение с базой данных закрыто.")

