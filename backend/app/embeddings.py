import requests
from sentence_transformers import SentenceTransformer
from typing import List, Dict

from .config import OPENROUTER_API_KEY, OPENROUTER_BASE, OPENROUTER_GEN_MODEL

model = SentenceTransformer("intfloat/multilingual-e5-small")


def embed_text(text: str) -> List[float]:
    """
    Возвращает эмбеддинг текста
    (Локальная модель: intfloat/multilingual-e5-small)
    """
    vec = model.encode(text)
    return vec.tolist()


def generate_completion(prompt: str, system: str = "") -> Dict:
    """
    Генерация текста через OpenRouter API
    """
    messages = []
    if system:
        messages.append({"role": "system", "content": system})
    messages.append({"role": "user", "content": prompt})

    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "Content-Type": "application/json"
    }

    payload = {
        "model": OPENROUTER_GEN_MODEL,
        "messages": messages,
    }

    try:
        response = requests.post(
            f"{OPENROUTER_BASE}/chat/completions",
            headers=headers,
            json=payload,
            timeout=90
        )
        response.raise_for_status()
        return response.json()

    except requests.exceptions.RequestException as e:
        print(f"Ошибка при вызове OpenRouter API: {e}")
        return {
            "choices": [
                {
                    "message": {
                        "content": f"[ОШИБКА ГЕНЕРАЦИИ] Не удалось получить ответ от OpenRouter. Причина: {e}"
                    }
                }
            ]
        }
