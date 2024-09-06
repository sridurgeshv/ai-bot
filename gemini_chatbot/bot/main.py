import requests
from config.config import API_KEY, BASE_URL
from utils.prompt_generator import generate_prompt
from utils.feedback_handler import get_feedback

def generate_prompt_from_bot(genre, stage):
    prompt = generate_prompt(genre, stage)
    response = requests.post(
        BASE_URL,
        headers={"Authorization": f"Bearer {API_KEY}"},
        json={"prompt": prompt}
    )
    return response.json()

def provide_feedback(sample_text):
    feedback_request = get_feedback(sample_text)
    response = requests.post(
        BASE_URL,
        headers={"Authorization": f"Bearer {API_KEY}"},
        json={"feedback": feedback_request}
    )
    return response.json()

# Example usage
if __name__ == "__main__":
    genre = "fantasy"
    stage = "plot development"
    print("Prompt from bot:", generate_prompt_from_bot(genre, stage))

    writing_sample = "Once upon a time in a distant kingdom..."
    print("Feedback from bot:", provide_feedback(writing_sample))
 