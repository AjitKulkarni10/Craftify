var topic = "";
function logText() {
    var inputText = document.getElementById("textInput").value ? document.getElementById("textInput").value : "EmptyValue";
    if(inputText === "EmptyValue"){
        document.getElementById('course-content').textContent = 'Error loading course data. Please try again later.';
    }
    else{
        console.log(inputText);
        fetchCourseData();
    }
}

async function fetchCourseData() {
    topic = document.getElementById("textInput").value ? document.getElementById("textInput").value : "EmptyValue";
    try {
        const response = await fetch('/courseCreation', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json' 
                },
                body: JSON.stringify({ topic : topic })
            });
        const courseData = await response.json();
        // console.log(courseData);
        
        renderCourseContent(courseData);
    } catch (error) {
        console.error('Error fetching course data:', error);
        document.getElementById('course-content').textContent = 'Error loading course data. Please try again later.';
    }
}

function renderCourseContent(courseData) {
    console.log("Rendering course content");
    courseData = JSON.parse(courseData);

    // console.log("Full course data:", courseData["Course Overview"]);
    // console.log("courseData:", JSON.stringify(courseData, null, 2));
    

    if (!courseData) {
        console.error("Could not find valid course data");
        document.getElementById('course-content').textContent = 'Error: Could not find valid course data';
        return;
    }

    // console.log("Found course data:", courseData);

    // Set course title
    document.getElementById('course-title').textContent = courseData['Course Title'] || courseData['title'] || 'Untitled Course';

    const courseContent = document.getElementById('course-content');

    // Render course overview
    if (courseData['Course Overview']) {
        // console.log(courseData['Course Overview']);
        
        const overviewSection = createSection('course-overview', 'Course Overview');
        overviewSection.appendChild(createParagraph(courseData['Course Overview'] || courseData['Course Overview'].Introduction || 'No introduction available.'));
        overviewSection.appendChild(createSubSection('Target Audience', courseData['Target Audience'] || courseData['Course Overview']["Target Audience"] ||'No target audience specified.'));
        
        const targetObjectives = courseData["Objectives"] || courseData['Course Overview']["Objectives"];

        if (targetObjectives) {
            overviewSection.appendChild(createSubSection('Target Audience', targetObjectives));
        } else {
            // Optionally, you can also remove or ensure that nothing is appended
            console.log("No content available for Target Audience");
        }

        courseContent.appendChild(overviewSection);
    }

    // Render modules
    let modules = courseData['Modules'] || courseData['Module Structure'];
    if (!Array.isArray(modules)) {
        console.log("Modules is not an array, converting to array");
        modules = Object.values(modules);
    }

    // console.log("Modules to render:", modules);

    if (modules.length > 0) {
        const modulesSection = createSection('modules', 'Course Modules');
        modules.forEach((module, index) => {
            // console.log(`Rendering module ${index}:`, module);
            const moduleDiv = document.createElement('div');
            moduleDiv.className = 'module';

            moduleDiv.appendChild(createHeading('h3', `${index + 1} ${module['Module Title']}`));
            moduleDiv.appendChild(createParagraph(module['Module Overview'] || 'No overview available.'));

            const topicsList = createList(module['Key Topics'] || []);
            moduleDiv.appendChild(createSubSection('Key Topics', topicsList));

            const detailsButton = document.createElement('button');
            detailsButton.textContent = 'Show Details';
            detailsButton.className = 'toggle-details';
            moduleDiv.appendChild(detailsButton);

            const detailsDiv = document.createElement('div');
            detailsDiv.className = 'module-details';
            detailsDiv.style.display = 'none';

            // Detailed Content - Updated handling
            if (module['Detailed Content']) {
                const detailedContent = createSubSection('Detailed Content');
                
                // Handle array of detailed content objects
                const contentArray = Array.isArray(module['Detailed Content']) ? 
                    module['Detailed Content'] : [module['Detailed Content']];

                contentArray.forEach(content => {
                    const contentCard = document.createElement('div');
                    contentCard.className = 'content-card';

                    // Concept
                    if (content.Concept) {
                        contentCard.appendChild(createHeading('h4', content.Concept));
                    }

                    // Explanation
                    if (content.Explanation) {
                        const explanationDiv = document.createElement('div');
                        explanationDiv.className = 'explanation-section';
                        explanationDiv.innerHTML = `<strong>Explanation:</strong> ${content.Explanation}`;
                        contentCard.appendChild(explanationDiv);
                    }

                    // Examples
                    if (content.Examples && content.Examples.length > 0) {
                        const examplesDiv = document.createElement('div');
                        examplesDiv.className = 'examples-section';
                        examplesDiv.innerHTML = '<strong>Examples:</strong>';
                        const examplesList = document.createElement('ul');
                        content.Examples.forEach(example => {
                            const li = document.createElement('li');
                            li.textContent = example;
                            examplesList.appendChild(li);
                        });
                        examplesDiv.appendChild(examplesList);
                        contentCard.appendChild(examplesDiv);
                    }

                    // Real-World Relevance
                    if (content['Real-World Relevance']) {
                        const relevanceDiv = document.createElement('div');
                        relevanceDiv.className = 'relevance-section';
                        relevanceDiv.innerHTML = `<strong>Real-World Relevance:</strong> ${content['Real-World Relevance']}`;
                        contentCard.appendChild(relevanceDiv);
                    }

                    detailedContent.appendChild(contentCard);
                });

                detailsDiv.appendChild(detailedContent);
            }

            // Examples
            if (module['Examples']) {
                const examplesList = createList(Object.values(module['Examples']));
                detailsDiv.appendChild(createSubSection('Examples', examplesList));
            }

            moduleDiv.appendChild(detailsDiv);

            // Add event listener to toggle button
            detailsButton.addEventListener('click', function() {
                if (detailsDiv.style.display === 'none') {
                    detailsDiv.style.display = 'block';
                    this.textContent = 'Hide Details';
                } else {
                    detailsDiv.style.display = 'none';
                    this.textContent = 'Show Details';
                }
            });

            modulesSection.appendChild(moduleDiv);
        });

        courseContent.appendChild(modulesSection);
    } else {
        console.log("No modules found");
        courseContent.appendChild(createParagraph('No modules found.'));
    }

    addQuizButton();
}

