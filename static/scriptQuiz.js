let totalQuestions = 0;
let correctAnswers = 0;
let attempted = 0;

async function getQuiz() {
    try {
        let topic = sessionStorage.getItem('topic');
        console.log('Topic:', topic);
        
        const res = await fetch("/get_quiz_data", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json' 
            },
            body: JSON.stringify({ topic: topic })
        });
        const quizData = await res.json();

        // console.log('Raw quiz data:', quizData);

        displayQuiz(quizData);
    }
    catch(e) {
        console.error('Error fetching quiz data:', e);
        document.getElementById('quiz-content').textContent = 'Error loading quiz data. Please try again later.';
    }
}

function displayQuiz(quizData) {    
    // console.log('Display quiz data:', quizData);
    
    try {
        quizData = JSON.parse(quizData);
    } catch (e) {
        console.log('Quiz data is already parsed, no need for JSON.parse');
    }

    // console.log('Parsed quiz data:', quizData);

    document.getElementById('course-title').textContent = quizData['quizData'] || quizData['title'] || 'Untitled Course';

    const quizContainer = document.getElementById('quiz-content');
    quizContainer.innerHTML = ''; // Clear existing content

    quizData.questions.forEach((question, index) => {
        // console.log(`Question ${index + 1}:`, question);

        const questionElement = document.createElement('div');
        questionElement.className = 'questiondiv';
        questionElement.innerHTML = `
            <h3>Question ${index + 1}: ${question.question}</h3>
            <p>Difficulty: ${question.difficulty}</p>
            <p>Subtopic: ${question.subtopic}</p>
        `;

        const optionsElement = document.createElement('div');
        optionsElement.className = 'optionsdiv';
        
        for (const [key, value] of Object.entries(question.options)) {
            const option = document.createElement('div');
            option.innerHTML = `
                <input type="radio" name="question${index}" value="${key}" id="q${index}o${key}">
                <label for="q${index}o${key}">${key}: ${value}</label>
            `;
            optionsElement.appendChild(option);
        }

        questionElement.appendChild(optionsElement);

        const submitButton = document.createElement('button');
        submitButton.textContent = 'Submit Answer';
        
        submitButton.onclick = () => {
            //console.log(`Submitting answer for question ${index + 1}`);
            //console.log('Correct answer:', question.correct);
            //console.log('Explanation:', question.explanation);
            checkAnswer(index, question.correct_answer, question.explanation);
        };
        questionElement.appendChild(submitButton);

        const explanationElement = document.createElement('div');
        explanationElement.id = `explanation${index}`;
        explanationElement.className = 'explanation';
        questionElement.appendChild(explanationElement);

        quizContainer.appendChild(questionElement);
    });

    totalQuestions = quizData.questions.length;

    const showResultsButton = document.getElementById('show-results-button');
    showResultsButton.onclick = showResults;
    showResultsButton.style.display = 'none'; // Hide initially
}

function checkAnswer(questionIndex, correctAnswer, explanation = "No explanation provided") {
    //console.log(`Checking answer for question ${questionIndex + 1}`);
    //console.log('Correct answer:', correctAnswer);
    //console.log('Explanation:', explanation);

    const selectedOption = document.querySelector(`input[name="question${questionIndex}"]:checked`);
    const explanationElement = document.getElementById(`explanation${questionIndex}`);
    const submitButton = explanationElement.previousElementSibling;
    
    if (selectedOption) {
        const userAnswer = selectedOption.value;
        console.log('User answer:', userAnswer);

        if (userAnswer === correctAnswer) {
            explanationElement.innerHTML = `<p class="correct">Correct! ${explanation}</p>`;
            correctAnswers++;
        } else {
            explanationElement.innerHTML = `
                <p class="incorrect">Incorrect. The correct answer is ${correctAnswer}.</p>
                <p>${explanation}</p>
            `;
        }
        attempted++;
        submitButton.disabled = true;
        document.getElementById('show-results-button').style.display = 'block';
    } else {
        explanationElement.innerHTML = '<p class="error">Please select an answer.</p>';
    }

    console.log(`Answers checked: ${attempted} / ${totalQuestions}`);
    console.log(`Correct answers: ${correctAnswers}`);
}

function showResults() {
    const resultsElement = document.getElementById('results');
    resultsElement.style.display = 'block';
    resultsElement.innerHTML = `
        <h2>Quiz Results</h2>
        <p>You answered ${correctAnswers} out of ${totalQuestions} questions correctly.</p>
        <p>Your score: ${(correctAnswers / totalQuestions * 100).toFixed(2)}%</p>
    `;
    
    let performance;
    const score = correctAnswers / totalQuestions;
    if (score >= 0.9) {
        performance = "Excellent! You have a strong understanding of the subject.";
    } else if (score >= 0.7) {
        performance = "Good job! You have a solid grasp of the material.";
    } else if (score >= 0.5) {
        performance = "Not bad! There's room for improvement. Review the topics you struggled with.";
    } else {
        performance = "You might want to spend more time studying. Don't give up!";
    }
    
    resultsElement.innerHTML += `<p>${performance}</p>`;
}

window.onload = getQuiz;