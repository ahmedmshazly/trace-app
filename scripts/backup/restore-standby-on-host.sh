#!/usr/bin/env bash
# Run ON the Trace Mongo standby EC2 host (via SSM Run Command).
# Pulls the latest mongodump archive from S3 and restores into local Docker Mongo.
set -euo pipefail

BUCKET="${TRACE_BACKUP_BUCKET:-ahmdmshazly-trace-backups}"
PREFIX="${TRACE_BACKUP_PREFIX:-trace}"
REGION="${AWS_REGION:-eu-central-1}"
ENV_FILE="${TRACE_MONGO_ENV:-/root/trace-mongo.env}"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "error: missing $ENV_FILE (user-data not finished?)" >&2
  exit 1
fi
# shellcheck disable=SC1090
source "$ENV_FILE"
: "${MONGODB_URI:?MONGODB_URI missing in $ENV_FILE}"

if ! docker ps --format '{{.Names}}' | grep -qx trace-mongo; then
  echo "error: docker container trace-mongo is not running" >&2
  exit 1
fi

TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT
ARCHIVE="${TMP}/dump.archive.gz"

OBJECT_KEY="$(aws s3api list-objects-v2 \
  --bucket "$BUCKET" \
  --prefix "${PREFIX}/" \
  --region "$REGION" \
  --query 'sort_by(Contents,&LastModified)[-1].Key' \
  --output text)"

if [[ -z "$OBJECT_KEY" || "$OBJECT_KEY" == "None" ]]; then
  echo "error: no objects under s3://${BUCKET}/${PREFIX}/" >&2
  exit 1
fi

echo "selected s3://${BUCKET}/${OBJECT_KEY}"
aws s3 cp "s3://${BUCKET}/${OBJECT_KEY}" "$ARCHIVE" --region "$REGION" --only-show-errors

BYTES="$(wc -c <"$ARCHIVE" | tr -d ' ')"
if [[ "$BYTES" -lt 64 ]]; then
  echo "error: archive too small (${BYTES} bytes)" >&2
  exit 1
fi

echo "mongorestore --drop → local Docker Mongo (${BYTES} bytes)"
mongorestore --uri="$MONGODB_URI" --archive="$ARCHIVE" --gzip --drop

# Spot-check
docker exec trace-mongo mongosh "$MONGODB_URI" --quiet --eval \
  'const c=db.getSiblingDB("trace").getCollectionNames(); print("collections="+c.length); printjson(c)'

echo "OK standby restored from s3://${BUCKET}/${OBJECT_KEY}"
