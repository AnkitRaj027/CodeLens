import json
import logging
from typing import Dict, Any, Optional
import httpx
from app.core.config import settings
from app.schemas.ai import AIExplainRequest, AIExplainResponse, OptimizedAlternative

logger = logging.getLogger(__name__)


class AIService:
    @staticmethod
    async def generate_explanation(request: AIExplainRequest) -> AIExplainResponse:
        # Check if Mistral, NVIDIA, Gemini, or OpenAI API key is configured
        if settings.MISTRAL_API_KEY:
            try:
                return await AIService._call_mistral(request)
            except Exception as e:
                logger.warning(f"Mistral API call failed, falling back to grounded rule engine: {e}")
        elif settings.NVIDIA_API_KEY:
            try:
                return await AIService._call_nvidia(request)
            except Exception as e:
                logger.warning(f"NVIDIA API call failed, falling back to grounded rule engine: {e}")
        elif settings.GEMINI_API_KEY:
            try:
                return await AIService._call_gemini(request)
            except Exception as e:
                logger.warning(f"Gemini API call failed, falling back to grounded rule engine: {e}")
        elif settings.OPENAI_API_KEY:
            try:
                return await AIService._call_openai(request)
            except Exception as e:
                logger.warning(f"OpenAI API call failed, falling back to grounded rule engine: {e}")

        # High-precision Grounded Rule-Based Generator (Zero API Key needed)
        return AIService._generate_deterministic_explanation(request)

    @staticmethod
    async def _call_mistral(request: AIExplainRequest) -> AIExplainResponse:
        url = "https://api.mistral.ai/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {settings.MISTRAL_API_KEY}",
            "Content-Type": "application/json"
        }
        
        system_prompt = f"""You are the CodeLens AI DSA Tutor.
CRITICAL CONSTRAINT: You MUST accept the following verified static analysis complexity as ABSOLUTE GROUND TRUTH:
Time Complexity: {request.time_complexity}
Space Complexity: {request.space_complexity}
Confidence: {request.confidence}

Do NOT contradict these complexities. Explain WHY this exact complexity occurs.
Mode: {request.mode} (options: beginner, intermediate, advanced, dsa_student).

Respond ONLY with valid JSON matching this exact schema:
{{
  "explanation_mode": "{request.mode}",
  "summary": "Concise summary",
  "step_by_step_reasoning": ["Step 1", "Step 2", "Step 3"],
  "why_this_complexity": "Detailed structural proof",
  "what_happens_if_n_doubles": "Detailed scaling impact",
  "optimization": {{
    "has_optimization": true,
    "optimized_code": "code snippet or null",
    "optimized_time_complexity": "e.g. O(n) or null",
    "optimized_space_complexity": "e.g. O(n) or null",
    "technique": "e.g. Hash Map Lookup or null",
    "tradeoff_explanation": "e.g. Uses O(n) memory to reduce time from O(n²) to O(n) or null"
  }},
  "learning_takeaway": "Key algorithmic principle"
}}"""

        payload = {
            "model": "mistral-small-latest",
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": f"Source Code ({request.language}):\n{request.code}\nQuestion: {request.question or 'Provide grounded complexity explanation and optimization analysis.'}"}
            ],
            "temperature": 0.2,
            "max_tokens": 1024,
            "response_format": {"type": "json_object"}
        }

        async with httpx.AsyncClient(timeout=25.0) as client:
            resp = await client.post(url, headers=headers, json=payload)
            if resp.status_code == 200:
                data = resp.json()
                content = data["choices"][0]["message"]["content"]
                parsed = json.loads(content)
                return AIExplainResponse(**parsed)
            else:
                raise Exception(f"Mistral API returned status {resp.status_code}: {resp.text}")

    @staticmethod
    async def _call_nvidia(request: AIExplainRequest) -> AIExplainResponse:
        url = "https://integrate.api.nvidia.com/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {settings.NVIDIA_API_KEY}",
            "Content-Type": "application/json"
        }
        
        system_prompt = f"""You are the CodeLens AI DSA Tutor.
CRITICAL CONSTRAINT: You MUST accept the following verified static analysis complexity as ABSOLUTE GROUND TRUTH:
Time Complexity: {request.time_complexity}
Space Complexity: {request.space_complexity}
Confidence: {request.confidence}

Do NOT contradict these complexities. Explain WHY this exact complexity occurs.
Mode: {request.mode} (options: beginner, intermediate, advanced, dsa_student).

Respond ONLY with valid JSON matching this exact schema:
{{
  "explanation_mode": "{request.mode}",
  "summary": "Concise summary",
  "step_by_step_reasoning": ["Step 1", "Step 2", "Step 3"],
  "why_this_complexity": "Detailed structural proof",
  "what_happens_if_n_doubles": "Detailed scaling impact",
  "optimization": {{
    "has_optimization": true,
    "optimized_code": "code snippet or null",
    "optimized_time_complexity": "e.g. O(n) or null",
    "optimized_space_complexity": "e.g. O(n) or null",
    "technique": "e.g. Hash Map Lookup or null",
    "tradeoff_explanation": "e.g. Uses O(n) memory to reduce time from O(n²) to O(n) or null"
  }},
  "learning_takeaway": "Key algorithmic principle"
}}"""

        payload = {
            "model": "meta/llama-3.3-70b-instruct",
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": f"Source Code ({request.language}):\n{request.code}\nQuestion: {request.question or 'Provide grounded complexity explanation and optimization analysis.'}"}
            ],
            "temperature": 0.2,
            "max_tokens": 1024,
            "response_format": {"type": "json_object"}
        }

        async with httpx.AsyncClient(timeout=20.0) as client:
            resp = await client.post(url, headers=headers, json=payload)
            if resp.status_code == 200:
                data = resp.json()
                content = data["choices"][0]["message"]["content"]
                parsed = json.loads(content)
                return AIExplainResponse(**parsed)
            else:
                raise Exception(f"NVIDIA API returned status {resp.status_code}: {resp.text}")

    @staticmethod
    async def _call_gemini(request: AIExplainRequest) -> AIExplainResponse:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={settings.GEMINI_API_KEY}"
        
        system_constraint = f"""You are the CodeLens AI DSA Tutor.
CRITICAL CONSTRAINT: You MUST accept the following verified static analysis complexity as ABSOLUTE GROUND TRUTH:
Time Complexity: {request.time_complexity}
Space Complexity: {request.space_complexity}
Confidence: {request.confidence}

Do NOT contradict these complexities. Explain WHY this exact complexity occurs.
Mode: {request.mode} (options: beginner, intermediate, advanced, dsa_student).

Respond ONLY with valid JSON matching this exact schema:
{{
  "explanation_mode": "{request.mode}",
  "summary": "Concise summary",
  "step_by_step_reasoning": ["Step 1", "Step 2", "Step 3"],
  "why_this_complexity": "Detailed structural proof",
  "what_happens_if_n_doubles": "Detailed scaling impact",
  "optimization": {{
    "has_optimization": true/false,
    "optimized_code": "code snippet or null",
    "optimized_time_complexity": "e.g. O(n) or null",
    "optimized_space_complexity": "e.g. O(n) or null",
    "technique": "e.g. Hash Map Lookup or null",
    "tradeoff_explanation": "e.g. Uses O(n) memory to reduce time from O(n²) to O(n) or null"
  }},
  "learning_takeaway": "Key algorithmic principle"
}}"""

        prompt = f"""Source Code ({request.language}):
```
{request.code}
```
Specific question: {request.question or "Provide grounded complexity explanation and optimization analysis."}"""

        payload = {
            "contents": [{
                "parts": [
                    {"text": system_constraint},
                    {"text": prompt}
                ]
            }],
            "generationConfig": {
                "temperature": 0.2,
                "responseMimeType": "application/json"
            }
        }

        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.post(url, json=payload)
            if resp.status_code == 200:
                data = resp.json()
                text_content = data["candidates"][0]["content"]["parts"][0]["text"]
                parsed = json.loads(text_content)
                return AIExplainResponse(**parsed)
            else:
                raise Exception(f"Gemini API returned status {resp.status_code}")

    @staticmethod
    async def _call_openai(request: AIExplainRequest) -> AIExplainResponse:
        url = "https://api.openai.com/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {settings.OPENAI_API_KEY}",
            "Content-Type": "application/json"
        }
        
        system_prompt = f"""You are the CodeLens AI DSA Tutor.
CRITICAL CONSTRAINT: You MUST accept the following verified static analysis complexity as ABSOLUTE GROUND TRUTH:
Time Complexity: {request.time_complexity}
Space Complexity: {request.space_complexity}
Confidence: {request.confidence}

Do NOT contradict these complexities. Explain WHY this exact complexity occurs.
Mode: {request.mode}

Respond in strict JSON with fields: explanation_mode, summary, step_by_step_reasoning, why_this_complexity, what_happens_if_n_doubles, optimization, learning_takeaway."""

        payload = {
            "model": "gpt-3.5-turbo",
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": f"Code:\n{request.code}\nQuestion: {request.question or 'Explain'}"}
            ],
            "temperature": 0.2,
            "response_format": {"type": "json_object"}
        }

        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.post(url, headers=headers, json=payload)
            if resp.status_code == 200:
                data = resp.json()
                content = data["choices"][0]["message"]["content"]
                parsed = json.loads(content)
                return AIExplainResponse(**parsed)
            else:
                raise Exception(f"OpenAI API returned status {resp.status_code}")

    @staticmethod
    def _generate_deterministic_explanation(request: AIExplainRequest) -> AIExplainResponse:
        time_c = request.time_complexity
        space_c = request.space_complexity
        mode = request.mode.lower()
        
        # Step-by-step reasoning builder
        steps = []
        if time_c == "O(1)":
            steps = [
                "1. The code consists solely of direct variable assignments and constant-time elementary instructions.",
                "2. There are no input-dependent loops, unbounded while conditions, or recursive branches.",
                "3. Execution executes in a fixed number of CPU cycles regardless of input size."
            ]
            doubling = "When input N doubles from 1,000 to 2,000, execution time remains virtually unchanged (constant ~1 ms)."
            why = "Every instruction is executed exactly once without branching or iteration proportional to N."
            takeaway = "Constant time O(1) is the gold standard of algorithmic efficiency — unaffected by large input scale."
            opt = OptimizedAlternative(has_optimization=False)

        elif time_c == "O(log n)":
            steps = [
                "1. The algorithm repeatedly divides or scales the search space by a constant factor (typically 2).",
                "2. At each iteration, the remaining problem size is reduced from N to N/2, N/4, ..., down to 1.",
                "3. The number of steps is given by log₂(N), leading to logarithmic time O(log n)."
            ]
            doubling = "When input N doubles from 1,000 to 2,000, the algorithm only performs 1 additional iteration."
            why = "Binary halving eliminates half of the remaining candidates at each comparison step."
            takeaway = "Logarithmic algorithms scale exceptionally well, easily handling billions of elements in ~30 operations."
            opt = OptimizedAlternative(has_optimization=False)

        elif time_c == "O(n)":
            steps = [
                "1. The code executes a single loop iterating directly through the N elements of the input collection.",
                "2. Each iteration performs constant O(1) operations (arithmetic, dictionary lookup, or assignments).",
                "3. Total operations grow strictly linearly with the number of input items: N * O(1) = O(n)."
            ]
            doubling = "When input N doubles from 1,000 to 2,000, execution time doubles proportionally (2x runtime)."
            why = "Linear traversal visits each input element once without repeating work."
            takeaway = "Linear O(n) is optimal for any algorithm that must inspect every input item at least once."
            opt = OptimizedAlternative(has_optimization=False)

        elif time_c == "O(n log n)":
            steps = [
                "1. The algorithm combines linear iteration O(n) with logarithmic sub-division O(log n).",
                "2. Common in divide-and-conquer sorting (Merge Sort, Quick Sort) or nested loop with halving step.",
                "3. The total work done across all recursive levels sums to N * log₂(N)."
            ]
            doubling = "When input N doubles from 1,000 to 2,000, operations increase slightly more than double (~2.1x)."
            why = "Each of the log(n) tree levels processes n total elements."
            takeaway = "O(n log n) is the theoretical lower bound for comparison-based sorting algorithms."
            opt = OptimizedAlternative(has_optimization=False)

        elif time_c in ["O(n²)", "O(n^2)"]:
            steps = [
                "1. The code executes nested loops where an outer loop runs N times and an inner loop runs up to N times.",
                "2. For every step of the outer loop, the inner loop executes a complete iteration pass.",
                "3. The total number of operations is N * N = N² (or arithmetic progression N(N+1)/2 = O(N²))."
            ]
            doubling = "When input N doubles from 1,000 to 2,000, operations quadruple (4x increase, from 1,000,000 to 4,000,000 ops)."
            why = "Quadratic complexity occurs because every element is paired with every other element."
            takeaway = "Nested loops should be replaced with hash maps or two-pointer techniques whenever N > 10,000."
            
            # Suggest Hash Map Optimization
            if "python" in request.language.lower():
                opt_code = """def optimized_solution(nums, target):
    seen = {}
    for i, num in enumerate(nums):
        diff = target - num
        if diff in seen:
            return [seen[diff], i]
        seen[num] = i
    return []"""
            else:
                opt_code = """std::vector<int> optimizedSolution(const std::vector<int>& nums, int target) {
    std::unordered_map<int, int> seen;
    for (int i = 0; i < nums.size(); ++i) {
        int diff = target - nums[i];
        if (seen.count(diff)) return {seen[diff], i};
        seen[nums[i]] = i;
    }
    return {};
}"""
            opt = OptimizedAlternative(
                has_optimization=True,
                optimized_code=opt_code,
                optimized_time_complexity="O(n)",
                optimized_space_complexity="O(n)",
                technique="Hash Map Frequency / Lookup Indexing",
                tradeoff_explanation="Trades O(n) auxiliary heap memory to store seen values, eliminating the nested loop and reducing runtime from O(n²) to O(n)."
            )

        elif "2^n" in time_c:
            steps = [
                "1. The function branches recursively into 2 sub-calls per invocation without memoization.",
                "2. The recursion call tree has depth N, with the number of nodes doubling at each level: 1 + 2 + 4 + ... + 2^N.",
                "3. Total function calls grow exponentially: 2^N total operations."
            ]
            doubling = "When input N increases by just +1, runtime doubles (2x). When N doubles, computation becomes astronomically intractable."
            why = "Identical subproblems (e.g. fib(3)) are recalculated millions of redundant times."
            takeaway = "Exponential recursion can almost always be optimized to O(n) linear time using Dynamic Programming or Memoization."
            
            opt = OptimizedAlternative(
                has_optimization=True,
                optimized_code="def fibonacci_dp(n):\n    if n <= 1: return n\n    dp = [0] * (n + 1)\n    dp[1] = 1\n    for i in range(2, n + 1):\n        dp[i] = dp[i-1] + dp[i-2]\n    return dp[n]",
                optimized_time_complexity="O(n)",
                optimized_space_complexity="O(n)",
                technique="Dynamic Programming (Tabulation / Memoization)",
                tradeoff_explanation="Stores previous intermediate results in a table of size n, avoiding exponential re-computations and bringing runtime from O(2^n) to O(n)."
            )
        else:
            steps = [
                f"1. Static AST analysis evaluated dominant operation growth as {time_c}.",
                f"2. Auxiliary memory requirements measured at {space_c}.",
                "3. Operation counts are determined by loop bounds and recursion branching."
            ]
            doubling = f"Algorithm scales according to asymptotic rate {time_c}."
            why = f"Governed by static control flow structure yielding {time_c}."
            takeaway = "Always balance time complexity requirements against auxiliary memory constraints."
            opt = OptimizedAlternative(has_optimization=False)

        # Multi-mode narrative customization
        if mode == "beginner":
            summary = f"In simple terms: this code runs in {time_c} time and uses {space_c} extra memory. Think of it like looking through your items with predictable effort."
        elif mode == "advanced":
            summary = f"Asymptotic bound is strictly constrained to {time_c} with auxiliary spatial footprint of {space_c}. Cache locality and iteration bounds drive this ceiling."
        elif mode == "dsa_student":
            summary = f"Interview DSA Assessment: {time_c} Time Complexity | {space_c} Space Complexity. Optimal for constraints up to N = {('10^7' if time_c == 'O(n)' else '10^4' if time_c == 'O(n²)' else '35' if '2^n' in time_c else '10^9')}."
        else:
            summary = f"The static AST analyzer verified {time_c} Time Complexity and {space_c} Space Complexity based on loop control flow and memory allocations."

        return AIExplainResponse(
            explanation_mode=mode,
            summary=summary,
            step_by_step_reasoning=steps,
            why_this_complexity=why,
            what_happens_if_n_doubles=doubling,
            optimization=opt,
            learning_takeaway=takeaway
        )
