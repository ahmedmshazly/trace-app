#!/usr/bin/env bash
#
# Trace API smoke / acceptance test.
#
# Exercises the full feature-001 surface against a RUNNING server:
#   health · register/login/me/logout · entry create/timeline/pagination/
#   patch/backdate/delete/restore · cross-user isolation · error envelopes ·
#   auth rate limiting.
#
# Usage:
#   BASE_URL=http://localhost:4000/api ./scripts/smoke-api.sh
#
# Notes:
#   - Requires `curl` and `jq`.
#   - The rate-limit check is LAST because it intentionally trips the limiter
#     (RATE_LIMIT_MAX). Restart the server to reset the limiter before re-running.
#   - Uses a unique email per run, so it is safe against a persistent database.
set -euo pipefail

BASE_URL="${BASE_URL:-http://localhost:4000/api}"
STAMP="$(date +%s)"
EMAIL_A="alice+${STAMP}@example.com"
EMAIL_B="bob+${STAMP}@example.com"
PASSWORD="correct horse battery staple"

pass=0
fail=0
ok()   { printf '  \033[32mPASS\033[0m %s\n' "$1"; pass=$((pass + 1)); }
bad()  { printf '  \033[31mFAIL\033[0m %s\n' "$1"; fail=$((fail + 1)); }
note() { printf '\n\033[1m%s\033[0m\n' "$1"; }

# req METHOD PATH [DATA] [AUTH_TOKEN] -> writes body to $BODY, status to $CODE
req() {
  local method="$1" path="$2" data="${3:-}" token="${4:-}"
  local args=(-s -o /tmp/trace_body -w '%{http_code}' -X "$method" "${BASE_URL}${path}")
  [ -n "$data" ]  && args+=(-H 'content-type: application/json' -d "$data")
  [ -n "$token" ] && args+=(-H "authorization: Bearer ${token}")
  CODE="$(curl "${args[@]}")"
  BODY="$(cat /tmp/trace_body)"
}

expect_code() { # expect_code EXPECTED LABEL
  if [ "$CODE" = "$1" ]; then ok "$2 (HTTP $CODE)"; else bad "$2 (expected $1, got $CODE) :: $BODY"; fi
}

echo "Trace API smoke test → ${BASE_URL}"

note "Health"
req GET /health
expect_code 200 "GET /health"
[ "$(echo "$BODY" | jq -r .status)" = "ok" ] && ok "status=ok" || bad "status!=ok :: $BODY"
[ "$(echo "$BODY" | jq -r .db)" = "connected" ] && ok "db=connected" || bad "db!=connected :: $BODY"

note "Auth: register / login / me / logout"
req POST /auth/register "{\"email\":\"${EMAIL_A}\",\"password\":\"${PASSWORD}\"}"
expect_code 201 "register A"
TOKEN_A="$(echo "$BODY" | jq -r .token)"
[ -n "$TOKEN_A" ] && [ "$TOKEN_A" != "null" ] && ok "received token A" || bad "no token A :: $BODY"

req POST /auth/register "{\"email\":\"${EMAIL_A}\",\"password\":\"${PASSWORD}\"}"
expect_code 409 "duplicate email rejected"
[ "$(echo "$BODY" | jq -r .error.code)" = "EMAIL_IN_USE" ] && ok "code=EMAIL_IN_USE" || bad "wrong code :: $BODY"

req POST /auth/login "{\"email\":\"${EMAIL_A}\",\"password\":\"${PASSWORD}\"}"
expect_code 200 "login A"

req POST /auth/login "{\"email\":\"${EMAIL_A}\",\"password\":\"wrong-password\"}"
expect_code 401 "bad password rejected"
[ "$(echo "$BODY" | jq -r .error.code)" = "INVALID_CREDENTIALS" ] && ok "code=INVALID_CREDENTIALS" || bad "wrong code :: $BODY"

req GET /auth/me "" "$TOKEN_A"
expect_code 200 "GET /auth/me"
[ "$(echo "$BODY" | jq -r .email)" = "$EMAIL_A" ] && ok "me.email matches" || bad "me.email mismatch :: $BODY"

req GET /auth/me
expect_code 401 "GET /auth/me without token"
[ "$(echo "$BODY" | jq -r .error.code)" = "UNAUTHORIZED" ] && ok "code=UNAUTHORIZED" || bad "wrong code :: $BODY"

note "Capture: create entries"
req POST /entries "{\"body\":\"finished the OPNsense base config #network\"}" "$TOKEN_A"
expect_code 201 "create entry 1"
ENTRY_ID="$(echo "$BODY" | jq -r .id)"
CREATED_AT="$(echo "$BODY" | jq -r .createdAt)"
[ -n "$ENTRY_ID" ] && [ "$ENTRY_ID" != "null" ] && ok "entry has id" || bad "no id :: $BODY"

req POST /entries "{\"body\":\"second moment #journal\"}" "$TOKEN_A"
expect_code 201 "create entry 2"

