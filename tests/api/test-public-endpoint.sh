#!/bin/bash

echo "========================================"
echo "TEST: Endpoint Público de Facturas"
echo "========================================"
echo ""

echo "Test 1: Obtener facturas pendientes"
echo "URL: http://localhost:3000/api/invoices/public/pending-by-slug"
echo ""

curl -X POST http://localhost:3000/api/invoices/public/pending-by-slug \
  -H "Content-Type: application/json" \
  -d '{"tenantSlug":"demo-medico"}' \
  | jq '.'

echo ""
echo ""
echo "========================================"
