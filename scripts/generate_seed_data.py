import json, random
from pathlib import Path
random.seed(42)

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / 'data'
DATA.mkdir(exist_ok=True)

lessons = [
    {"id":"L1","name":"Leçon 1","theme":"feelings-health-routine"},
    {"id":"L2","name":"Leçon 2","theme":"city-housing-transport"},
    {"id":"L3","name":"Leçon 3","theme":"media-tech-opinion"},
    {"id":"L4","name":"Leçon 4","theme":"values-persuasion"},
    {"id":"L5","name":"Leçon 5","theme":"social-change-comparison"},
    {"id":"L6","name":"Leçon 6","theme":"volunteering-advice"},
    {"id":"L7","name":"Leçon 7","theme":"science-progress"},
    {"id":"L8","name":"Leçon 8","theme":"travel-leisure"},
    {"id":"ESS","name":"Contest Essentials","theme":"high-frequency"}
]

grammar_topics = [
    ("question_forms","Question Forms","intonation / est-ce que / inversion"),
    ("passe_compose","Passé Composé","avoir vs être, agreement, reflexive"),
    ("imparfait_vs_pc","Imparfait vs Passé Composé","background vs completed action"),
    ("futur_conditional","Futur / Conditionnel","futur proche, futur simple, voudrais/pourrais"),
    ("passe_recent","Passé Récent","venir de + infinitif"),
    ("pronouns","Pronouns","COD/COI/y/en and order"),
    ("negation","Negation","ne…pas/jamais/plus/rien/personne/que"),
    ("prepositions_time","Prepositions + Time","à/de/en/chez + depuis/pendant/il y a"),
    ("articles","Articles + Partitives","du/de la/des/de after negation"),
    ("imperative","Imperative + Pronouns","Lève-toi / Donne-le-moi"),
    ("subjunctive","Subjunctive Survival","il faut que / pour que / bien que"),
    ("cest_ilest_demo","c’est vs il est + demonstratives","ce/cet/cette/ces/celui"),
    ("comparisons","Comparisons","plus/moins/aussi, meilleur/mieux"),
    ("relative_pronouns","Relative Pronouns","qui/que/où/dont"),
    ("accent_traps","Accent Traps","où/ou, là/la/l’a, a/à")
]

with open(DATA/'grammar_topics.json','w',encoding='utf-8') as f:
    json.dump([
        {
            "id":tid,
            "name":name,
            "quickRule":rule,
            "triggers":["depuis","il faut que","ne…jamais","est-ce que","y/en","où/ou"],
            "lessonIds":["ESS"],
            "difficulty":"mixed"
        } for tid,name,rule in grammar_topics
    ],f,ensure_ascii=False,indent=2)

function_words = ["de","à","que","qui","dont","mais","donc","pourtant","pendant","depuis","il y a","chez","en","dans","sur","sous","avec","sans","si","quand","où","ou","là","a","à","comme","puisque","car","afin que","bien que","avant que","après","pendant que","tandis que","parce que","alors","ensuite","d'abord","enfin"]

base_vocab = [
("être","verb","is/are"),("avoir","verb","to have"),("aller","verb","to go"),("faire","verb","to do/make"),("vouloir","verb","to want"),("pouvoir","verb","can"),("devoir","verb","must"),("venir","verb","to come"),
("prendre","verb","to take"),("mettre","verb","to put"),("voir","verb","to see"),("savoir","verb","to know"),("dire","verb","to say"),("écrire","verb","to write"),("lire","verb","to read"),
("la santé","noun","health"),("la ville","noun","city"),("le logement","noun","housing"),("la pollution","noun","pollution"),("les médias","noun","media"),("la confiance","noun","trust"),
("la comparaison","noun","comparison"),("le bénévolat","noun","volunteering"),("l'invention","noun","invention"),("les vacances","noun","vacation"),("la gare","noun","train station"),("la plage","noun","beach")
]

vocab_entries=[]
vid=1
for l in lessons:
    for i in range(320):
        lemma = f"{l['theme'].split('-')[0]}_mot_{i+1}"
        vocab_entries.append({
            "id": f"v{vid}",
            "word": lemma,
            "partOfSpeech": random.choice(["noun","verb","adj","adv","connector"]),
            "definitionEn": f"High-frequency recognition item {i+1} for {l['name']}",
            "lessonId": l['id'],
            "theme": l['theme'],
            "frequencyBand": random.choice(["A","B","C"]),
            "commonCollocation": f"utiliser {lemma} en contexte",
            "typicalPreposition": random.choice(["à","de","en","avec","pour",""]),
            "exampleChunk": f"Je dois {lemma} pendant le concours.",
            "tags": [l['theme'],"recognition"]
        })
        vid+=1

