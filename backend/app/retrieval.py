from typing import List, Dict
from app.db import get_main_conn, get_emb_conn, fetchall_dict, fetchone_dict
from app.embeddings import embed_text
from app.config import TOP_K_TENDERS, TOP_K_CHUNKS
from psycopg2.extras import Json


def get_tender_embeddings_table_exists(conn) -> bool:
    q = "SELECT to_regclass('public.tender_embeddings') is not null AS exists;"
    r = fetchone_dict(conn, q)
    return r and r.get("exists", False)


def find_top_k_tenders_with_metadata(user_vec: List[float], k: int = TOP_K_TENDERS) -> List[Dict]:
    """
    Находит top-k тендеров и сразу возвращает их метаданные.
    Выполняет один запрос вместо N+1.
    """
    q = """
        SELECT registry_number,
               application_start_date,
               application_end_date,
               short_name,
               'Москва' AS region,  
               starting_price,
               1 - (embedding <=> %s) AS relevance_score
        FROM tender_info
        ORDER BY embedding <=> %s 
            LIMIT %s;
        """
    with get_main_conn() as conn:
        rows = fetchall_dict(conn, q, params=(Json(user_vec), Json(user_vec), k))

    return rows if rows else []


def get_tender_metadata(registry_number: str) -> Dict:
    q = """
        SELECT law_type, \
               registry_number, \
               procurement_method, \
               auction_subject, \
               lot_name,
               procurement_name, \
               starting_price, \
               okpd2_classification, \
               position_code,
               customer_name, \
               procurement_stage, \
               application_start_date,
               application_end_date, \
               short_name
        FROM tender_info
        WHERE registry_number = %s OR registry_number = %s LIMIT 1; \
        """
    with get_main_conn() as conn:
        row = fetchone_dict(conn, q, (registry_number, registry_number.lstrip('0')))
    return row


def find_top_chunks_for_query(registry_number: str, query: str, top_k: int = TOP_K_CHUNKS) -> List[Dict]:
    """
    Векторизуем query и ищем top_k чанков для тендера, используя pgvector.
    """
    query_vector = embed_text(query)

    sql_query = """
                SELECT chunk_index AS id, 
                       text_chunk, \
                       1 - (embedding <=> %s) AS similarity
                FROM tender_chunks
                WHERE registry_number = %s OR registry_number = %s
                ORDER BY embedding <=> %s 
                    LIMIT %s;
                """

    with get_emb_conn() as conn:
        results = fetchall_dict(conn, sql_query, (Json(query_vector), registry_number, registry_number.lstrip('0'), Json(query_vector), top_k))

    return results if results else []


