"""
Safe database migration script for HealthLens AI.
Adds missing columns without destroying existing data.
"""
import sqlite3
import sys

DB = "healthlens.db"
conn = sqlite3.connect(DB)
cur = conn.cursor()

def column_exists(table, column):
    cur.execute(f"PRAGMA table_info({table})")
    return any(row[1] == column for row in cur.fetchall())

migrations = [
    # reports table
    ("reports", "health_grade",     "ALTER TABLE reports ADD COLUMN health_grade VARCHAR(10)"),
    ("reports", "confidence_pct",   "ALTER TABLE reports ADD COLUMN confidence_pct INTEGER"),
    # report_parameters table
    ("report_parameters", "confidence_score", "ALTER TABLE report_parameters ADD COLUMN confidence_score FLOAT"),
]

print("Running HealthLens DB migrations...")
applied = 0
for table, col, sql in migrations:
    if not column_exists(table, col):
        try:
            cur.execute(sql)
            conn.commit()
            print(f"  ADDED  {table}.{col}")
            applied += 1
        except Exception as e:
            print(f"  ERROR  {table}.{col}: {e}")
            conn.rollback()
    else:
        print(f"  SKIP   {table}.{col} (already exists)")

print(f"\nDone. {applied} column(s) added.")

# Verify final schema
print("\nFinal schema:")
for table in ["reports", "report_parameters"]:
    cur.execute(f"PRAGMA table_info({table})")
    cols = [r[1] for r in cur.fetchall()]
    print(f"  [{table}]: {', '.join(cols)}")

conn.close()
