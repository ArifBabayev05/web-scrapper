#!/bin/bash

# E-Social Bot API - Deployed API Test Script
# Deploy edildikdən sonra aşağıdakı URL-i dəyişdirin

# ⚠️ BU URL-İ ÖZ DEPLOYED API URL-İNİZLƏ DƏYİŞDİRİN
API_URL="https://e-social-bot-api.onrender.com"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m' # No Color

echo -e "${MAGENTA}"
echo "╔════════════════════════════════════════════════════════╗"
echo "║     E-SOCIAL BOT API - DEPLOYED API TEST SUITE       ║"
echo "╚════════════════════════════════════════════════════════╝"
echo -e "${NC}"
echo -e "${YELLOW}API URL: $API_URL${NC}\n"

# 1. Health Check
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}TEST 1: Health Check${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
response=$(curl -s -w "\n%{http_code}" "$API_URL/api/health")
http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | sed '$d')

if [ "$http_code" -eq 200 ]; then
    echo -e "${GREEN}✅ SUCCESS (HTTP $http_code)${NC}"
    echo "$body" | jq '.' 2>/dev/null || echo "$body"
else
    echo -e "${RED}❌ FAILED (HTTP $http_code)${NC}"
    echo "$body"
fi

# 2. Scrape Data - Real Test
echo -e "\n${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}TEST 2: Scrape Data (Real FIN & SV)${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
response=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/api/scrape" \
  -H "Content-Type: application/json" \
  -d '{"fin":"7EMHZ9L","sv":"AA3748461"}')
http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | sed '$d')

if [ "$http_code" -eq 200 ]; then
    echo -e "${GREEN}✅ SUCCESS (HTTP $http_code)${NC}"
    echo "$body" | jq '.' 2>/dev/null || echo "$body"
else
    echo -e "${RED}❌ FAILED (HTTP $http_code)${NC}"
    echo "$body" | jq '.' 2>/dev/null || echo "$body"
fi

# 3. Scrape Data - With AZE Prefix
echo -e "\n${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}TEST 3: Scrape Data (AZE Prefix Test)${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
response=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/api/scrape" \
  -H "Content-Type: application/json" \
  -d '{"fin":"7EMHZ9L","sv":"AZE3748461"}')
http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | sed '$d')

if [ "$http_code" -eq 200 ]; then
    echo -e "${GREEN}✅ SUCCESS (HTTP $http_code)${NC}"
    echo "$body" | jq '.' 2>/dev/null || echo "$body"
else
    echo -e "${RED}❌ FAILED (HTTP $http_code)${NC}"
    echo "$body" | jq '.' 2>/dev/null || echo "$body"
fi

# 4. Error Test - Missing FIN
echo -e "\n${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}TEST 4: Error Handling (Missing FIN)${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
response=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/api/scrape" \
  -H "Content-Type: application/json" \
  -d '{"sv":"AA3748461"}')
http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | sed '$d')

if [ "$http_code" -eq 400 ]; then
    echo -e "${GREEN}✅ EXPECTED ERROR (HTTP $http_code)${NC}"
    echo "$body" | jq '.' 2>/dev/null || echo "$body"
else
    echo -e "${YELLOW}⚠️ UNEXPECTED RESPONSE (HTTP $http_code)${NC}"
    echo "$body"
fi

# 5. Error Test - Missing SV
echo -e "\n${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}TEST 5: Error Handling (Missing SV)${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
response=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/api/scrape" \
  -H "Content-Type: application/json" \
  -d '{"fin":"7EMHZ9L"}')
http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | sed '$d')

if [ "$http_code" -eq 400 ]; then
    echo -e "${GREEN}✅ EXPECTED ERROR (HTTP $http_code)${NC}"
    echo "$body" | jq '.' 2>/dev/null || echo "$body"
else
    echo -e "${YELLOW}⚠️ UNEXPECTED RESPONSE (HTTP $http_code)${NC}"
    echo "$body"
fi

# 6. Performance Test
echo -e "\n${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}TEST 6: Performance Test (Response Time)${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
start_time=$(date +%s%N)
response=$(curl -s -w "\n%{http_code}" "$API_URL/api/health")
end_time=$(date +%s%N)
elapsed=$(( (end_time - start_time) / 1000000 ))
http_code=$(echo "$response" | tail -n1)

if [ "$http_code" -eq 200 ]; then
    echo -e "${GREEN}✅ Response Time: ${elapsed}ms${NC}"
else
    echo -e "${RED}❌ FAILED after ${elapsed}ms${NC}"
fi

echo -e "\n${MAGENTA}"
echo "╔════════════════════════════════════════════════════════╗"
echo "║              ALL TESTS COMPLETED                      ║"
echo "╚════════════════════════════════════════════════════════╝"
echo -e "${NC}"

echo -e "${YELLOW}📝 Notes:${NC}"
echo -e "   ${NC}- First request may be slow (cold start)${NC}"
echo -e "   ${NC}- Login required errors are normal for production${NC}"
echo -e "   ${NC}- Update API_URL variable at the top of this script${NC}"
