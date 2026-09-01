from backend.guardrails.input_guardrails import validate_input
from backend.guardrails.output_guardrails import validate_llm_output
from backend.services.llm_service import llm_service
from backend.services.ml_service import ml_service

class AnalysisService:

    def analyze(self, message: str) -> dict:
        # 1. Input guardrail
        is_valid, validated_message = validate_input(message)

        if not is_valid:
            raise ValueError(validated_message)

        # 2. ML prediction
        ml_result = ml_service.predict(validated_message)

        # 3. LLM explanation
        llm_result = llm_service.generate_explanation(
            validated_message,
            ml_result,
        )

        # 4. Final output validation
        validated_output = validate_llm_output(llm_result)

        return {
            "message": validated_message,
            "risk_level": ml_result["risk_level"],
            "confidence": ml_result["confidence"],
            "probabilities": ml_result["probabilities"],
            "explanation": validated_output.model_dump(),
        }

analysis_service = AnalysisService()