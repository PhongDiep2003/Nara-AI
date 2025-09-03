from fastapi import FastAPI, Body, UploadFile, File
import json
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import requests
import base64
from openai import OpenAI 
from pathlib import Path
from dotenv import load_dotenv
import os
import subprocess
from pptx import Presentation
import aspose.slides as slides
import aspose.pydrawing as drawing
import shutil

# Load environment variables from .env file
load_dotenv()
api_key = os.getenv("OPENAI_API_KEY")
client = OpenAI(api_key=api_key)

AGENT_ADDRESS = "agent1qtu6wt5jphhmdjau0hdhc002ashzjnueqe89gvvuln8mawm3m0xrwmn9a76"

class VoiceRequest(BaseModel):
    text: str
    voice: str
    speech_rate: str
    slide_number:str


class FileRequest(BaseModel):
    file_data: str
    file_name: str
    file_type: str

app = FastAPI()
origins = ["*"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/") 
def root():
  return {"message": "Hello World"}


def send_file_to_agent(file_payload: FileRequest):
    """
    Uses built-in query from uagents 
    """
    try:
        response = requests.post("http://0.0.0.0:8080/rest/post", json=file_payload.dict())

        print(response)
    except Exception as e:
        print(f"Query failed: {e}")
        return None


@app.post("/upload-file")
async def upload_file(file: UploadFile=File(...)):
    """
    Endpoint to upload a file and send it to the agent.
    """
    try:
        # Create a folder to store the uploaded file and rename it to input.pptx
        script_path = Path(__file__).parent / "script_output"
        
        pptx_dir = Path(__file__).parent / "pptx"
        pptx_dir.mkdir(exist_ok=True)
        file_path = pptx_dir / "input.pptx"
        with file_path.open("wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        file.file.seek(0)  # Reset file pointer to the beginning
        file_data = await file.read()

        file_payload = FileRequest(
            file_data=base64.b64encode(file_data).decode('utf-8'),
            file_name=file.filename,
            file_type=file.content_type or "unknown"
        )

        send_file_to_agent(file_payload)
        
        # wait for the script_output directory to be created along with the script file by the agent and then return its content
        script_filepath = script_path / "script.txt"
        
        while not script_filepath.exists():
            pass
        # at this point, the script.txt should be created
        content = script_filepath.read_text(encoding='utf-8')
        return {"message": "File sent to agent successfully", "response": content}

    except Exception as e:
        return {"error": str(e)}

@app.post("/text-to-speech")
async def text_to_speech(request: VoiceRequest):
    """
    Endpoint to convert text to speech """
    try:
        speech_dir = Path(__file__).parent / ".." / "public" / "script_speech"
        speech_dir.mkdir(exist_ok=True)
        speech_file_path = speech_dir / f"speech_slide_{request.slide_number}.mp3"

        with client.audio.speech.with_streaming_response.create(
            model="gpt-4o-mini-tts",
            voice=request.voice,
            input=request.text,
            instructions=f'Speak clearly and at pace ${request.speech_rate}'

        ) as response:
            response.stream_to_file(speech_file_path)
            return {"message": "Text to speech converted successfully"}

        
    except Exception as e:
        return {"error": str(e)}


@app.post("/final-presentation-generation")
async def final_presentation_generation():
    """
    Endpoint to generate final presentation video
    """
    pptx_file = Path(__file__).parent / "pptx" / "input.pptx"
    if not pptx_file.exists():
        return {"error": "PPTX file not found"}
    
    # Prepare the output directory
    slides_dir = Path(__file__).parent / "slides_png"
    slides_dir.mkdir(exist_ok=True)

    try:
        # ########################
        # Method 1. PPTX > PDF > PNG. Free but quality is distorted
        ##########################
        # Export slides as images using LibreOffice
        subprocess.run([
            "soffice", "--headless", "--convert-to", "pdf", pptx_file, "--outdir", slides_dir
        ])

        pdf_file = slides_dir / "input.pdf"

        subprocess.run([
            "pdftoppm", pdf_file, Path(slides_dir) / "slide", "-png", "-r", "300", "-aa", "yes", "-aaVector", "yes"
        ])
        
        # Delete the original PDF file
        pdf_file.unlink(missing_ok=True)
        

        # Loop throught the existing generated audio files and extract the filename
        audio_files = [str(f) for f in (Path(__file__).parent / ".." / "public" / "script_speech").glob("*.mp3")]

        # Loop through the slide images
        slide_images = [str(f) for f in (Path(__file__).parent / "slides_png").glob("*.png")]
        if len(audio_files) != len(slide_images):
            return {"error": "Mismatch between number of audio files and slide images"}
    
        # Map audio files to slide images
        video_files = []
        videos_dir = Path(__file__).parent / "videos"
        videos_dir.mkdir(exist_ok=True)
        for i, (audio, img) in enumerate(zip(sorted(audio_files), sorted(slide_images)), start=1):
            video_file = videos_dir / f"slide_{i}.mp4"
            subprocess.run([
                "ffmpeg", "-y", "-loop", "1", "-i", str(img), "-i", str(audio), "-c:v", "libx264", "-tune", "stillimage", "-c:a", "aac", "-b:a", "192k", "-vf", "scale=1500:1124", "-pix_fmt", "yuv420p", "-shortest", str(video_file)
            ])
            video_files.append(video_file)
        
        # Combine all video files into one final video
        file_list = Path(__file__).parent / "file_list.txt"
        with file_list.open("w") as f:
            for v in video_files:
                f.write(f"file '{v}'\n")
        
        final_video = Path(__file__).parent / ".." / "public" / "final_presentation.mp4"
        subprocess.run([
            "ffmpeg", "-y", "-f", "concat", "-safe", "0", "-i", str(file_list), "-c", "copy", str(final_video)
        ])   
        return {"message": "Final presentation video generated successfully", "video_path": str(final_video)}


    
    except Exception as e:
        return {"error": str(e)}
    

@app.get("/clean-up")
def clean_up():
    try:
        # Remove all generated files and directories
        pptx_dir = Path(__file__).parent / "pptx"
        file_list = Path(__file__).parent / "file_list.txt"
        slides_dir = Path(__file__).parent / "slides_png"
        videos_dir = Path(__file__).parent / "videos"
        speech_dir = Path(__file__).parent / ".." / "public" / "script_speech"
        final_video = Path(__file__).parent / ".." / "public" / "final_presentation.mp4"
        pptx_dir = Path(__file__).parent / "pptx"
        script_path = Path(__file__).parent / "script_output"
        
        shutil.rmtree(script_path, ignore_errors=True)
        shutil.rmtree(pptx_dir, ignore_errors=True)
        file_list.unlink(missing_ok=True)
        shutil.rmtree(slides_dir, ignore_errors=True)
        shutil.rmtree(videos_dir, ignore_errors=True)
        shutil.rmtree(speech_dir, ignore_errors=True)
        final_video.unlink(missing_ok=True)
        shutil.rmtree(pptx_dir, ignore_errors=True)
        return {"message": "Clean up successful"}
    except Exception as e:
        return {"error": str(e)}







if __name__ == "__main__":
    import uvicorn
    uvicorn.run('app:app', host="0.0.0.0", port=8000, reload=True)

# To run the FastAPI app, use the command:  
# uvicorn app:app --reload