for word,pos,meaning in base_vocab:
    vocab_entries.append({
        "id": f"v{vid}","word":word,"partOfSpeech":pos,"definitionEn":meaning,
        "lessonId":"ESS","theme":"high-frequency","frequencyBand":"A",
        "commonCollocation":f"{word} en contexte","typicalPreposition":"",
        "exampleChunk":f"On doit comprendre « {word} » dans la phrase.","tags":["essential"]
    })
    vid+=1

for i,w in enumerate(function_words,1):
    vocab_entries.append({
        "id": f"v{vid}","word":w,"partOfSpeech":"function-word","definitionEn":"connector/function word",
        "lessonId":"ESS","theme":"function-words","frequencyBand":"A","commonCollocation":f"{w} + chunk",
        "typicalPreposition":"","exampleChunk":f"Je révise {w} avec une phrase utile.","tags":["function-word","glue"]
    })
    vid+=1

with open(DATA/'vocab_entries.json','w',encoding='utf-8') as f:
    json.dump(vocab_entries,f,ensure_ascii=False,indent=2)

chunk_starters=[
"Il faut que je","Je viens de","Je suis en train de","J’en ai marre de","Ça dépend de","Je me rends compte que","Est-ce que tu","Où est-ce que","Je n’ai plus de","Nous avons besoin de",
"Tu pourrais","Je voudrais","Il y a","Depuis deux ans","Pendant les vacances","Donne-le-moi","Ne me le donne pas","Je lui en parle","Tu y vas","On en revient"
]
chunks=[]
for i in range(220):
    starter = chunk_starters[i % len(chunk_starters)]
    chunks.append({
        "id":f"c{i+1}",
        "text":f"{starter} exemple {i+1}.",
        "grammarTopics":[grammar_topics[i % len(grammar_topics)][0]],
        "lessonIds":[lessons[i % len(lessons)]["id"]],
        "translation":f"Chunk translation {i+1}",
        "triggerWords":[random.choice(["depuis","hier","demain","ne…jamais","où","là","à","de"])],
        "difficulty":random.choice(["easy","medium","hard"])
    })
with open(DATA/'chunk_entries.json','w',encoding='utf-8') as f:
    json.dump(chunks,f,ensure_ascii=False,indent=2)

qt_types=[
"mcq_form","fill_blank","pronoun_replace","pronoun_order","tense_choice","negation","article","question_word","listening_mcq","reading_mcq","speed_round","error_spot"
]
qbank=[]
for i in range(1600):
    qtype = qt_types[i % len(qt_types)]
    topic = grammar_topics[i % len(grammar_topics)][0]
    lesson = lessons[i % len(lessons)]["id"]
    stem = f"[{qtype}] Choisis la meilleure option en contexte ({i+1})."
    options=["Option A","Option B","Option C","Option D"]
    correct = random.randint(0,3)
    trigger = random.choice(["depuis","hier","demain","ne…rien","où","là","a/à","est-ce que","pour que"])
    qbank.append({
        "id":f"q{i+1}",
        "type":qtype,
        "mode":random.choice(["daily","grammar_arcade","vocab_quest","listening_lab","reading_runner","mock_exam","boss_battle"]),
        "lessonId":lesson,
        "theme":lessons[i % len(lessons)]["theme"],
        "grammarTopics":[topic],
        "difficulty":random.choice(["easy","medium","hard"]),
        "trapType":random.choice(["pronoun-order","tense-clash","negation-trap","article-trap","question-word-trap","accent-trap",""]),
        "prompt":stem,
        "sentence":f"Phrase modèle {i+1} avec {trigger}.",
        "audioText":f"Écoute la phrase {i+1}.",
        "options":options,
        "correctIndex":correct,
        "correctAnswer":options[correct],
        "explanation":f"Indice: le déclencheur est « {trigger} ».",
        "triggerWords":[trigger],
        "vocabRefs":[f"v{random.randint(1,len(vocab_entries))}"],
        "chunkRef":f"c{random.randint(1,len(chunks))}"
    })
with open(DATA/'question_bank.json','w',encoding='utf-8') as f:
    json.dump(qbank,f,ensure_ascii=False)

print('Generated:', len(vocab_entries), 'vocab,', len(chunks), 'chunks,', len(qbank), 'questions')
