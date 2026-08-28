#!/usr/bin/env bash
# Dump Trace MongoDB to an S3 archive (off-box second copy).
# Expects: MONGODB_URI, AWS credentials (OIDC or local profile), AWS_REGION,
#          TRACE_BACKUP_BUCKET (default: ahmdmshazly-trace-backups).
set -euo pipefail

BUCKET="${TRACE_BACKUP_BUCKET:-ahmdmshazly-trace-backups}"
PREFIX="${TRACE_BACKUP_PREFIX:-trace}"
REGION="${AWS_REGION:-eu-central-1}"
URI="${MONGODB_URI:?MONGODB_URI is required}"

STAMP="$(date -u +%Y/%m/%d)"
OBJECT_KEY="${PREFIX}/${STAMP}/dump.archive.gz"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

ARCHIVE="${TMP}/dump.archive.gz"

echo "mongodump → ${ARCHIVE}"
mongodump --uri="$URI" --archive="$ARCHIVE" --gzip

BYTES="$(wc -c <"$ARCHIVE" | tr -d ' ')"
if [[ "$BYTES" -lt 64 ]]; then
  echo "error: archive too small (${BYTES} bytes), refusing upload" >&2
  exit 1
fi

echo "aws s3 cp → s3://${BUCKET}/${OBJECT_KEY} (${BYTES} bytes)"
aws s3 cp "$ARCHIVE" "s3://${BUCKET}/${OBJECT_KEY}" --region "$REGION" \
  --only-show-errors

echo "OK s3://${BUCKET}/${OBJECT_KEY}"
