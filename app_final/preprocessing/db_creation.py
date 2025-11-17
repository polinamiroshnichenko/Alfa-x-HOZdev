import pandas as pd
import psycopg2
from psycopg2.extras import execute_values


DB_HOST = "localhost"
DB_PORT = 5432
DB_NAME = "ragdb"
DB_USER = "postgres"
DB_PASSWORD = "postgres"
EXCEL_FILE = "/xlsx_tender_data.xlsx"


try:
    df = pd.read_excel(EXCEL_FILE, dtype=str).fillna("")
    df.columns = df.columns.str.strip()
except Exception as e:
    print(f"Ошибка при чтении Excel-файла: {e}")
    exit(1)

COLUMN_MAP = {
    "Закупки по": "law_type",
    "Реестровый номер закупки": "registry_number",
    "Способ определения поставщика (подрядчика, исполнителя), подрядной организации (размещения закупки)": "procurement_method",
    "Наименование закупки": "procurement_name",
    "Предмет электронного аукциона (только для ПП РФ 615)": "auction_subject",
    "Идентификационный код закупки": "procurement_code",
    "Номер лота": "lot_number",
    "Наименование лота": "lot_name",
    "Начальная (максимальная) цена контракта": "starting_price",
    "Классификация по ОКДП": "okdp_classification",
    "Классификация по ОКПД": "okpd_classification",
    "Классификация по ОКПД2": "okpd2_classification",
    "Код позиции": "position_code",
    "Наименование Заказчика": "customer_name",
    "Организация, осуществляющая размещение": "organizing_organization",
    "Этап закупки": "procurement_stage",
    "Дата начала подачи заявок": "application_start_date",
    "Дата окончания подачи заявок": "application_end_date",
    "Краткое название": "short_name"
}

try:
    df = df.rename(columns=COLUMN_MAP)
    df = df[list(COLUMN_MAP.values())]
    df = df.drop_duplicates(subset=["registry_number"], keep="last")

except KeyError as e:
    print(f"Отсутствует колонка в Excel-файле: {e}")
    exit(1)

df = df.astype(object).where(pd.notnull(df), "")
df = df.astype(str)

create_table_sql = """
CREATE TABLE IF NOT EXISTS tender_info (
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
    created_at TIMESTAMP DEFAULT NOW()
);
"""

try:
    conn = psycopg2.connect(
        host=DB_HOST,
        port=DB_PORT,
        dbname=DB_NAME,
        user=DB_USER,
        password=DB_PASSWORD
    )
    cur = conn.cursor()
except psycopg2.OperationalError as e:
    print(f"Ошибка подключения к базе данных: {e}")
    exit(1)

try:
    cur.execute(create_table_sql)
    conn.commit()

    rows = [tuple(row) for row in df.values]

    insert_query = """
    INSERT INTO tender_info (
        law_type, registry_number, procurement_method, procurement_name,
        auction_subject, procurement_code, lot_number, lot_name,
        starting_price, okdp_classification, okpd_classification, okpd2_classification,
        position_code, customer_name, organizing_organization, procurement_stage,
        application_start_date, application_end_date, short_name
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
    print(f"Успешно загружено {len(rows)} записей в таблицу tender_info.")

except Exception as e:
    print(f"Ошибка при выполнении SQL-запроса: {e}")
    conn.rollback()
finally:
    cur.close()
    conn.close()
