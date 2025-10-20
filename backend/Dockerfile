# ---------------------------------------------
# FastAPI Backend for Banking Soundness App
# Works with Railway, Deta, Render, or Cloud Run
# ---------------------------------------------

# 1️⃣ Base image: lightweight Python 3.11
FROM python:3.11-slim

# 2️⃣ Set working directory
WORKDIR /app

# 3️⃣ Install basic system dependencies (helps for building pandas, etc.)
RUN apt-get update && apt-get install -y --no-install-recommends \    build-essential gcc git curl \    && rm -rf /var/lib/apt/lists/*

# 4️⃣ Copy dependency list and install Python packages
COPY requirements.txt .
RUN python -m pip install --upgrade pip
RUN python -m pip install --no-cache-dir -r requirements.txt

# 5️⃣ Copy all source code into the container
COPY . .

# 6️⃣ Make start.sh executable (if present)
RUN if [ -f ./start.sh ]; then chmod +x ./start.sh; fi

# 7️⃣ Expose port (Cloud Run & Railway both use $PORT)
EXPOSE 8080

# 8️⃣ Default command: run the FastAPI app with Uvicorn
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8080"]
