import json

def trim_json_structure(lines):
    # Join all lines into a single string
    content = ''.join(lines)
    
    # Find the first '{' and the last '}'
    start_index = content.find('{')
    end_index = content.rfind('}')
    
    if start_index == -1 or end_index == -1 or end_index < start_index:
        print("The JSON structure is not properly enclosed.")
        return ""
    
    # Extract the JSON part
    json_content = content[start_index:end_index + 1]
    
    # Format the JSON content to ensure proper indentation
    try:
        parsed_json = json.loads(json_content)
        formatted_json = json.dumps(parsed_json, indent=4)
        return formatted_json
    except json.JSONDecodeError as e:
        print(f"Error decoding JSON: {e}")
        return ""

if __name__ == "__main__":
    input_filename = "quiz.txt"
    output_filename = "quiz.json"  # Change this if you want to write to a different file

    try:
        with open(input_filename, 'r') as file:
            lines = file.readlines()

        lines = trim_json_structure(lines)

        with open(output_filename, 'w') as file:
            file.writelines(lines)

        print(f"Trimmed and formatted content to keep JSON structure. Updated file saved as '{output_filename}'.")
    except Exception as e:
        print(f"An error occurred: {e}")
