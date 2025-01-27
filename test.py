import requests
import base64
from datetime import datetime

# Your credentials
CLIENT_ID = "1a90b3e89656487492a78fd2fde956ba"
CLIENT_SECRET = "1fd8e86f6b2f4c1496ac0a3aebd929d3"

def get_auth_code():
    print("Please visit this URL to authorize the application:")
    auth_url = (
        "https://accounts.spotify.com/authorize"
        f"?client_id={CLIENT_ID}"
        "&response_type=code"
        "&redirect_uri=http://localhost:3000/callback"
        "&scope=user-read-recently-played"
    )
    print(auth_url)
    return input("\nEnter the 'code' value from the URL after authorizing: ")

def test_spotify_recent():
    print("Testing Spotify Recently Played...")
    
    # Step 1: Get authorization code
    auth_code = get_auth_code()
    
    # Step 2: Get access token
    token_url = "https://accounts.spotify.com/api/token"
    auth_header = base64.b64encode(f"{CLIENT_ID}:{CLIENT_SECRET}".encode()).decode()
    
    token_data = {
        "grant_type": "authorization_code",
        "code": auth_code,
        "redirect_uri": "http://localhost:3000/callback"
    }
    
    token_headers = {
        "Authorization": f"Basic {auth_header}",
        "Content-Type": "application/x-www-form-urlencoded"
    }
    
    try:
        # Get token
        token_response = requests.post(token_url, headers=token_headers, data=token_data)
        token_response.raise_for_status()
        
        access_token = token_response.json()["access_token"]
        print("\n✅ Successfully got access token!")
        
        # Get recently played tracks
        recent_url = "https://api.spotify.com/v1/me/player/recently-played?limit=5"
        headers = {
            "Authorization": f"Bearer {access_token}"
        }
        
        response = requests.get(recent_url, headers=headers)
        response.raise_for_status()
        
        print("\n✅ Successfully fetched recently played tracks!\n")
        print("Your 5 most recently played tracks:")
        print("-" * 50)
        
        for item in response.json()["items"]:
            track = item["track"]
            played_at = datetime.fromisoformat(item["played_at"].replace("Z", "+00:00"))
            played_at_str = played_at.strftime("%Y-%m-%d %H:%M:%S")
            
            print(f"Track: {track['name']}")
            print(f"Artist: {track['artists'][0]['name']}")
            print(f"Played at: {played_at_str}")
            print("-" * 50)
        
    except requests.exceptions.RequestException as e:
        print("\n❌ Error occurred:")
        print(f"Error type: {type(e).__name__}")
        print(f"Error message: {str(e)}")
        if hasattr(e, 'response') and e.response is not None:
            try:
                print("\nDetailed error message:")
                print(e.response.json())
            except:
                print(e.response.text)
        return False

if __name__ == "__main__":
    test_spotify_recent()
