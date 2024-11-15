from models.var import qrok_api_key
from groq import Groq
import models.restucturer as restucturer

api_key = qrok_api_key

if not api_key:
    raise ValueError("API key not found in Colab secrets. Please ensure that the 'GROQ_API_KEY' is added to the Colab secrets.")

def initialize_groq_client(api_key):
    try:
        return Groq(api_key=api_key)
    except Exception as e:
        print(f"Error initializing Groq client: {e}")
        return None
    

def course_creator_model(client, input_topic, context=None):
    system_prompt = f"""
        You are an expert educational content creator specializing in crafting multiple-choice questions (MCQs) for guided courses. Your task is to generate high-quality MCQs that progress from beginner to expert level, covering various topics within the specified subject area. Follow these guidelines:
        
        ensure that format will be "JSON" for ease of understandings and keep the indentation properly.

        Structure: The output should be a valid JSON object with the following structure:
            title,
            questions:
                question and its options
                correct answer and explanation
                subtopic:

            correct answer should be marked as "correct_answer"

        1.Title of the test
        
        2.Question Difficulty: Create questions at five difficulty levels: Beginner, Intermediate, Advanced, Expert, and Master.

        3.Question Structure: Provide four answer options (A, B, C, D) for each question with one being the right.

        4.Content Coverage:
            Evenly distribute questions across all relevant subtopics within the subject area.
            Ensure comprehensive coverage of fundamental concepts at lower levels.
            Incorporate more nuanced and specialized knowledge at higher levels.

        5.Answer Explanations:
            Provide a brief explanation for the correct answer.
            Include concise explanations for why each distractor is incorrect.

        6.Metadata:
            Tag each question with relevant metadata:
                Difficulty level
                Subtopic

        7.Progression:
            When generating a set of questions, start with beginner-level and gradually increase difficulty.
            Aim for a balanced distribution across difficulty levels, with slightly fewer questions at the Master level.
  
    """

    user_prompt=f"""
        I have learnt following topic : {input_topic}.
        make a designated multiple choice question test containing 10 to 15 even 20 questions to test my leanings.
        Please add from beginner level to extreme level to test myself.

        also add answers and their explanations why they are right and others being wrong.
        
    """

    chat_completion = client.chat.completions.create(
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
                model="llama3-70b-8192",
            )
    return chat_completion.choices[0].message.content

def take_user_input_and_create_test(topic):
    # Taking user input for the course topic

    client = initialize_groq_client(api_key)

    if client:
        # Call the course creator function with the user's input
        course_content = course_creator_model(client, topic)

        if course_content:
            print("Course Content Generated:\n")
            return (course_content)
        else:
            print("Failed to generate the course content.")
    else:
        print("Model initialization failed. Please check the API and try again.")

# Main function to run the application
if __name__ == "__main__":
    details = take_user_input_and_create_test("Java")
    # print(details)
    with open('quiz.txt', 'w') as file:
        file.write(details)
    
    details = restucturer.trim_json_structure(details)
    with open('quiz.json', 'w') as file:
        file.write(details)

    