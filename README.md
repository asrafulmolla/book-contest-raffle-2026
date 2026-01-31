# 📚 Book Contest Raffle 2026

Welcome to the **Book Contest Raffle 2026** project! This application is designed to manage a book contest raffle draw, featuring an interactive UI, automated quiz data extraction from PDF, and a thrilling elimination-style raffle animation.

## 🏆 Prize
The lucky winner of the raffle draw will win a **Train Ticket**! 🎫

---

## 🚀 Getting Started

Follow these steps to get the application up and running on your local machine.

### 1. Prerequisites
Ensure you have **Python 3.10+** installed.

### 2. Setup Virtual Environment
It is recommended to use a virtual environment to manage dependencies.

```bash
# Create a virtual environment
python -m venv venv

# Activate the virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate
```

### 3. Install Dependencies
Install the required Python packages using the `requirements.txt` file:

```bash
pip install -r requirements.txt
```

### 4. Database Setup
Run the migrations to set up the SQLite database:

```bash
python manage.py migrate
```

### 5. Run the Application
Start the Django development server:

```bash
python manage.py runserver
```

Once the server is running, open your browser and navigate to `http://127.0.0.1:8000`.

---

## 📖 Features

### 🎡 Raffle Draw Process
The raffle draw uses a unique "Elimination Style" selection process:
1. **Define Range**: Set the starting and ending ticket numbers.
2. **Dynamic Elimination**: The system randomly narrows down the pool of contestants in multiple steps.
3. **Winner Announcement**: The final remaining number is declared the winner of the **Train Ticket**.

### ✨ Premium UI/UX
- **Smooth Animations**: Interactive number boxes that grow and glow during the selection process.
- **Responsive Design**: Works seamlessly on desktops and tablets.
- **Micro-interactions**: Hover effects and transitions for a premium feel.

---

## 📁 Project Structure

- `manage.py`: Django command-line utility.
- `Answer.pdf`: Source file for quiz questions and answers.
- `raffle/`:
    - `views.py`: Logic for data extraction and raffle step generation.
    - `models.py`: Database schema for storing Q&A.
    - `templates/raffle/index.html`: The main user interface.
    - `static/raffle/js/raffle.js`: JavaScript logic for animations and API calls.
    - `static/raffle/css/style.css`: Modern styling for the application.

---

## 🛠 Tech Stack
- **Backend**: Django (Python)
- **Frontend**: Vanilla JavaScript, CSS3, HTML5
- **PDF Parsing**: PyPDF2

---

Developed with ❤️ Team Polaris.
