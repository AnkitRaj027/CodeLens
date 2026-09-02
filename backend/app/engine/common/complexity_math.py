import re
from typing import List, Tuple

# Ranked standard complexity orders from lowest to highest
COMPLEXITY_RANK = [
    "O(1)",
    "O(log log n)",
    "O(log n)",
    "O(sqrt(n))",
    "O(n)",
    "O(n log n)",
    "O(n²)",
    "O(n³)",
    "O(n⁴)",
    "O(2^n)",
    "O(3^n)",
    "O(n!)",
    "O(n^n)",
]

# Aliases for normalization
ALIASES = {
    "O(logn)": "O(log n)",
    "O(log(n))": "O(log n)",
    "O(N)": "O(n)",
    "O(n^2)": "O(n²)",
    "O(n*n)": "O(n²)",
    "O(n^3)": "O(n³)",
    "O(n*log(n))": "O(n log n)",
    "O(n*logn)": "O(n log n)",
    "O(nlogn)": "O(n log n)",
    "O(2^N)": "O(2^n)",
    "O(N!)": "O(n!)",
}


def normalize_complexity(c: str) -> str:
    cleaned = c.strip()
    return ALIASES.get(cleaned, cleaned)


def get_rank(c: str) -> int:
    norm = normalize_complexity(c)
    if norm in COMPLEXITY_RANK:
        return COMPLEXITY_RANK.index(norm)
    # Check for polynomial degree
    match = re.match(r"O\(n\^(\d+)\)", norm)
    if match:
        deg = int(match.group(1))
        return 6 + deg  # after O(n²)
    return 0


def max_complexity(c1: str, c2: str) -> str:
    norm1 = normalize_complexity(c1)
    norm2 = normalize_complexity(c2)
    rank1 = get_rank(norm1)
    rank2 = get_rank(norm2)
    return norm1 if rank1 >= rank2 else norm2


def sum_complexities(complexities: List[str]) -> str:
    if not complexities:
        return "O(1)"
    dominant = "O(1)"
    for c in complexities:
        dominant = max_complexity(dominant, c)
    return dominant


def multiply_complexities(c1: str, c2: str) -> str:
    norm1 = normalize_complexity(c1)
    norm2 = normalize_complexity(c2)
    
    if norm1 == "O(1)":
        return norm2
    if norm2 == "O(1)":
        return norm1

    # O(n) * O(n) = O(n²)
    if norm1 == "O(n)" and norm2 == "O(n)":
        return "O(n²)"
    if (norm1 == "O(n²)" and norm2 == "O(n)") or (norm1 == "O(n)" and norm2 == "O(n²)"):
        return "O(n³)"
    if (norm1 == "O(n)" and norm2 == "O(log n)") or (norm1 == "O(log n)" and norm2 == "O(n)"):
        return "O(n log n)"
    if (norm1 == "O(n²)" and norm2 == "O(log n)") or (norm1 == "O(log n)" and norm2 == "O(n²)"):
        return "O(n² log n)"
    if norm1 == "O(log n)" and norm2 == "O(log n)":
        return "O(log² n)"
    
    # Generic polynomial multiplication
    match1 = re.match(r"O\(n\^?(\d*)\)", norm1.replace("²", "2").replace("³", "3"))
    match2 = re.match(r"O\(n\^?(\d*)\)", norm2.replace("²", "2").replace("³", "3"))
    if match1 and match2:
        deg1 = int(match1.group(1)) if match1.group(1) else (1 if norm1 == "O(n)" else 0)
        deg2 = int(match2.group(1)) if match2.group(1) else (1 if norm2 == "O(n)" else 0)
        total_deg = deg1 + deg2
        if total_deg == 2:
            return "O(n²)"
        if total_deg == 3:
            return "O(n³)"
        return f"O(n^{total_deg})"
    
    return f"{norm1} * {norm2}"
