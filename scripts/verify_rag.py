import urllib.request
import json

payload = json.dumps({
    "query": "defective refrigerator e-commerce refund refusal",
    "top_k": 3
}).encode("utf-8")

req = urllib.request.Request(
    "http://127.0.0.1:8000/api/v1/rag/query",
    data=payload,
    headers={"Content-Type": "application/json"}
)

try:
    with urllib.request.urlopen(req) as resp:
        data = json.loads(resp.read().decode("utf-8"))
        print(f"Status: {resp.status}")
        print(f"Retrieved: {data.get('retrieved_count')}")
        for r in data.get("results", []):
            print(f" - [{r.get('guideline_code')}] {r.get('title')} ({int(r.get('similarity_score', 0)*100)}%)")
except Exception as e:
    print(f"Error: {e}")
