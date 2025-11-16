import os
import logging
from pathlib import Path
import psycopg2
from psycopg2.extras import execute_values
from sentence_transformers import SentenceTransformer
from transformers import AutoTokenizer
from langchain.text_splitter import RecursiveCharacterTextSplitter

logging.getLogger("transformers.tokenization_utils_base").setLevel(logging.ERROR)
os.environ["TOKENIZERS_PARALLELISM"] = "false"


DB_HOST = "localhost"
DB_PORT = 5433
DB_NAME = "ragdb"
DB_USER = "postgres"
DB_PASSWORD = "postgres"

TXT_DIRS = ["44-fz", "223-fz"]

CHUNK_SIZE = 430
OVERLAP = 50
MODEL_NAME = 'intfloat/multilingual-e5-small'

model = SentenceTransformer(MODEL_NAME)
tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
print(f"Модель и токенизатор для {MODEL_NAME} загружены")

text_splitter = RecursiveCharacterTextSplitter.from_huggingface_tokenizer(
    tokenizer=tokenizer,
    chunk_size=CHUNK_SIZE,
    chunk_overlap=OVERLAP,
    add_start_index=False,
    separators=[""]
)
print(f"Чанкер текста готов")


def chunk_text(text):
    return text_splitter.split_text(text)


conn = psycopg2.connect(
    host=DB_HOST,
    port=DB_PORT,
    dbname=DB_NAME,
    user=DB_USER,
    password=DB_PASSWORD
)
cur = conn.cursor()
print("Подключение к БД готово")

cur.execute("""
    DROP TABLE IF EXISTS tender_chunks;
    CREATE EXTENSION IF NOT EXISTS vector;
    CREATE TABLE IF NOT EXISTS tender_chunks (
        id SERIAL PRIMARY KEY,
        registry_number TEXT NOT NULL,
        chunk_index INTEGER NOT NULL,
        text_chunk TEXT NOT NULL,
        embedding vector(384), 
        law_type TEXT,
        created_at TIMESTAMP DEFAULT NOW()
    );
""")
conn.commit()
print("База данных готова")

total_chunks = 0
processed_files = 0

for txt_dir in TXT_DIRS:
    law_type = "44-ФЗ" if "44" in txt_dir else "223-ФЗ"
    dir_path = Path(txt_dir)

    if not dir_path.exists():
        print(f"Директория {txt_dir} не найдена")
        continue

    txt_files = sorted(dir_path.glob("*.txt"))

    print(f"\nОбработка директории: {txt_dir} ({law_type})")

    for txt_path in txt_files:
        registry_number = txt_path.stem
        try:
            try:
                text = txt_path.read_text(encoding="utf-8").strip()
            except UnicodeDecodeError:
                text = txt_path.read_text(encoding="cp1251").strip()

            if not text:
                continue

            chunks = chunk_text(text)

            if not chunks:
                continue

            embeddings = model.encode(chunks, normalize_embeddings=True)

            rows = [
                (registry_number, i, chunk, emb.tolist(), law_type)
                for i, (chunk, emb) in enumerate(zip(chunks, embeddings))
            ]

            execute_values(
                cur,
                """
                INSERT INTO tender_chunks (registry_number, chunk_index, text_chunk, embedding, law_type)
                VALUES %s
                ON CONFLICT DO NOTHING
                """,
                rows
            )

            conn.commit()
            total_chunks += len(chunks)
            processed_files += 1
            print(f"Файл {registry_number}: {len(chunks)} чанков добавлено")

        except Exception as e:
            print(f"ОШИБКА при обработке файла {registry_number}: {e}")
            conn.rollback()

print("\n" + "="*50)
print(f"Обработка завершена")
print(f"Всего обработано файлов: {processed_files}")
print(f"Всего чанков добавлено в БД: {total_chunks}")
print("="*50)

cur.close()
conn.close()
