import re

LETTER_VALUES = {
    'A': 10, 'B': 12, 'C': 13, 'D': 14, 'E': 15, 'F': 16, 'G': 17, 'H': 18,
    'I': 19, 'J': 20, 'K': 21, 'L': 23, 'M': 24, 'N': 25, 'O': 26, 'P': 27,
    'Q': 28, 'R': 29, 'S': 30, 'T': 31, 'U': 32, 'V': 34, 'W': 35, 'X': 36,
    'Y': 37, 'Z': 38,
}

def compute_check_digit(code10: str) -> int:
    total = 0
    for i, ch in enumerate(code10):
        value = LETTER_VALUES[ch] if ch.isalpha() else int(ch)
        total += value * (2 ** i)
    remainder = total % 11
    return 0 if remainder == 10 else remainder

def validate_container_number(code: str) -> bool:
    code = code.upper().replace(" ", "")
    if not re.match(r'^[A-Z]{4}\d{7}$', code):
        return False
    expected = compute_check_digit(code[:10])
    actual = int(code[10])
    return expected == actual