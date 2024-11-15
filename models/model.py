from models.var import qrok_api_key
from groq import Groq

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
    system_prompt=f"""
        You are an advanced AI designed to create comprehensive online courses from scratch. When given a topic, generate a complete course structure with the following components:

        Structure: The output should be a valid JSON object with the following structure:
            Course Title,
            Course Overview,
            Target Audience
            Module Structure
                Module Title,
                Module Overview,
                Key Topics,
                Detailed Content
                    Concept,
                    Explanation,
                    Example,
                    Real-World Relevance
                Examples

        Course Title: Create a clear, engaging title for the course.
        Course Overview: Provide a brief introduction to the course, its objectives, and target audience.
    
        1. Module Design:
            Identify Sub-Topics: Analyze the main topic and determine all relevant sub-topics that need to be covered.
            Module Breakdown: Divide the main topic into distinct modules, each focusing on one or more sub-topics.
    
        2. Chain of Thought for Each Sub-Topic:
            Conceptual Analysis: For each sub-topic, start by defining the core concepts and principles. Explain the importance and relevance of each concept.
            Detailed Explanation: Break down the concepts into fundamental components. Use simple language to explain complex ideas.
            Illustrative Examples: Provide multiple examples, case studies, or scenarios that apply the concepts in practical contexts.
            Comparative Analysis: Compare different theories or viewpoints related to the sub-topic, if applicable.
            Contextual Relevance: Explain how the sub-topic applies to real-world situations or problems.

        3. Content Quality:
            Ensure each module logically flows from one to the next.
            Maintain clarity and accuracy in all explanations.
            Structure the content to be beginner-friendly and suitable for online learning platforms

        ensure that format will be JSON for ease of understandings and keep the indentation properly.

        Ensure that the course content progresses logically, building on previous modules, and uses accessible language for those new to the subject. Focus on delivering production-ready content suitable for online learning platforms.
    """

    user_prompt=f"""
    I want to design a course on {input_topic}.
    Please generate a complete, module-wise course content that is suitable for beginners.
        1. Break Down the Main Topic: Identify and list all relevant sub-topics.
        
        2. Detailed Sub-Topic Explanation:
        Define core concepts and principles.
        Break down concepts into fundamental components.
        Provide multiple examples, case studies, or practical scenarios.
        Include comparative analyses if relevant.
        Explain the real-world relevance of each concept.

    """

    chat_completion = client.chat.completions.create(
           messages=[
              {"role": "system", "content": system_prompt},
              {"role": "user", "content": user_prompt}
           ],
            model="llama3-70b-8192",
        )
    return chat_completion.choices[0].message.content

def take_user_input_and_create_course(topic):
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
    details = take_user_input_and_create_course("Python")
    # print(details)
    with open('text.txt', 'w') as file:
        file.write(details)