FROM python:3.9-slim

WORKDIR /app

COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

COPY app /app/app
COPY db_info /app/db_info

ENV PYTHONPATH=/app
