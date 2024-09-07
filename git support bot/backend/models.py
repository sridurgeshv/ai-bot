import os
import requests


# Gemini Pro Model API Settings
API_BASE_URL = "https://generativelanguage.googleapis.com/v1beta2/models/gemini-1.5-pro:generateText" 
API_KEY = os.environ.get("AIzaSyDIS5jHYWNaw0De2tcpXQAgPx2DQqOCvSg")  # Get API key from environment variable


def get_gemini_response(prompt, 
                        temperature=0.2, 
                        max_output_tokens=256):
    """Generates text using the Gemini Pro Model API."""

    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {API_KEY}"
    }

    data = {
        "prompt": {
            "text": prompt
        },
        "temperature": temperature,
        "max_output_tokens": max_output_tokens, 
        # ... other parameters as needed (e.g., top_k, top_p)
    }

    response = requests.post(API_BASE_URL, headers=headers, json=data)

    if response.status_code == 200:
        return response.json()['candidates'][0]['output']
    else:
        print(f"Error: {response.status_code} - {response.text}")
        return "An error occurred while processing your request."