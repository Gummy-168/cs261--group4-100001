#!/bin/bash
echo "================================"
echo "  Running in PRODUCTION MODE"
echo "  Using REAL TU API"
echo "================================"
echo ""
read -p "Enter TU API Key: " API_KEY
export TU_API_KEY=$API_KEY
cd backend
./mvnw spring-boot:run
