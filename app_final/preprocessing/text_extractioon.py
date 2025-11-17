import os
import tempfile
import shutil
import zipfile
import rarfile
import unicodedata
from pathlib import Path
from pdfminer.high_level import extract_text as pdf_extract_text
from docx import Document


BASE_DIRS = ["44-fz", "223-fz"]


def normalize_utf8(text):
    if text is None:
        return ""

    if isinstance(text, bytes):
        try:
            text = text.decode("utf-8")
        except:
            text = text.decode("latin-1", errors="ignore")

    if isinstance(text, str):
        text = text.encode("utf-8", errors="ignore").decode("utf-8", errors="ignore")
        text = unicodedata.normalize("NFC", text)
        return text

    return str(text)


# PDF
def read_pdf(path):
    try:
        return pdf_extract_text(str(path))
    except Exception as e:
        return f"[PDF ERROR: {e}]"


# DOCX
def read_docx(path):
    try:
        doc = Document(path)
        return "\n".join(p.text for p in doc.paragraphs)
    except Exception as e:
        return f"[DOCX ERROR: {e}]"


# DOC
def read_doc(path):
    try:
        import textract
        raw = textract.process(str(path))
        return raw.decode("utf-8", errors="ignore")
    except Exception:
        return "[DOC reading failed — install `pip install textract`]"


# XLS / XLSX
def read_excel(path):
    try:
        import pandas as pd
        df = pd.read_excel(str(path), dtype=str)
        return df.fillna("").astype(str).to_string()
    except Exception as e:
        return f"[EXCEL ERROR: {e}]"


# TXT
def read_text(path):
    try:
        return path.read_text(encoding="utf-8")
    except:
        return path.read_text(encoding="latin-1", errors="ignore")


def extract_text_from_file(path):

    ext = path.suffix.lower()

    if ext in [".html", ".htm"]:
        return ""  # пропускаем

    if ext == ".pdf":
        return normalize_utf8(read_pdf(path))

    if ext == ".docx":
        return normalize_utf8(read_docx(path))

    if ext == ".doc":
        return normalize_utf8(read_doc(path))

    if ext in [".xls", ".xlsx"]:
        return normalize_utf8(read_excel(path))

    if ext in [".txt", ".csv", ".md", ".log"]:
        return normalize_utf8(read_text(path))

    # Попытка прочитать неизвестный бинарный текст
    try:
        return normalize_utf8(path.read_bytes())
    except Exception:
        return ""


def process_zip(zip_path, collected_text):
    try:
        with zipfile.ZipFile(zip_path, "r") as z:
            with tempfile.TemporaryDirectory() as tmp:
                z.extractall(tmp)
                for root, _, files in os.walk(tmp):
                    for f in files:
                        p = Path(root) / f
                        collected_text.append(extract_text_from_file(p))
    except Exception as e:
        collected_text.append(f"[ZIP ERROR at {zip_path}: {e}]")


def process_rar(rar_path, collected_text):
    try:
        with rarfile.RarFile(rar_path) as rf:
            with tempfile.TemporaryDirectory() as tmp:
                rf.extractall(tmp)
                for root, _, files in os.walk(tmp):
                    for f in files:
                        p = Path(root) / f
                        collected_text.append(extract_text_from_file(p))
    except Exception as e:
        collected_text.append(f"[RAR ERROR at {rar_path}: {e}]")


def process_tender_folder(folder_path):
    collected_text = []

    for root, _, files in os.walk(folder_path):
        for filename in files:
            path = Path(root) / filename
            ext = path.suffix.lower()

            try:
                if ext == ".zip":
                    process_zip(path, collected_text)
                elif ext == ".rar":
                    process_rar(path, collected_text)
                else:
                    collected_text.append(extract_text_from_file(path))
            except Exception as e:
                collected_text.append(f"[ERROR processing {path}: {e}]")

    return normalize_utf8("\n\n".join(collected_text))


def main():
    for base in BASE_DIRS:
        if not os.path.exists(base):
            continue

        for tender_id in os.listdir(base):
            folder_path = os.path.join(base, tender_id)
            if not os.path.isdir(folder_path):
                continue

            print(f"Обработка тендера {tender_id} в {base}...")

            full_text = process_tender_folder(folder_path)

            out_file = os.path.join(base, f"{tender_id}.txt")
            with open(out_file, "w", encoding="utf-8") as f:
                f.write(full_text)

            print(f"Готово: {out_file}")


if __name__ == "__main__":
    main()


