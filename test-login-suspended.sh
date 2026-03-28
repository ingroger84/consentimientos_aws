#!/bin/bash

echo "========================================"
echo "TEST: Login con Tenant Suspendido"
echo "========================================"
echo ""

echo "Intentando login con tenant suspendido..."
echo "URL: http://localhost:3000/api/auth/login"
echo "Tenant: demo-medico"
echo ""

curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -H "X-Tenant-Slug: demo-medico" \
  -d '{"email":"proyectos@innovasystems.com.co","password":"Innova2024*"}' \
  -w "\n\nHTTP Status: %{http_code}\n" \
  | jq '.'

echo ""
echo "========================================"
