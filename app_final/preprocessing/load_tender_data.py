import pandas as pd
import psycopg2
from psycopg2.extras import execute_values

# Воссоздаёт таблицу tender_info в любой новой PostgreSQL-базе

conn = psycopg2.connect(
    host="localhost", port=5432,
    dbname="ragdb", user="postgres", password="postgres"
)
cur = conn.cursor()

with open("../db_info/init_tender_db.sql") as f:
    cur.execute(f.read())
conn.commit()

df = pd.read_csv("tender_info.csv", dtype=str).fillna("")
rows = [tuple(row) for row in df.values]

insert_query = """
INSERT INTO tender_info (
    id, law_type, registry_number, procurement_method, procurement_name,
    auction_subject, procurement_code, lot_number, lot_name,
    starting_price, okdp_classification, okpd_classification, okpd2_classification,
    position_code, customer_name, organizing_organization, procurement_stage,
    application_start_date, application_end_date, short_name, created_at
)
VALUES %s
ON CONFLICT (registry_number) DO UPDATE SET
    law_type = EXCLUDED.law_type,
    procurement_method = EXCLUDED.procurement_method,
    procurement_name = EXCLUDED.procurement_name,
    auction_subject = EXCLUDED.auction_subject,
    procurement_code = EXCLUDED.procurement_code,
    lot_number = EXCLUDED.lot_number,
    lot_name = EXCLUDED.lot_name,
    starting_price = EXCLUDED.starting_price,
    okdp_classification = EXCLUDED.okdp_classification,
    okpd_classification = EXCLUDED.okpd_classification,
    okpd2_classification = EXCLUDED.okpd2_classification,
    position_code = EXCLUDED.position_code,
    customer_name = EXCLUDED.customer_name,
    organizing_organization = EXCLUDED.organizing_organization,
    procurement_stage = EXCLUDED.procurement_stage,
    application_start_date = EXCLUDED.application_start_date,
    application_end_date = EXCLUDED.application_end_date,
    short_name = EXCLUDED.short_name;
"""

execute_values(cur, insert_query, rows)
conn.commit()
cur.close()
conn.close()
print("Данные загружены")
