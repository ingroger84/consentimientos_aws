#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import re

# Leer el archivo
with open('src/mail/mail.service.ts', 'r', encoding='utf-8') as f:
    content = f.read()

print("Corrigiendo caracteres especiales...")

# Reemplazar el emoji mal codificado con código HTML
# Buscar cualquier variante del emoji mal codificado
patterns = [
    (r'ðŸ"„', '&#128196;'),  # 📄
    (r'<h1>[^<]*Nueva Factura</h1>', '<h1>&#128196; Nueva Factura</h1>'),
]

for pattern, replacement in patterns:
    if re.search(pattern, content):
        print(f"✓ Encontrado patrón: {pattern}")
        content = re.sub(pattern, replacement, content)
        print(f"✓ Reemplazado con: {replacement}")

# Guardar el archivo
with open('src/mail/mail.service.ts', 'w', encoding='utf-8') as f:
    f.write(content)

print("\n✅ Archivo corregido!")
print("Reinicia el backend para aplicar los cambios")
