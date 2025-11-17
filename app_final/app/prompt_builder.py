from typing import List, Dict

FIELD_LABELS_RU = {
    "law_type": "Тип закона",
    "registry_number": "Номер реестра",
    "procurement_method": "Метод закупки",
    "auction_subject": "Предмет аукциона",
    "lot_name": "Название лота",
    "procurement_name": "Название закупки",
    "starting_price": "Начальная цена",
    "okpd2_classification": "Классификация ОКПД2",
    "position_code": "Код позиции",
    "customer_name": "Заказчик",
    "procurement_stage": "Этап закупки",
    "application_start_date": "Дата начала подачи заявок",
    "application_end_date": "Дата окончания подачи заявок",
    "short_name": "Краткое название",
    "region": "Регион"
}

DEFAULT_INSTRUCTION = (
    "Ты - эксперт по тендерам. Используй только предоставленные данные о тендере и найденные фрагменты, в которых может содержаться необходимая для ответа информация. "
    "Ответь на запрос пользователя максимально точно, но при этом достаточно кратко и по существу. "
    "Если информации недостаточно, попробуй сделать выводы и выдать ответ на основе той информации, которая тебе предоставлена. Если качественный ответ выдать не получается, тогда честно скажи об этом одной короткой фразой, например: 'Информации недостаточно'. "
    "Если ответ подразумевает числа, валюту или даты - передавай их в том формате, что указан в данных."

)


def build_metadata_block(metadata: Dict) -> str:
    """
    Подписываем каждое поле на русском языке.
    """
    lines = []
    for key, label in FIELD_LABELS_RU.items():
        if key in metadata and metadata[key] is not None:
            lines.append(f"{label}: {metadata[key]}")
    return "ИНФОРМАЦИЯ О ТЕНДЕРЕ:\n" + "\n".join(lines)


def build_chunks_block(chunks: List[Dict]) -> str:
    """
    Перечисляем чанки, каждый с id и текстом.
    """
    if not chunks:
        return "ФРАГМЕНТЫ:\nИнформативные фрагменты не найдены."

    parts = []
    for i, c in enumerate(chunks, start=1):
        parts.append(f"--- ФРАГМЕНТ {i} ---\n{c.get('text_chunk')}")
    return "ФРАГМЕНТЫ:\n" + "\n\n".join(parts)

def build_prompt(metadata: Dict, chunks: List[Dict], user_query: str) -> str:
    """
    Собираем полный промпт для модели.
    """
    md_block = build_metadata_block(metadata)
    chunks_block = build_chunks_block(chunks)
    prompt = f"""{DEFAULT_INSTRUCTION}
Пользовательский запрос:
{user_query}

Общие данные о тендере:
{md_block}

Найденные фрагменты (ранжированные по релевантности):
{chunks_block}

Задача: используй только информацию из общих данных о тендерах и найденных фрагментов, чтобы ответить на запрос. 
Не добавляй лишней информации, в которой ты не уверен.
Если данных недостаточно - попробуй составить ответ на основе той  информации, которая тебе дана. Если это сделать не получается - честно скажи, что не хватает информации. 
"""
    return prompt
