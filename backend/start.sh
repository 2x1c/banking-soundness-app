#!/bin/bash
# Simple start script for hosts expecting start.sh
pip install -r requirements.txt
exec uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}
