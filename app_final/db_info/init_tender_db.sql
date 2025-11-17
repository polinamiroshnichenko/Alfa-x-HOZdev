CREATE DATABASE tenders_info;
CREATE DATABASE tender_chunks;

GRANT ALL PRIVILEGES ON DATABASE tenders_info TO tender_user;
GRANT ALL PRIVILEGES ON DATABASE tender_chunks TO tender_user;


-- Подключаемся к первой базе
\c tenders_info_with_embeddings;

-- Включаем расширение для векторов
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE tender_info (
    id SERIAL PRIMARY KEY,
    law_type TEXT,
    registry_number TEXT UNIQUE,
    procurement_method TEXT,
    procurement_name TEXT,
    auction_subject TEXT,
    procurement_code TEXT,
    lot_number TEXT,
    lot_name TEXT,
    starting_price TEXT,
    okdp_classification TEXT,
    okpd_classification TEXT,
    okpd2_classification TEXT,
    position_code TEXT,
    customer_name TEXT,
    organizing_organization TEXT,
    procurement_stage TEXT,
    application_start_date TEXT,
    application_end_date TEXT,
    short_name TEXT,
    created_at TIMESTAMP,
    embedding vector(384)
);


-- Подключаемся ко второй базе
\c tender_chunks;

-- Включаем расширение для векторов
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE tender_chunks (
    id SERIAL PRIMARY KEY,
    registry_number TEXT NOT NULL,
    chunk_index INTEGER NOT NULL,
    text_chunk TEXT NOT NULL,
    embedding vector(384),
    law_type TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX ON tender_chunks USING ivfflat (embedding vector_l2_ops) WITH (lists = 100);
