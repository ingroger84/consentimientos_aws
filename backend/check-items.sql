-- Ver las facturas y sus items
SELECT 
  "invoiceNumber",
  items,
  jsonb_array_length(items) as items_count,
  amount,
  total
FROM invoices
ORDER BY "createdAt" DESC
LIMIT 5;
