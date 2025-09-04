# Nara AI 🎥🤖

Nara AI transforms your PPTX files into fully narrated video presentations.

1. Simply upload your slides.
2. Let Nara generate your own script.
3. Feel free to edit or re-generate the script as many times as you like.
4. Select any of provided voices to narrate your script.
5. Check how the selected voice sounds in each slide (you can try experimenting as many voices as you like).
6. Once you're happy with the script and the voice, relax and let Nara generate a professional-quality video that feels just like a real presentation.
7. Once the video is generated, you can view it directly from the Nara's UI and feel free to download it.

---

## ✨ Features

- 📂 **Upload PPTX** – Start with your presentation file.
- 📝 **Auto Script Generation** – Generates draft narration for each slide.
- ✏️ **Script Editing** – Edit and refine the text to fit your style.
- 🗣️ **Voice Selection** – Pick from a range of realistic AI voices.
- 🎬 **Video Generation** – Automatically sync narration with slides.
- ⬇️ **Download Video** – Export your final narrated presentation.

---

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/PhongDiep2003/Nara-AI.git
cd nara-ai
```

### 2. Run the application

**Backend (FastAPI):**

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python app.py
python agents.py
```

**Frontend (React + Next.js):**

```bash
npm run dev
```

The app will be available at:  
👉 Frontend: `http://localhost:3000`  
👉 API: `http://localhost:8000`

---

## 🎥 Live Demo

🔗 [Nara AI Live Demo Video](https://youtu.be/to1NT76hK_c)

---

## 🛠️ Tech Stack

- **Frontend:** React, Next.js, TypeScript, TailwindCSS
- **Backend:** FastAPI, Python, FFMPEG, Uagents, LibreOffice, pdftoppm
- **AI/ML:** OpenAI, TTS