function createSection(id, title) {
    const section = document.createElement('section');
    section.id = id;
    section.appendChild(createHeading('h2', title));
    return section;
}

function createSubSection(title, content) {
    const subSection = document.createElement('div');
    subSection.appendChild(createHeading('h4', title));
    if (content) {
        if (typeof content === 'string') {
            subSection.appendChild(createParagraph(content));
        } else {
            subSection.appendChild(content);
        }
    }
    return subSection;
}

function createHeading(level, text) {
    const heading = document.createElement(level);
    heading.textContent = text;
    return heading;
}

function createParagraph(text) {
    const p = document.createElement('p');
    p.textContent = text;
    return p;
}

function createList(items) {
    const ul = document.createElement('ul');
    items.forEach(item => {
        const li = document.createElement('li');
        li.textContent = item;
        ul.appendChild(li);
    });
    return ul;
}

// Function to add a new module
function addNewModule(moduleData) {
    const modulesSection = document.getElementById('modules');
    const moduleDiv = document.createElement('div');
    moduleDiv.className = 'module';

    moduleDiv.appendChild(createHeading('h3', moduleData['Module Title']));
    moduleDiv.appendChild(createParagraph(moduleData['Module Overview']));

    const topicsList = createList(moduleData['Key Topics']);
    moduleDiv.appendChild(createSubSection('Key Topics', topicsList));

    const detailsButton = document.createElement('button');
    detailsButton.textContent = 'Show Details';
    detailsButton.className = 'toggle-details';
    moduleDiv.appendChild(detailsButton);

    const detailsDiv = document.createElement('div');
    detailsDiv.className = 'module-details';
    detailsDiv.style.display = 'none';

    // Detailed Content
    const detailedContent = createSubSection('Detailed Content');
    Object.entries(moduleData['Detailed Content']).forEach(([topic, content]) => {
        detailedContent.appendChild(createHeading('h5', topic));
        detailedContent.appendChild(createParagraph(content));
    });
    detailsDiv.appendChild(detailedContent);

    // Examples
    const examplesList = createList(Object.values(moduleData['Examples']));
    detailsDiv.appendChild(createSubSection('Examples', examplesList));

    moduleDiv.appendChild(detailsDiv);

    // Add event listener to toggle button
    detailsButton.addEventListener('click', function() {
        if (detailsDiv.style.display === 'none') {
            detailsDiv.style.display = 'block';
            this.textContent = 'Hide Details';
        } else {
            detailsDiv.style.display = 'none';
            this.textContent = 'Show Details';
        }
    });

    modulesSection.appendChild(moduleDiv);
}

function addQuizButton() {
    const courseContent = document.getElementById('course-content');
    const quizSection = document.createElement('section');
    quizSection.id = 'quiz-section';
    
    sessionStorage.setItem('topic', topic);

    const quizButton = document.createElement('button');
    quizButton.textContent = 'Start Quiz';
    quizButton.id = 'start-quiz-button';
    quizButton.addEventListener('click', function() {
        window.location.href = '/quiz';
    });

    quizSection.appendChild(createHeading('h2', 'Test Your Knowledge'));
    quizSection.appendChild(createParagraph('Ready to test what you\'ve learned? Take the quiz!'));
    quizSection.appendChild(quizButton);

    courseContent.appendChild(quizSection);
}

document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('save-pdf-button').addEventListener('click', async function () {
        const courseContent = document.getElementById('course-content');
        if (!courseContent) {
            alert("No course content found!");
            return;
        }

        // Expand all "Show Details" sections
        const toggleButtons = document.querySelectorAll('.toggle-details');
        toggleButtons.forEach(button => {
            if (button.textContent === 'Show Details') {
                button.click();
            }
        });

        // Wait for content to fully expand
        setTimeout(async () => {
            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF();

            try {
                const canvas = await html2canvas(courseContent, { scale: 2 });
                const imgData = canvas.toDataURL('image/png');

                // PDF dimensions
                const pdfWidth = pdf.internal.pageSize.getWidth();
                const pdfHeight = pdf.internal.pageSize.getHeight();

                // Image dimensions
                const imgWidth = pdfWidth;
                const imgHeight = (canvas.height * pdfWidth) / canvas.width;

                let heightLeft = imgHeight;
                let position = 0;

                // Add the first page
                pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                heightLeft -= pdfHeight;

                // Add remaining pages
                while (heightLeft > 0) {
                    position -= pdfHeight;
                    pdf.addPage();
                    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                    heightLeft -= pdfHeight;
                }

                pdf.save('course-content.pdf');
            } catch (error) {
                console.error('Error generating PDF:', error);
                alert('An error occurred while generating the PDF.');
            }
        }, 500); // Wait 500ms to ensure content is fully expanded
    });
});
