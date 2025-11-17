import psycopg2

from psycopg2.extras import RealDictCursor
from typing import Dict
from .config import DB1, DB2
from pgvector.psycopg2 import register_vector


def connect_db(db_conf: Dict):
    conn = psycopg2.connect(
        host=db_conf["host"],
        port=db_conf["port"],
        dbname=db_conf["dbname"],
        user=db_conf["user"],
        password=db_conf["password"],
    )
    return conn


def get_main_conn():
    conn = connect_db(DB1)
    register_vector(conn)

    return conn


def get_emb_conn():
    conn = connect_db(DB2)
    register_vector(conn)
    return conn


def fetchall_dict(conn, query, params=None):
    with conn.cursor(cursor_factory=RealDictCursor) as cur:
        cur.execute(query, params or ())
        return cur.fetchall()


def fetchone_dict(conn, query, params=None):
    with conn.cursor(cursor_factory=RealDictCursor) as cur:
        cur.execute(query, params or ())
        return cur.fetchone()
