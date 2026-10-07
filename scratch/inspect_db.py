import sqlite3

con = sqlite3.connect("backend/healthlens.db")
cur = con.cursor()
print("Report statuses:", cur.execute("SELECT status, count(*) FROM reports GROUP BY status").fetchall())
completed = cur.execute("SELECT id, user_id, original_filename, health_score, error_message FROM reports WHERE status='completed'").fetchall()
print(f"Completed reports count: {len(completed)}")
for r in completed[:5]:
    print(" ", r)

failed = cur.execute("SELECT id, user_id, original_filename, health_score, error_message FROM reports WHERE status='failed'").fetchall()
print(f"Failed reports count: {len(failed)}")
for r in failed[:5]:
    print(" ", r)

pending = cur.execute("SELECT id, user_id, original_filename, health_score, error_message FROM reports WHERE status='pending'").fetchall()
print(f"Pending reports count: {len(pending)}")
for r in pending[:5]:
    print(" ", r)
