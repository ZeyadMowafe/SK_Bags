# ---------- Stage 1: Build frontend ----------
FROM node:18 AS frontend-builder
WORKDIR /app/frontend

# Copy package.json & package-lock.json
COPY frontend/package*.json ./

# Install all dependencies (including react-scripts)
RUN npm install

# Copy rest of frontend source
COPY frontend/ ./

# Build React app
RUN npx react-scripts build


# ---------- Stage 2: Backend ----------
FROM python:3.11-slim AS backend
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y build-essential && rm -rf /var/lib/apt/lists/*

# Copy backend requirements & install
COPY backend/requirements.txt ./backend/requirements.txt
RUN pip install --no-cache-dir -r backend/requirements.txt

# Copy backend source
COPY backend ./backend

# Copy built frontend into backend static folder
COPY --from=frontend-builder /app/frontend/build ./backend/static

# Expose port
EXPOSE 8000

# Start FastAPI
CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]
