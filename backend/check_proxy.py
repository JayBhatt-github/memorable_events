import os
import requests
import sys

def check_connectivity():
    print("--- Checking Environment Variables ---")
    print(f"HTTP_PROXY: {os.environ.get('HTTP_PROXY')}")
    print(f"HTTPS_PROXY: {os.environ.get('HTTPS_PROXY')}")
    print(f"http_proxy: {os.environ.get('http_proxy')}")
    print(f"https_proxy: {os.environ.get('https_proxy')}")
    
    print("\n--- Checking Connectivity ---")
    
    targets = [
        ("Google", "https://www.google.com"),
        ("Cloudinary", "https://api.cloudinary.com"),
        ("ImgBB", "https://api.imgbb.com")
    ]
    
    for name, url in targets:
        print(f"Testing connection to {name} ({url})...")
        try:
            response = requests.get(url, timeout=10)
            print(f"  SUCCESS! Status Code: {response.status_code}")
        except Exception as e:
            print(f"  FAILURE: {e}")

if __name__ == "__main__":
    check_connectivity()
