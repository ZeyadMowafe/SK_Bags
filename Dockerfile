# ---------- Stage 1: Build frontend ----------
FROM node:18 AS frontend-builder
WORKDIR /app/frontend

# Copy package.json & lock first
COPY frontend/package*.json ./

# Install dependencies
RUN npm install --include=dev

# Fix permissions for bin scripts
RUN chmod +x node_modules/.bin/*

# Copy rest of frontend source
COPY frontend/ ./

# Build React app
RUN npm run build



# ---------- Stage 2: Backend ----------
FROM python:3.11-slim AS backend
WORKDIR /app

# Install system deps
RUN apt-get update && apt-get install -y build-essential && rm -rf /var/lib/apt/lists/*

# Install Python deps
COPY backend/requirements.txt ./backend/requirements.txt
RUN pip install --no-cache-dir -r backend/requirements.txt

# Copy backend source
COPY backend ./backend

# Copy built frontend into backend static files
COPY --from=frontend-builder /app/frontend/build ./backend/static

# Expose port
EXPOSE 8000

# Start FastAPI
CMD ["python", "backend/run.py"]
