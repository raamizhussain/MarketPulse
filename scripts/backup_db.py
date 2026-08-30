"""
MarketPulse AI — Automated Production Database Backup Utility (Local & AWS S3 / Cloudflare R2)
Usage: python scripts/backup_db.py [--retention-days 7]
"""

import os
import shutil
import gzip
import argparse
from datetime import datetime

BACKUP_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "backups")
DB_FILE = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "marketpulse.db")
AWS_S3_BUCKET = os.getenv("AWS_S3_BUCKET", "")


def upload_to_s3(file_path: str, key_name: str):
    """Uploads backup archive to AWS S3 if boto3 and bucket are configured."""
    if not AWS_S3_BUCKET:
        return
    try:
        import boto3
        s3 = boto3.client('s3')
        s3.upload_file(file_path, AWS_S3_BUCKET, f"backups/{key_name}")
        print(f"[+] Successfully mirrored backup to AWS S3: s3://{AWS_S3_BUCKET}/backups/{key_name}")
    except ImportError:
        print("[!] Note: boto3 not installed, skipping AWS S3 cloud mirror upload.")
    except Exception as e:
        print(f"[!] Warning: AWS S3 upload failed: {e}")


def create_backup(retention_days: int = 7):
    os.makedirs(BACKUP_DIR, exist_ok=True)
    timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
    backup_filename = f"marketpulse_db_backup_{timestamp}.sqlite3.gz"
    backup_path = os.path.join(BACKUP_DIR, backup_filename)

    if not os.path.exists(DB_FILE):
        print(f"[!] Warning: Source database file {DB_FILE} does not exist yet.")
        return

    print(f"[*] Starting MarketPulse database backup at {timestamp} UTC...")
    
    # Read and gzip database
    with open(DB_FILE, 'rb') as f_in:
        with gzip.open(backup_path, 'wb') as f_out:
            shutil.copyfileobj(f_in, f_out)

    size_kb = os.path.getsize(backup_path) / 1024.0
    print(f"[+] Local backup created: {backup_path} ({size_kb:.2f} KB)")

    # Optional AWS S3 Mirror
    upload_to_s3(backup_path, backup_filename)

    # Clean up old local backups older than retention_days
    now = datetime.utcnow().timestamp()
    deleted_count = 0
    for fname in os.listdir(BACKUP_DIR):
        fpath = os.path.join(BACKUP_DIR, fname)
        if os.path.isfile(fpath) and fname.startswith("marketpulse_db_backup_"):
            file_age_days = (now - os.path.getmtime(fpath)) / (24 * 3600)
            if file_age_days > retention_days:
                os.remove(fpath)
                deleted_count += 1

    if deleted_count > 0:
        print(f"[*] Cleaned up {deleted_count} local backup files older than {retention_days} days.")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="MarketPulse AI DB Backup")
    parser.add_argument("--retention-days", type=int, default=7, help="Days of backups to keep")
    args = parser.parse_args()
    create_backup(retention_days=args.retention_days)
