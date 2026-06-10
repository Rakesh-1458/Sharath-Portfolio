import http.server
import socketserver
import os
import sys
import json

PORT = 8000
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

# Try to initialize Firebase
firebase_enabled = False
try:
    import firebase_admin
    from firebase_admin import credentials
    from firebase_admin import firestore

    cred_path = os.path.join(DIRECTORY, "firebase-key.json")
    if os.path.exists(cred_path):
        cred = credentials.Certificate(cred_path)
        firebase_admin.initialize_app(cred)
        print("Firebase Admin initialized successfully.")
        firebase_enabled = True
    else:
        print("Warning: firebase-key.json not found. Contact form submissions will not save to Firebase.")
except Exception as e:
    print(f"Warning: Firebase initialization failed: {e}")
    print("Running server without Firebase features.")

class MyHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def do_POST(self):
        if self.path == '/api/contact':
            if not firebase_enabled:
                self.send_response(503)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({"error": "Firebase backend not initialized. Ensure firebase-key.json exists and firebase-admin is installed."}).encode('utf-8'))
                return

            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            
            try:
                data = json.loads(post_data.decode('utf-8'))
                name = data.get('name')
                email = data.get('email')
                message = data.get('message')
                
                if not name or not email or not message:
                    self.send_response(400)
                    self.send_header('Content-type', 'application/json')
                    self.end_headers()
                    self.wfile.write(json.dumps({"error": "Missing required fields (name, email, message)"}).encode('utf-8'))
                    return
                
                # Save to Firebase Firestore
                db = firestore.client()
                doc_ref = db.collection('messages').document()
                doc_ref.set({
                    'name': name,
                    'email': email,
                    'message': message,
                    'timestamp': firestore.SERVER_TIMESTAMP
                })
                
                self.send_response(200)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({"status": "success", "message": "Message saved successfully"}).encode('utf-8'))
            except Exception as e:
                self.send_response(500)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({"error": str(e)}).encode('utf-8'))
        else:
            self.send_response(444)
            self.end_headers()

def start_server():
    # Make sure we change directory to the folder containing this file
    os.chdir(DIRECTORY)
    
    # Avoid address already in use error
    socketserver.TCPServer.allow_reuse_address = True
    
    try:
        with socketserver.TCPServer(("", PORT), MyHTTPRequestHandler) as httpd:
            print(f"\n==================================================")
            print(f"   Sharath Chandra Pabba - Portfolio Dev Server   ")
            print(f"==================================================")
            print(f"   URL: http://localhost:{PORT}")
            print(f"   Directory: {DIRECTORY}")
            print(f"   Firebase Integration: {'ENABLED' if firebase_enabled else 'DISABLED'}")
            print(f"   Press Ctrl+C to stop the server.")
            print(f"==================================================\n")
            httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nServer stopped by user.")
        sys.exit(0)
    except Exception as e:
        print(f"Error starting server: {e}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    start_server()
