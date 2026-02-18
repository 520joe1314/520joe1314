import json, re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
INPUT = ROOT / 'study_guides'
OUT = ROOT / 'data' / 'ingested_summary.json'

patterns = {
    'grammar': re.compile(r'(pass[ée] compos[ée]|imparfait|subjonctif|pronom|n[ée]gation|question|imp[ée]ratif|conditionnel|futur)', re.I),
    'vocab': re.compile(r'\b[a-zA-ZÀ-ÿ][a-zA-ZÀ-ÿ\'’-]{2,}\b')
}

def clean(text):
    return re.sub(r'\s+', ' ', text)

summary = {
    'sourceFiles': [],
    'grammarHits': {},
    'topWords': [],
    'chunks': []
}

word_freq = {}
for path in sorted(INPUT.glob('*')):
    if path.suffix.lower() not in {'.txt', '.md', '.html', '.htm'}:
        continue
    text = clean(path.read_text(encoding='utf-8', errors='ignore'))
    summary['sourceFiles'].append(path.name)
    for hit in patterns['grammar'].findall(text):
        k = hit.lower()
        summary['grammarHits'][k] = summary['grammarHits'].get(k, 0) + 1
    words = [w.lower() for w in patterns['vocab'].findall(text)]
    for w in words:
        if len(w) < 4:
            continue
        word_freq[w] = word_freq.get(w, 0) + 1
    pieces = re.split(r'[.!?]', text)
    for p in pieces:
        p = p.strip()
        if 25 <= len(p) <= 120 and any(k in p.lower() for k in ['que', 'de', 'à', 'est-ce']):
            summary['chunks'].append(p)

summary['topWords'] = sorted(word_freq.items(), key=lambda x: x[1], reverse=True)[:300]
summary['chunks'] = summary['chunks'][:300]
OUT.write_text(json.dumps(summary, ensure_ascii=False, indent=2), encoding='utf-8')
print(f'Ingested {len(summary["sourceFiles"])} files -> {OUT}')
