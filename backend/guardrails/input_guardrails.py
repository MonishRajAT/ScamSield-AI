import re

MAX_MESSAGE_LENGTH = 5000

def validate_input(message: str) -> tuple[bool, str]:
    if not isinstance(message, str):
        return False, "Message must be text."

    message = message.strip()

    if not message:
        return False, "Message cannot be empty."

    if len(message) > MAX_MESSAGE_LENGTH:
        return False, "Message is too long. Maximum length is 5000 characters."

    # Reject obvious prompt-injection attempts aimed at the LLM layer.
    injection_patterns = [
        r"ignore\s+(all\s+)?previous\s+instructions",
        r"ignore\s+(all\s+)?prior\s+instructions",
        r"system\s*prompt",
        r"reveal\s+(your|the)\s+(system\s+)?prompt",
        r"show\s+(me\s+)?your\s+instructions",
        r"disregard\s+(all\s+)?previous",
    ]

    normalized = re.sub(r"\s+", " ", message.lower())

    for pattern in injection_patterns:
        if re.search(pattern, normalized):
            return False, "Input contains an unsupported instruction."

    return True, message