"""Tiny local preview server for the OneCut product website."""
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
import os

ROOT = Path(__file__).resolve().parent
os.chdir(ROOT)
address = ("127.0.0.1", 8000)
print("OneCut website preview: http://localhost:8000")
print("Press Ctrl+C to stop.")
ThreadingHTTPServer(address, SimpleHTTPRequestHandler).serve_forever()
