#!/bin/bash
# Simple start script for hosts expecting start.sh
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
exec uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}
