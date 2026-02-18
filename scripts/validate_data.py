import json
from pathlib import Path
ROOT = Path(__file__).resolve().parents[1]

def load(name):
    return json.loads((ROOT/'data'/name).read_text(encoding='utf-8'))

g=load('grammar_topics.json')
v=load('vocab_entries.json')
c=load('chunk_entries.json')
q=load('question_bank.json')

assert len(g)>=14, 'grammar topics too small'
assert len(v)>=2500, 'vocab must be >=2500'
assert len(c)>=200, 'chunks must be >=200'
assert len(q)>=1500, 'question bank must be >=1500'
required={'id','type','grammarTopics','lessonId','difficulty','trapType','prompt','options','correctIndex','correctAnswer','explanation'}
for item in q[:100]:
    missing=required-set(item.keys())
    assert not missing,f'missing keys {missing}'
print('Validation passed:', len(g), len(v), len(c), len(q))
