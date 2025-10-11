#!/bin/bash
echo "================================"
echo "  Running in MOCK MODE"
echo "  No TU API Key required"
echo "================================"
echo ""
cd backend
./mvnw spring-boot:run -Dspring-boot.run.profiles=test
