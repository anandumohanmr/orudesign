@echo off
cd /d "%~dp0"
echo Starting Sibin & Midhuna wedding invitation...
echo Open http://localhost:5500 in your browser.
python -m http.server 5500
pause
