#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${BOOK_REVIEW_API_URL:-http://localhost:5000}"
EVIDENCE_DIR="${EVIDENCE_DIR:-./evidence}"
mkdir -p "$EVIDENCE_DIR"

capture() {
  local name="$1"; shift
  {
    printf '$'
    printf ' %q' "$@"
    printf '\n\n'
    "$@"
    printf '\n'
  } 2>&1 | tee "$EVIDENCE_DIR/$name"
}

capture getallbooks curl -sS "$BASE_URL/"
capture getbooksbyISBN curl -sS "$BASE_URL/isbn/1"
capture getbooksbyauthor curl -sS "$BASE_URL/author/Chinua%20Achebe"
capture getbooksbytitle curl -sS "$BASE_URL/title/Things%20Fall%20Apart"
capture getbookreview curl -sS "$BASE_URL/review/1"

USERNAME="bookreview_user_$(date +%s)"
PASSWORD="LabPass_$(date +%s)_ChangeMe"
COOKIE_JAR="$EVIDENCE_DIR/.evidence-cookies"

capture register curl -sS -X POST "$BASE_URL/register" \
  -H 'Content-Type: application/json' \
  -d "{\"username\":\"$USERNAME\",\"password\":\"$PASSWORD\"}"

{
  printf '$ curl -sS -c %q -b %q -X POST %q -H %q -d %q\n\n' "$COOKIE_JAR" "$COOKIE_JAR" "$BASE_URL/customer/login" 'Content-Type: application/json' "{\"username\":\"$USERNAME\",\"password\":\"$PASSWORD\"}"
  curl -sS -c "$COOKIE_JAR" -b "$COOKIE_JAR" -X POST "$BASE_URL/customer/login" \
    -H 'Content-Type: application/json' \
    -d "{\"username\":\"$USERNAME\",\"password\":\"$PASSWORD\"}"
  printf '\n'
} 2>&1 | tee "$EVIDENCE_DIR/login"

{
  printf '$ curl -sS -b %q -X PUT %q\n\n' "$COOKIE_JAR" "$BASE_URL/customer/auth/review/1?review=Helpful%20starter%20review"
  curl -sS -b "$COOKIE_JAR" -X PUT "$BASE_URL/customer/auth/review/1?review=Helpful%20starter%20review"
  printf '\n'
} 2>&1 | tee "$EVIDENCE_DIR/reviewadded"

{
  printf '$ curl -sS -b %q -X DELETE %q\n\n' "$COOKIE_JAR" "$BASE_URL/customer/auth/review/1"
  curl -sS -b "$COOKIE_JAR" -X DELETE "$BASE_URL/customer/auth/review/1"
  printf '\n'
} 2>&1 | tee "$EVIDENCE_DIR/deletereview"

rm -f "$COOKIE_JAR"
printf '\nEvidence saved to %s\n' "$EVIDENCE_DIR"
printf 'Use your own fork URL and GitHub API response for the githubrepo item.\n'
