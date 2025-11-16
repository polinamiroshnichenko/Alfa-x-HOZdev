import pandas as pd
from sentence_transformers import SentenceTransformer

CSV_INPUT = "tender_info.csv"
CSV_OUTPUT = "tender_info_with_embeddings.csv"
MODEL_NAME = "intfloat/multilingual-e5-small"

df = pd.read_csv(CSV_INPUT, dtype=str).fillna("")

df['text_for_embedding'] = (
    df['short_name'].astype(str) + " " +
    df['procurement_name'].astype(str) + " " +
    df['okpd2_classification'].astype(str) + " " +
    df['position_code'].astype(str)
)

model = SentenceTransformer(MODEL_NAME)

embeddings = model.encode(df['text_for_embedding'].tolist(), normalize_embeddings=True)
df['embedding'] = embeddings.tolist()

df.to_csv(CSV_OUTPUT, index=False)
print(f"Эмбеддинги созданы и сохранены в {CSV_OUTPUT}")
