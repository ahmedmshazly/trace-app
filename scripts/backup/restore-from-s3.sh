#!/usr/bin/env bash
# Restore a Trace mongodump archive from S3 into a *scratch* MongoDB URI.
# Never points at production by accident: requires RESTORE_MONGODB_URI and
# refuses if it equals MONGODB_URI (prod).
#
# Modes:
#   DRY_RUN=1  — list the chosen object and exit (default when unset? no — set DRY_RUN=1)
#   Without DRY_RUN — mongorestore --drop into RESTORE_MONGODB_URI
set -euo pipefail

BUCKET="${TRACE_BACKUP_BUCKET:-ahmdmshazly-trace-backups}"
PREFIX="${TRACE_BACKUP_PREFIX:-trace}"
REGION="${AWS_REGION:-eu-central-1}"
DRY_RUN="${DRY_RUN:-0}"

# Optional explicit key; otherwise pick latest under PREFIX/
OBJECT_KEY="${TRACE_BACKUP_OBJECT_KEY:-}"

if [[ -z "$OBJECT_KEY" ]]; then
  echo "listing s3://${BUCKET}/${PREFIX}/ …"
  OBJECT_KEY="$(aws s3api list-objects-v2 \
    --bucket "$BUCKET" \
    --prefix "${PREFIX}/" \
    --query 'sort_by(Contents,&LastModified)[-1].Key' \
    --output text \
    --region "$REGION")"
  if [[ -z "$OBJECT_KEY" || "$OBJECT_KEY" == "None" ]]; then
    echo "error: no objects under s3://${BUCKET}/${PREFIX}/" >&2
    exit 1
  fi
fi

echo "selected s3://${BUCKET}/${OBJECT_KEY}"

if [[ "$DRY_RUN" == "1" ]]; then
  aws s3api head-object --bucket "$BUCKET" --key "$OBJECT_KEY" --region "$REGION"
  echo "DRY_RUN=1 — not restoring"
  exit 0
fi

RESTORE_URI="${RESTORE_MONGODB_URI:?RESTORE_MONGODB_URI is required (scratch cluster)}"
PROD_URI="${MONGODB_URI:-}"

if [[ -n "$PROD_URI" && "$RESTORE_URI" == "$PROD_URI" ]]; then
  echo "error: REFUSING — RESTORE_MONGODB_URI equals MONGODB_URI (would overwrite prod)" >&2
  exit 1
fi

TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT
ARCHIVE="${TMP}/dump.archive.gz"

aws s3 cp "s3://${BUCKET}/${OBJECT_KEY}" "$ARCHIVE" --region "$REGION" --only-show-errors

echo "mongorestore --drop → scratch URI"
mongorestore --uri="$RESTORE_URI" --archive="$ARCHIVE" --gzip --drop

echo "OK restored into scratch. Verify counts, then cut over MONGODB_URI only if intentional."
