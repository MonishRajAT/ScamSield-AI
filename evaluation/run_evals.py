from evaluation.eval_dataset import EVAL_CASES
from backend.guardrails.input_guardrails import validate_input
from backend.services.analysis_service import analysis_service

def run_evaluations():
    results = []

    for case in EVAL_CASES:
        case_id = case["id"]
        message = case["message"]
        expected_risk = case["expected_risk"]

        is_valid, validated_message = validate_input(message)

        # Input guardrail evaluation
        if expected_risk == "blocked":
            passed = not is_valid

            results.append({
                "id": case_id,
                "expected": expected_risk,
                "actual": "blocked" if not is_valid else "processed",
                "passed": passed,
            })

            continue

        # Normal analysis evaluation
        if not is_valid:
            results.append({
                "id": case_id,
                "expected": expected_risk,
                "actual": "blocked",
                "passed": False,
            })

            continue

        try:
            result = analysis_service.analyze(validated_message)

            actual_risk = result["risk_level"]

            results.append({
                "id": case_id,
                "expected": expected_risk,
                "actual": actual_risk,
                "passed": actual_risk == expected_risk,
            })

        except Exception as exc:
            results.append({
                "id": case_id,
                "expected": expected_risk,
                "actual": "error",
                "passed": False,
                "error": str(exc),
            })

    return results

if __name__ == "__main__":
    results = run_evaluations()

    total = len(results)
    passed = sum(result["passed"] for result in results)

    print("\n" + "=" * 60)
    print("SCAMSHIELD EVALUATION")
    print("=" * 60)

    for result in results:
        status = "PASS" if result["passed"] else "FAIL"

        print(
            f"{status:5} | "
            f"{result['id']:15} | "
            f"Expected: {result['expected']:10} | "
            f"Actual: {result['actual']}"
        )

    print("=" * 60)
    print(f"Passed: {passed}/{total}")
    print(f"Score : {passed / total:.2%}")
    print("=" * 60)