req POST /entries "{\"body\":\"\"}" "$TOKEN_A"
expect_code 422 "empty body rejected"
[ "$(echo "$BODY" | jq -r .error.code)" = "VALIDATION_ERROR" ] && ok "code=VALIDATION_ERROR" || bad "wrong code :: $BODY"

note "Timeline: list & pagination"
req GET /entries "" "$TOKEN_A"
expect_code 200 "GET /entries"
COUNT="$(echo "$BODY" | jq '.items | length')"
[ "$COUNT" = "2" ] && ok "timeline has 2 items" || bad "expected 2 items, got $COUNT :: $BODY"

req GET "/entries?limit=1" "" "$TOKEN_A"
expect_code 200 "GET /entries?limit=1"
NEXT="$(echo "$BODY" | jq -r .nextCursor)"
[ "$NEXT" != "null" ] && [ -n "$NEXT" ] && ok "nextCursor present" || bad "no nextCursor :: $BODY"
req GET "/entries?limit=1&cursor=${NEXT}" "" "$TOKEN_A"
expect_code 200 "GET /entries page 2 (cursor)"
[ "$(echo "$BODY" | jq '.items | length')" = "1" ] && ok "page 2 returns 1 item" || bad "page 2 size wrong :: $BODY"

note "Curation: edit / backdate / delete / restore"
req PATCH "/entries/${ENTRY_ID}" "{\"body\":\"edited body #network\"}" "$TOKEN_A"
expect_code 200 "PATCH body"
[ "$(echo "$BODY" | jq -r .body)" = "edited body #network" ] && ok "body updated" || bad "body not updated :: $BODY"
[ "$(echo "$BODY" | jq -r .createdAt)" = "$CREATED_AT" ] && ok "createdAt immutable" || bad "createdAt changed! :: $BODY"

req PATCH "/entries/${ENTRY_ID}" "{\"occurredAt\":\"2020-01-01T00:00:00.000Z\"}" "$TOKEN_A"
expect_code 200 "PATCH backdate occurredAt"
[ "$(echo "$BODY" | jq -r .occurredAt)" = "2020-01-01T00:00:00.000Z" ] && ok "occurredAt backdated" || bad "backdate failed :: $BODY"

req DELETE "/entries/${ENTRY_ID}" "" "$TOKEN_A"
expect_code 204 "DELETE (soft) entry"
req GET /entries "" "$TOKEN_A"
[ "$(echo "$BODY" | jq '.items | length')" = "1" ] && ok "deleted entry hidden from timeline" || bad "soft-delete not hidden :: $BODY"
req GET "/entries?includeDeleted=true" "" "$TOKEN_A"
[ "$(echo "$BODY" | jq '.items | length')" = "2" ] && ok "includeDeleted shows it" || bad "includeDeleted wrong :: $BODY"

req POST "/entries/${ENTRY_ID}/restore" "" "$TOKEN_A"
expect_code 200 "POST restore"
[ "$(echo "$BODY" | jq -r .deleted)" = "false" ] && ok "entry restored (deleted=false)" || bad "restore failed :: $BODY"

req GET "/entries/000000000000000000000000" "" "$TOKEN_A" || true
req DELETE "/entries/000000000000000000000000" "" "$TOKEN_A"
expect_code 404 "unknown entry id → 404"

note "Isolation: user B must never see/touch A's data"
req POST /auth/register "{\"email\":\"${EMAIL_B}\",\"password\":\"${PASSWORD}\"}"
expect_code 201 "register B"
TOKEN_B="$(echo "$BODY" | jq -r .token)"
req GET /entries "" "$TOKEN_B"
[ "$(echo "$BODY" | jq '.items | length')" = "0" ] && ok "B sees zero entries" || bad "B sees A's entries! :: $BODY"
req PATCH "/entries/${ENTRY_ID}" "{\"body\":\"hijack\"}" "$TOKEN_B"
expect_code 404 "B cannot PATCH A's entry (404, existence hidden)"
req DELETE "/entries/${ENTRY_ID}" "" "$TOKEN_B"
expect_code 404 "B cannot DELETE A's entry (404)"

note "Rate limiting on the auth endpoint (this trips the limiter, so run it last)"
limited="no"
for i in $(seq 1 15); do
  req POST /auth/login "{\"email\":\"nobody+${STAMP}@example.com\",\"password\":\"x\"}"
  if [ "$CODE" = "429" ]; then limited="yes"; break; fi
done
[ "$limited" = "yes" ] && ok "received 429 RATE_LIMITED after burst" || bad "limiter never tripped"
[ "$(echo "$BODY" | jq -r .error.code 2>/dev/null)" = "RATE_LIMITED" ] && ok "code=RATE_LIMITED" || true

note "Summary"
printf '  passed: %d   failed: %d\n' "$pass" "$fail"
[ "$fail" -eq 0 ] || exit 1
