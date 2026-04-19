// 0. Immediate Authentication Check (Run before DOM loads to prevent flickering)
const publicPages = [
    'student-login.html', 
    'admin-login.html'
];

// Get current filename and strip query parameters (like ?subject=MATHS)
const fullPath = window.location.pathname.split('/').pop() || 'index.html';
const currentPage = fullPath.split('?')[0]; 
const userSession = localStorage.getItem('becults_user');

// Redirect to signup if trying to access ANY content without session
if (!publicPages.includes(currentPage) && !userSession) {
    window.location.href = 'student-login.html';
}

// Redirect logged-in users away from login pages to dashboard
if (publicPages.includes(currentPage) && userSession) {
    try {
        const parsed = JSON.parse(userSession);
        if (parsed.isAdmin && currentPage === 'student-login.html') {
            window.location.href = 'index.html';
        } else if (!parsed.isAdmin && currentPage === 'admin-login.html') {
            window.location.href = 'part-tests.html';
        }
    } catch(e) {}
}

document.addEventListener('DOMContentLoaded', () => {

    // 0. Check User Session and Update Navbar
    const userSession = localStorage.getItem('becults_user');
    if (userSession) {
        const userData = JSON.parse(userSession);
        const signInButton = document.querySelector('.sign-in');
        const rideButton = document.querySelector('.right-utils .btn-outline');
        
        if (signInButton) {
            // Hide the ride button
            if (rideButton) {
                rideButton.style.display = 'none';
            }
            
            // Create a user profile dropdown
            const userContainer = document.createElement('div');
            userContainer.style.display = 'flex';
            userContainer.style.alignItems = 'center';
            userContainer.style.gap = '1rem';
            
            // Display user name
            const userNameDisplay = document.createElement('span');
            userNameDisplay.textContent = userData.name;
            userNameDisplay.style.color = 'var(--color-white)';
            userNameDisplay.style.fontSize = '0.95rem';
            userNameDisplay.style.cursor = 'pointer';
            userNameDisplay.addEventListener('click', () => { window.location.href = 'profile.html'; });
            
            // Create logout button
            const logoutBtn = document.createElement('button');
            logoutBtn.textContent = 'Logout';
            logoutBtn.className = 'btn btn-outline btn-pill';
            logoutBtn.style.padding = '0.5rem 1rem';
            logoutBtn.style.fontSize = '0.85rem';
            logoutBtn.addEventListener('click', () => {
                localStorage.removeItem('becults_user');
                window.location.href = 'index.html';
            });
            
            // Replace the sign-in button with user info
            signInButton.parentElement.replaceChild(userContainer, signInButton);
            userContainer.appendChild(userNameDisplay);
            userContainer.appendChild(logoutBtn);
        }
    }

    // Handle Sign-in/Sign-up with Backend Verification
    const signupForm = document.getElementById('auth-form') || document.querySelector('.auth-card form');
    if (signupForm) {
        signupForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const phone = document.getElementById('phone').value;

            if (!name || phone.length !== 10 || !email) {
                alert("Please enter a valid name, email, and 10-digit phone number.");
                return;
            }

            const isAdmin = document.body.classList.contains('admin-page');
            const apiEndpoint = isAdmin ? '/api/admin-register' : '/api/register';

            try {
                // Fetch to our Node.js Backend
                const response = await fetch(`http://localhost:5000${apiEndpoint}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, email, phone })
                });

                const data = await response.json();

                if (data.success) {
                    // Create session locally and redirect
                    localStorage.setItem('becults_user', JSON.stringify({ name, email, phone, isAdmin }));
                    window.location.href = 'index.html';
                } else {
                    alert(data.error || 'Authentication failed. Please try again.');
                }
            } catch (error) {
                console.error("Registration Error:", error);
                alert('Unable to authenticate. Please check your internet connection and ensure backend is running.');
            }
        });
    }

    // 1. PYQ Card Accordion Logic
    const pyqHeaders = document.querySelectorAll('.pyq-card-header');
    
    pyqHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const card = header.parentElement;
            const content = card.querySelector('.shifts-content');
            const icon = header.querySelector('.toggle-icon');
            
            // Toggle visibility
            content.classList.toggle('hidden');
            card.classList.toggle('active');
            
            // Adjust icon
            if (card.classList.contains('active')) {
                icon.textContent = '×';
            } else {
                icon.textContent = '+';
            }
        });
    });

    // 2. Marquee Infinite Scroll Clone Logic
    const marqueeTrack = document.getElementById('marquee-track');
    const chapters = [
        "Algebra", "Calculus", "Mechanics", "Thermodynamics", 
        "Organic Chemistry", "Kinematics", "Trigonometry", 
        "Atomic Structure", "Vectors", "Electrochemistry", "Probability", "Wave Optics"
    ];

    // Create the string sequence
    const createMarqueeContent = () => {
        return chapters.map(ch => `<span>${ch}</span> • `).join('');
    };

    // We render 4 sets to ensure smooth seamless scrolling
    if (marqueeTrack) {
        marqueeTrack.innerHTML = createMarqueeContent() + createMarqueeContent() + createMarqueeContent() + createMarqueeContent();
    }

    // 3. Test Button Interaction - Navigate to Test Page
    const createTestBtn = document.getElementById('create-test-btn');

    if (createTestBtn) {
        createTestBtn.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Navigate to test.html
            window.location.href = 'test.html';
        });
    }

    // 4. Scroll Animations Observer
    const animatedElements = document.querySelectorAll('.fade-in-up');
    
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const scrollObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // To re-trigger CSS animations, resetting styles
                entry.target.style.animationPlayState = 'running';
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    animatedElements.forEach(el => {
        // Pausing animation until visible
        el.style.animationPlayState = 'paused';
        scrollObserver.observe(el);
    });

    // 5. Video Thumbnail Frame Animation
    const thumbnailImg = document.getElementById('hero-video-thumbnail');
    if (thumbnailImg) {
        const totalFrames = 62;
        let currentFrame = 1;
        // Move your images into a 'frames' folder inside your project for this to work on other laptops
        const framePrefix = 'frames/ezgif-frame-'; 
        
        // Play at roughly 12 fps
        setInterval(() => {
            currentFrame = currentFrame >= totalFrames ? 1 : currentFrame + 1;
            const frameNumber = currentFrame.toString().padStart(3, '0');
            thumbnailImg.src = `${framePrefix}${frameNumber}.jpg`;
        }, 83); 
    }

    // 6. Part Tests Questions Logic
    let allQuestions = [];
    let selectedAnswers = {};
    let currentSubject = '';

    // Load questions from JSON
    const questionsList = document.getElementById('questions-list');
    if (questionsList) {
        fetch('questions.json')
        .then(response => response.json())
        .then(data => {
            allQuestions = data.questions;
            // Check if we need to auto-load a subject from URL parameter
            checkAndLoadSubjectFromURL();
        })
        .catch(error => console.error('Error loading questions:', error));
    }

    // Get DOM elements
    const mainView = document.getElementById('main-view');
    const questionsView = document.getElementById('questions-view');
    const resultsView = document.getElementById('results-view');
    const subjectCards = document.querySelectorAll('[data-subject]');
    const backBtn = document.getElementById('back-btn');
    const submitBtn = document.getElementById('submit-btn');
    const retakeBtn = document.getElementById('retake-btn');
    const homeBtn = document.getElementById('home-btn');
    const subjectTitle = document.getElementById('subject-title');

    // Check if subject is in URL parameter
    function checkAndLoadSubjectFromURL() {
        const params = new URLSearchParams(window.location.search);
        const subject = params.get('subject');
        if (subject && ['MATHS', 'PHYSICS', 'CHEMISTRY'].includes(subject)) {
            // Remove the parameter from URL
            window.history.replaceState({}, document.title, window.location.pathname);
            loadSubjectQuestions(subject);
        }
    }

    // Handle subject card clicks
    subjectCards.forEach(card => {
        card.addEventListener('click', (e) => {
            // Only prevent default if it's a div (not a link)
            if (card.tagName === 'DIV') {
                e.preventDefault();
                const subject = card.getAttribute('data-subject');
                loadSubjectQuestions(subject);
            }
        });
    });

    function loadSubjectQuestions(subject) {
        currentSubject = subject;
        selectedAnswers = {};

        // Filter questions by subject
        const subjectQuestions = allQuestions.filter(q => q.subject === subject);
        
        // Update title
        subjectTitle.textContent = subject;

        // Display questions
        questionsList.innerHTML = '';
        subjectQuestions.forEach((question, index) => {
            const questionElement = createQuestionElement(question, index + 1);
            questionsList.appendChild(questionElement);
        });

        // Switch views
        mainView.classList.add('hidden');
        questionsView.classList.remove('hidden');
        resultsView.classList.add('hidden');
        window.scrollTo(0, 0);
    }

    function createQuestionElement(question, questionNumber) {
        const div = document.createElement('div');
        div.className = 'question-item';
        
        let optionsHTML = question.options.map((option, index) => `
            <label class="option-label" data-question-id="${question.id}" data-option-index="${index}">
                <input type="radio" name="question-${question.id}" value="${index}" />
                <span class="option-text">${option}</span>
            </label>
        `).join('');

        div.innerHTML = `
            <div class="question-number-label">Question ${questionNumber}</div>
            <div class="question-text">${question.question}</div>
            <div class="options-container">
                ${optionsHTML}
            </div>
        `;

        // Add event listeners to options
        const optionLabels = div.querySelectorAll('.option-label');
        optionLabels.forEach(label => {
            label.addEventListener('click', function() {
                const questionId = this.getAttribute('data-question-id');
                const optionIndex = this.getAttribute('data-option-index');
                
                selectedAnswers[questionId] = parseInt(optionIndex);
                
                // Update UI
                const siblings = this.parentElement.querySelectorAll('.option-label');
                siblings.forEach(sibling => sibling.classList.remove('selected'));
                this.classList.add('selected');
            });

            // Check if this option is already selected
            const inputRadio = label.querySelector('input[type="radio"]');
            if (selectedAnswers[question.id] !== undefined && inputRadio.value == selectedAnswers[question.id]) {
                label.classList.add('selected');
                inputRadio.checked = true;
            }
        });

        return div;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const fromIndex = urlParams.get('from') === 'index';

    // Handle back button
    if (backBtn) {
        backBtn.addEventListener('click', () => {
        if (fromIndex) {
            window.location.href = 'index.html#part-tests';
        } else {
            mainView.classList.remove('hidden');
            questionsView.classList.add('hidden');
            resultsView.classList.add('hidden');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    });
    }

    // Handle submit button
    if (submitBtn) {
        submitBtn.addEventListener('click', () => {
        const subjectQuestions = allQuestions.filter(q => q.subject === currentSubject);
        const results = calculateResults(subjectQuestions);
        displayResults(results, subjectQuestions);
    });
    }

    function calculateResults(subjectQuestions) {
        let correct = 0;
        let incorrect = 0;
        let unanswered = 0;
        const detailedResults = [];

        subjectQuestions.forEach(question => {
            const selectedOption = selectedAnswers[question.id];
            let status = 'unanswered';
            let isCorrect = false;

            if (selectedOption !== undefined) {
                if (selectedOption === question.correctAnswer) {
                    correct++;
                    status = 'correct';
                    isCorrect = true;
                } else {
                    incorrect++;
                    status = 'incorrect';
                }
            } else {
                unanswered++;
            }

            detailedResults.push({
                id: question.id,
                question: question.question,
                userAnswer: selectedOption !== undefined ? question.options[selectedOption] : 'Not answered',
                correctAnswer: question.options[question.correctAnswer],
                status: status,
                isCorrect: isCorrect
            });
        });

        return {
            correct,
            incorrect,
            unanswered,
            total: subjectQuestions.length,
            detailedResults
        };
    }

    function displayResults(results, subjectQuestions) {
        const percentage = Math.round((results.correct / results.total) * 100);

        // Update score display
        document.getElementById('score-value').textContent = results.correct;
        document.getElementById('total-questions').textContent = results.total;
        document.getElementById('percentage-value').textContent = percentage;
        document.getElementById('correct-count').textContent = results.correct;
        document.getElementById('incorrect-count').textContent = results.incorrect;
        document.getElementById('unanswered-count').textContent = results.unanswered;

        // Build answer review
        const answerReview = document.getElementById('answer-review');
        answerReview.innerHTML = '';

        results.detailedResults.forEach((result, index) => {
            const answerItem = document.createElement('div');
            answerItem.className = `answer-item ${result.status}`;
            
            let content = `
                <div class="answer-number">Question ${index + 1}</div>
                <div class="question-text">${result.question}</div>
            `;

            if (result.status === 'unanswered') {
                content += `
                    <div class="answer-choice unanswered">
                        <span>⚠</span> Not answered
                    </div>
                `;
            } else if (result.status === 'correct') {
                content += `
                    <div class="answer-choice correct">
                        <span>✓</span> Your answer: ${result.userAnswer}
                    </div>
                `;
            } else {
                content += `
                    <div class="answer-choice incorrect">
                        <span>✗</span> Your answer: ${result.userAnswer}
                    </div>
                    <div class="answer-choice correct">
                        <span>✓</span> Correct answer: ${result.correctAnswer}
                    </div>
                `;
            }

            answerItem.innerHTML = content;
            answerReview.appendChild(answerItem);
        });

        // Switch views
        mainView.classList.add('hidden');
        questionsView.classList.add('hidden');
        resultsView.classList.remove('hidden');
        window.scrollTo(0, 0);
    }

    // Handle retake button
    if (retakeBtn) {
        retakeBtn.addEventListener('click', () => {
        loadSubjectQuestions(currentSubject);
    });
    }

    // Handle home button
    if (homeBtn) {
        homeBtn.addEventListener('click', () => {
        if (fromIndex) {
            window.location.href = 'index.html#part-tests';
        } else {
            mainView.classList.remove('hidden');
            questionsView.classList.add('hidden');
            resultsView.classList.add('hidden');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    });
    }
});
