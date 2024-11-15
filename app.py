from flask import Flask, render_template, request , jsonify
import models.model as model
import models.quizModel as qmodel
import models.restucturer as restucturer

app = Flask(__name__)

# topic = ""

@app.route('/')
def index():
    return render_template('index.html')

@app.route("/courseCreation" , methods = ["POST"])
def generateCourse():
    topic = request.json.get('topic')
    print(topic)

    rawDetails = model.take_user_input_and_create_course(topic)
    details = restucturer.trim_json_structure(rawDetails)
    
    with open("course.json" , "w") as file:
        file.write(details)
    
    # print(details)

    # with open("temp.json" , "r") as file:
    #     details = file.read()

    return jsonify(details)

@app.route("/quiz")
def quiz_index():
    return render_template('quizIndex.html')

@app.route("/get_quiz_data" , methods = ["POST"])
def generateQuiz():
    topic = request.json.get('topic')
    print(topic)

    rawQuiz = qmodel.take_user_input_and_create_test(topic)

    with open("quiz.txt" , "w") as file:
        file.write(rawQuiz)

    quiz = restucturer.trim_json_structure(rawQuiz)

    with open("quiz.json" , "w") as file:
        file.write(quiz)

    return jsonify(quiz)

if __name__ == '__main__':
    app.run(debug=True)
