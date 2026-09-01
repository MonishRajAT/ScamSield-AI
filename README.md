# ScamShield AI

AI-powered scam message detection using Machine Learning, LLM explanations, and safety guardrails.

ScamShield AI analyzes a message, predicts its risk level, and provides a clear explanation of why the message may be suspicious along with recommended safety actions.

## Features

- Scam message classification using Machine Learning
- Three risk levels: Safe, Suspicious, High-risk
- ML confidence and probability scores
- LLM-powered explanation
- Scam type identification
- Recommended safety actions
- Input and output guardrails
- ML and LLM evaluation pipelines
- FastAPI backend
- Responsive web interface

## Architecture

```text
User Message
     │
     ▼
Input Guardrails
     │
     ▼
Machine Learning Model
     │
     ▼
Risk Prediction
     │
     ▼
LLM Analysis
     │
     ▼
Output Guardrails
     │
     ▼
Final Analysis
     │
     ▼
Frontend
```

## Risk Levels

| Risk Level | Meaning |
|---|---|
| Safe | Message does not show significant scam indicators |
| Suspicious | Message contains potentially concerning signals |
| High-risk | Message strongly resembles a scam or phishing attempt |

## Tech Stack

### Backend
- Python
- FastAPI
- Pydantic
- Uvicorn

### Machine Learning
- Scikit-learn
- TF-IDF
- Logistic Regression
- Pandas
- NumPy

### LLM
- Groq API
- GPT-OSS-120B

### Frontend
- HTML
- CSS
- JavaScript

### Evaluation & Safety
- Input Guardrails
- Output Guardrails
- ML Evaluation
- LLM Evaluation

### Development
- uv
- Google Colab
- Git & GitHub

## Project Structure

```text
ScamShield-AI/
│
├── backend/
│   ├── main.py
│   ├── routes/
│   │   └── analysis.py
│   ├── services/
│   │   ├── ml_service.py
│   │   ├── llm_service.py
│   │   └── analysis_service.py
│   ├── guardrails/
│   │   ├── input_guardrails.py
│   │   └── output_guardrails.py
│   └── config/
│       └── settings.py
│
├── ml/
│   ├── notebooks/
│   │   └── scamshield_ml.ipynb
│   ├── data/
│   │   ├── raw/
│   │   └── processed/
│   ├── models/
│   │   └── scamshield_model.pkl
│   └── artifacts/
│       ├── vectorizer.pkl
│       └── label_encoder.pkl
│
├── evaluation/
│   ├── eval_dataset.py
│   ├── llm_evals.py
│   └── run_evals.py
│
├── frontend/
│   ├── index.html
│   ├── style.css
│   └── script.js
│
├── .env
├── .gitignore
├── requirements.txt
└── README.md
```

## Setup

Clone the repository:

```bash
git clone <repository-url>
cd ScamShield-AI
```

Install dependencies:

```bash
uv sync
```

Create a `.env` file:

```env
GROQ_API_KEY=your_api_key
```

## Run the Backend

```bash
uv run uvicorn backend.main:app --reload
```

The API will be available at:

```text
http://127.0.0.1:8000
```

## Run the Frontend

Open `frontend/index.html` in a browser while the FastAPI backend is running.

## Evaluation

ScamShield includes separate evaluation pipelines for:

- ML predictions
- LLM schema compliance
- LLM action safety
- LLM explanation quality

Current LLM evaluation results:

```text
Schema Compliance   : 100%
Action Safety       : 100%
Explanation Quality : 100%
Overall LLM Score   : 100%
```

## Disclaimer

ScamShield AI is an assistive security tool and should not be treated as a definitive authority.

When a message appears suspicious, verify the information through an official channel rather than relying solely on the model's prediction.

## License

This project is for educational and demonstration purposes.
