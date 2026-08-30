"""
MarketPulse AI — Automated Production Database Restore Utility
Usage: python scripts/restore_db.py [--file backups/marketpulse_db_backup_XXXXX.sqlite3.gz]
"""

import os
import shutil
import gzip
import argparse
from datetime import datetime

BACKUP_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "backups")
DB_FILE = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "marketpulse.db")


def restore_backup(backup_file: str = None):
    if not backup_file:
        # Find the latest backup
        if not os.path.exists(BACKUP_DIR):
            print(f"[!] Error: Backup directory {BACKUP_DIR} does not exist.")
            return

        backups = [
            os.path.join(BACKUP_DIR, f)
            for f in os.listdir(BACKUP_DIR)
            if f.startswith("marketpulse_db_backup_") and f.endswith(".sqlite3.gz")
        ]
        if not backups:
            print("[!] Error: No backup files found in backups directory.")
            return
        backup_file = max(backups, key=os.path.getmtime)

    if not os.path.exists(backup_file):
        print(f"[!] Error: Specified backup file {backup_file} not found.")
        return

    print(f"[*] Restoring database from: {backup_file}")

    # Safety: Back up existing current database before overwriting
    if os.path.exists(DB_FILE):
        safety_path = f"{DB_FILE}.pre_restore_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}"
        shutil.copyfile(DB_FILE, safety_path)
        print(f"[*] Safety snapshot of current database saved to: {safety_path}")

    # Decompress backup to DB_FILE
    with gzip.open(backup_file, 'rb') as f_in:
        with open(DB_FILE, 'wb') as f_out:
            shutil.copyfileobj(f_in, f_out)

    size_kb = os.path.getsize(DB_FILE) / 1024.0
    print(f"[+] Database restored successfully! ({size_kb:.2f} KB) - Restart your API server to apply.")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="MarketPulse AI DB Restore")
    parser.add_argument("--file", type=str, default=None, help="Path to specific .sqlite3.gz backup file")
    args = parser.parse_args()
    restore_backup(backup_file=args.file)
