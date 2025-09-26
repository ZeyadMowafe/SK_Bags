# ---------- Stage 1: Build frontend ----------
FROM node:18 AS frontend-builder
WORKDIR /app/frontend

# Install frontend deps
COPY frontend/package*.json ./
RUN npm install

# Copy frontend source and build
COPY frontend/ ./
RUN npm run build


# ---------- Stage 2: Backend ----------
FROM python:3.11-slim AS backend
WORKDIR /app

# Install system deps (لو محتاج psycopg2 أو غيره)
RUN apt-get update && apt-get install -y build-essential

# Install Python deps
COPY backend/requirements.txt ./backend/requirements.txt
RUN pip install --no-cache-dir -r backend/requirements.txt

# Copy backend source
COPY backend ./backend

# Copy built frontend into backend (static files)
COPY --from=frontend-builder /app/frontend/build ./backend/static

# Expose port
EXPOSE 8000

# Start FastAPI (run.py بيعمل كده أصلاً)
CMD ["python", "backend/run.py"]
