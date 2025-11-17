import pandas as pd
import psycopg2
from psycopg2.extras import execute_values
import json
import os

DATABASE_URL = os.getenv("DATABASE_URL_CHUNKS")
CSV_PATH = "tender_chunks.csv"

print("Загрузка данных чанков")

conn = psycopg2.connect(DATABASE_URL)
cur = conn.cursor()

df = pd.read_csv(CSV_PATH)
df['embedding'] = df['embedding'].apply(lambda x: json.loads(x) if isinstance(x, str) else x)

rows = [
    (row['registry_number'], row['chunk_index'], row['text_chunk'], row['embedding'], row['law_type'])
    for idx, row in df.iterrows()
]

execute_values(cur, """
INSERT INTO tender_chunks (registry_number, chunk_index, text_chunk, embedding, law_type)
VALUES %s
""", rows)

conn.commit()
cur.close()
conn.close()

print("CSV с чанками успешно загружен.")


