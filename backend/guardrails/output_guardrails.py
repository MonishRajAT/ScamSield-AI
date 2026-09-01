from pydantic import BaseModel, Field, field_validator

class LLMAnalysisOutput(BaseModel):
    summary: str = Field(
        ...,
        min_length=1,
        max_length=500,
    )

    scam_type: str = Field(
        ...,
        min_length=1,
        max_length=100,
    )

    why_flagged: list[str] = Field(
        ...,
        min_length=1,
        max_length=4,
    )

    recommended_actions: list[str] = Field(
        ...,
        min_length=1,
        max_length=4,
    )

    @field_validator("summary", "scam_type", mode="before")
    @classmethod
    def validate_text(cls, value):
        if not isinstance(value, str):
            raise ValueError("Field must be a string.")

        value = value.strip()

        if not value:
            raise ValueError("Field cannot be empty.")

        return value

    @field_validator(
        "why_flagged",
        "recommended_actions",
        mode="before",
    )
    @classmethod
    def validate_lists(cls, value):
        if not isinstance(value, list):
            raise ValueError("Field must be a list.")

        cleaned = []

        for item in value:
            if not isinstance(item, str):
                raise ValueError("List items must be strings.")

            item = item.strip()

            if not item:
                raise ValueError("List items cannot be empty.")

            cleaned.append(item)

        return cleaned


def validate_llm_output(output: dict) -> LLMAnalysisOutput:
    return LLMAnalysisOutput.model_validate(output)


def get_llm_json_schema() -> dict:
    return {
        "type": "object",
        "additionalProperties": False,
        "properties": {
            "summary": {
                "type": "string",
            },
            "scam_type": {
                "type": "string",
            },
            "why_flagged": {
                "type": "array",
                "minItems": 1,
                "maxItems": 4,
                "items": {
                    "type": "string",
                },
            },
            "recommended_actions": {
                "type": "array",
                "minItems": 1,
                "maxItems": 4,
                "items": {
                    "type": "string",
                },
            },
        },
        "required": [
            "summary",
            "scam_type",
            "why_flagged",
            "recommended_actions",
        ],
    }