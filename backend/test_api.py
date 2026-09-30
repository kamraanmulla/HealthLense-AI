"""Live API integration test."""
import urllib.request, json, urllib.error

BASE = "http://localhost:8000/api/v1"

print("=== 1. HEALTH CHECK ===")
try:
    r = urllib.request.urlopen("http://localhost:8000/health", timeout=5)
    print("  Health:", r.read().decode())
except Exception as e:
    print("  /health error:", e)

print()
print("=== 2. LOGIN ===")
token = ""
try:
    data = json.dumps({"email": "test@test.com", "password": "testpassword"}).encode()
    req = urllib.request.Request(
        f"{BASE}/auth/login", data=data,
        headers={"Content-Type": "application/json"}, method="POST"
    )
    r = urllib.request.urlopen(req, timeout=10)
    body = json.loads(r.read())
    token = body.get("access_token", "")
    print(f"  Login OK — token: {token[:20]}...")
except urllib.error.HTTPError as e:
    err_body = e.read().decode()[:200]
    print(f"  Login HTTPError {e.code}: {err_body}")
except Exception as e:
    print(f"  Login error: {e}")

if token:
    print()
    print("=== 3. DASHBOARD API ===")
    try:
        req = urllib.request.Request(
            f"{BASE}/dashboard",
            headers={"Authorization": f"Bearer {token}"}
        )
        r = urllib.request.urlopen(req, timeout=10)
        body = json.loads(r.read())
        score = body.get("health_score")
        total = body.get("stats", {}).get("total_reports", "?")
        timeline = len(body.get("health_timeline", []))
        print(f"  Dashboard OK  score={score}  total_reports={total}  timeline_pts={timeline}")
    except urllib.error.HTTPError as e:
        print(f"  Dashboard HTTPError {e.code}: {e.read().decode()[:300]}")
    except Exception as e:
        print(f"  Dashboard error: {e}")

    print()
    print("=== 4. REPORTS LIST ===")
    try:
        req = urllib.request.Request(
            f"{BASE}/reports/",
            headers={"Authorization": f"Bearer {token}"}
        )
        r = urllib.request.urlopen(req, timeout=10)
        body = json.loads(r.read())
        total = body.get("meta", {}).get("total", 0)
        print(f"  Reports OK  total={total}")
        if body.get("data"):
            for rpt in body["data"][:3]:
                print(f"    id={rpt['id'][:8]}.. status={rpt['status']} score={rpt.get('health_score')}")
    except urllib.error.HTTPError as e:
        print(f"  Reports HTTPError {e.code}: {e.read().decode()[:300]}")
    except Exception as e:
        print(f"  Reports error: {e}")
