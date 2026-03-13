import urllib.request
import os

url = "https://thumbs.dreamstime.com/b/child-autism-jigsaw-puzzle-symbol-head-profile-silhouette-spectrum-disorders-neurodiversity-awareness-198043395.jpg"
output_path = r"c:\Users\Shrivibha V\Desktop\HACKATHON\HACKATHON2\public\puzzle-icon.png"

try:
    print(f"Downloading {url} to {output_path}")
    urllib.request.urlretrieve(url, output_path)
    print("Download successful")
except Exception as e:
    print(f"Error: {e}")
