"""Diagnostic script — checks DB schema, API connectivity, and OCR."""
import sqlite3, sys, subprocess

DB = "healthlens.db"

print("=" * 60)
print("1. DATABASE SCHEMA")
print("=" * 60)
conn = sqlite3.connect(DB)
cur = conn.cursor()
cur.execute("SELECT name FROM sqlite_master WHERE type='table'")
tables = [r[0] for r in cur.fetchall()]
print("Tables:", tables)
for t in tables:
    cur.execute(f"PRAGMA table_info({t})")
    cols = cur.fetchall()
    print(f"\n  [{t}]")
    for c in cols:
        print(f"    {c[1]:30s} {c[2]}")

print("\n" + "=" * 60)
print("2. REPORT RECORDS")
print("=" * 60)
cur.execute("SELECT id, user_id, status, error_message, health_score, health_grade FROM reports LIMIT 10")
rows = cur.fetchall()
if rows:
    for r in rows:
        print(f"  id={r[0][:8]}.. user={r[1]} status={r[2]} score={r[4]} grade={r[5]}")
        if r[3]: print(f"    ERROR: {r[3][:200]}")
else:
    print("  No reports in database.")

print("\n" + "=" * 60)
print("3. USER RECORDS")
print("=" * 60)
cur.execute("SELECT id, email, is_active FROM users LIMIT 5")
for r in cur.fetchall():
    print(f"  id={r[0]} email={r[1]} active={r[2]}")

conn.close()

print("\n" + "=" * 60)
print("4. PYTHON PACKAGES")
print("=" * 60)
pkgs = ["pytesseract", "pdfplumber", "fitz", "PIL", "google.genai", "fastapi", "sqlalchemy"]
for pkg in pkgs:
    try:
        __import__(pkg.split(".")[0])
        print(f"  OK   {pkg}")
    except ImportError as e:
        print(f"  MISS {pkg}: {e}")

print("\n" + "=" * 60)
print("5. TESSERACT")
print("=" * 60)
import os
tess_path = r"C:\Program Files\Tesseract-OCR\tesseract.exe"
if os.path.exists(tess_path):
    result = subprocess.run([tess_path, "--version"], capture_output=True, text=True)
    print(f"  FOUND: {tess_path}")
    print(f"  Version: {result.stdout.strip() or result.stderr.strip()[:60]}")
else:
    print(f"  NOT FOUND at {tess_path}")

print("\n" + "=" * 60)
print("6. UPLOAD DIRECTORY")
print("=" * 60)
if os.path.exists("uploads"):
    files = os.listdir("uploads")
    print(f"  uploads/ exists — {len(files)} file(s)")
    for f in files[:5]:
        print(f"    {f}")
else:
    print("  uploads/ does NOT exist — will fail on write")

print("\n" + "=" * 60)
print("7. DASHBOARD API LIVE TEST")
print("=" * 60)
import urllib.request, json
try:
    req = urllib.request.Request("http://localhost:8000/api/v1/dashboard",
                                  headers={"Authorization": "Bearer INVALID"})
    urllib.request.urlopen(req)
except urllib.error.HTTPError as e:
    print(f"  Dashboard endpoint responds: HTTP {e.code} (auth required = good)")
except Exception as e:
    print(f"  Dashboard endpoint ERROR: {e}")
