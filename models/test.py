# test file which is used for testing multiple modules used in actual dep

import models.model as model
import models.restucturer as restucturer

# lines = model.take_user_input_and_create_course("Python")

with open("t.json" , "r") as file:
    lines = file.read()

# formatted_json = restucturer.trim_json_structure(lines)

# Write the formatted JSON to the file
# try:
#     with open("t.json", "w") as file:
#         file.write(formatted_json)
#     print("done")

# except Exception as e:
#     print(f"An error occurred while writing to the file: {e}")

print(lines[0])