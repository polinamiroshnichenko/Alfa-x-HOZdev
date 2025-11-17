from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from app.schemas import RegistrationRequest, TopTenderOut, ChatRequest
from app.embeddings import embed_text, generate_completion
from app.retrieval import find_top_k_tenders_with_metadata, get_tender_metadata, find_top_chunks_for_query
from app.prompt_builder import build_prompt
from app.config import TOP_K_TENDERS, MAX_CHUNKS

app = FastAPI(title="Tender Recommender")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://frontend:3000", "http://localhost:3000", "http://frontend:80", "http://localhost:80"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/llm/register", response_model=list[TopTenderOut])
def register_and_get_tenders(req: RegistrationRequest):
    combined = f"{req.business_field}. {req.business_description}"

    try:
        vec = embed_text(combined)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Embedding error: {e}")

    tenders_list = find_top_k_tenders_with_metadata(vec, k=TOP_K_TENDERS)

    return tenders_list

@app.get("/llm/check")
def check_server():
    print("Server checked")
    return "Удачная проверка"

@app.post("/llm/chat")
def chat_with_tender(req: ChatRequest):
    meta = get_tender_metadata(req.registry_number)
    if not meta:
        raise HTTPException(status_code=404, detail="Tender not found")

    try:
        relevant_chunks = find_top_chunks_for_query(req.registry_number, req.user_query, top_k=MAX_CHUNKS)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Chunk search error: {e}")

    prompt = build_prompt(meta, relevant_chunks, req.user_query)

    try:
        gen = generate_completion(prompt)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Generation error: {e}")

    try:
        content = gen["choices"][0]["message"]["content"]
    except (KeyError, IndexError, TypeError):
        content = "Не удалось извлечь текстовый ответ из модели. Полный ответ в 'model_response_raw'."

    return {
        "model_response_raw": gen,
        "model_text": content,
        "relevant_chunks": relevant_chunks,
        "used_chunks": [c["id"] for c in relevant_chunks]
    }
