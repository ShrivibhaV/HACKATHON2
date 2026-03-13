import shutil
import os

src = r"C:\Users\Shrivibha V\.gemini\antigravity\brain\5ee36372-ceb8-4acf-9107-bf836413462a\neurodiversity_brain_puzzle_icon_1773401179351.png"
dst = r"c:\Users\Shrivibha V\Desktop\HACKATHON\HACKATHON2\public\puzzle-icon.png"

try:
    if os.path.exists(src):
        # Ensure destination directory exists
        os.makedirs(os.path.dirname(dst), exist_ok=True)
        shutil.copy(src, dst)
        print(f"Copied {src} to {dst}")
    else:
        print(f"Source file not found: {src}")
except Exception as e:
    print(f"Error: {e}")
