import os

DB1 = {
    "host": os.getenv("DB1_HOST", "localhost"),
    "port": int(os.getenv("DB1_PORT", 5432)),
    "dbname": os.getenv("DB1_NAME", "ragdb"),
    "user": os.getenv("DB1_USER", "postgres"),
    "password": os.getenv("DB1_PASSWORD", "postgres"),
}

DB2 = {
    "host": os.getenv("DB2_HOST", "localhost"),
    "port": int(os.getenv("DB2_PORT", 5432)),
    "dbname": os.getenv("DB2_NAME", "ragdb"),
    "user": os.getenv("DB2_USER", "postgres"),
    "password": os.getenv("DB2_PASSWORD", "postgres"),
}

OPENROUTER_API_KEY = "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"
OPENROUTER_BASE = "https://openrouter.ai/api/v1"
OPENROUTER_GEN_MODEL = "qwen/qwen3-14b:free"
EMBED_MODEL_LOCAL = "intfloat/multilingual-e5-small"

# Context window & chunk sizing
CONTEXT_TOKENS = int(os.getenv("CONTEXT_TOKENS", 32768))
CHUNK_TOKEN_ESTIMATE = int(os.getenv("CHUNK_TOKEN_ESTIMATE", 500))
PROMPT_OVERHEAD_TOKENS = int(os.getenv("PROMPT_OVERHEAD_TOKENS", 2048))

# computed max chunks
MAX_CHUNKS = min(10, max(1, (CONTEXT_TOKENS - PROMPT_OVERHEAD_TOKENS) // CHUNK_TOKEN_ESTIMATE))

# similarity params
TOP_K_TENDERS = int(os.getenv("TOP_K_TENDERS", 5))
TOP_K_CHUNKS = int(os.getenv("TOP_K_CHUNKS", MAX_CHUNKS))
