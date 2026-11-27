import re
from pathlib import Path

text = Path("lib/vehicle-catalog.ts").read_text(encoding="utf-8")
blocks = re.findall(r"name: '([^']+)',\s*models: \[(.*?)\],", text, re.S)
total = 0
for make, body in blocks:
    names = re.findall(r"name: '([^']+)'", body)
    total += len(names)
    print(f"{make}: {len(names)}")
print("TOTAL", total)
