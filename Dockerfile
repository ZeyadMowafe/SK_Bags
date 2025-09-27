# ---------- Stage 1: Build frontend ----------
FROM node:18 AS frontend-builder
WORKDIR /app/frontend

# Copy package.json & lock file
COPY frontend/package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the frontend source
COPY frontend/ ./

# Fix permissions then build
RUN chmod +x node_modules/.bin/react-scripts && npx react-scripts build


# ---------- Stage 2: Backend ----------
FROM python:3.11-slim AS backend
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    libffi-dev \
    libssl-dev \
    && rm -rf /var/lib/apt/lists/*

# Install Python deps
COPY backend/requirements.txt ./backend/requirements.txt
RUN pip install --no-cache-dir --upgrade pip
RUN pip install --no-cache-dir -r backend/requirements.txt

# Copy backend source
COPY backend ./backend

# Copy built frontend into backend static folder
COPY --from=frontend-builder /app/frontend/build ./backend/static

# Create uploads directory
RUN mkdir -p ./backend/uploads

# Set environment variables
ENV PYTHONPATH=/app
ENV PYTHONUNBUFFERED=1

# Expose port (Railway uses $PORT env variable)
EXPOSE $PORT

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:$PORT/health || exit 1

# Start FastAPI with dynamic port
CMD ["sh", "-c", "uvicorn backend.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
