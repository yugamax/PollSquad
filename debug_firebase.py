import firebase_admin
from firebase_admin import credentials, firestore
import json
import os
from datetime import datetime

def load_config():
    """Load Firebase configuration from environment or config file"""
    try:
        # Try to load from .env.local file
        env_path = os.path.join(os.path.dirname(__file__), '.env.local')
        if os.path.exists(env_path):
            print(f"Loading config from {env_path}")
            with open(env_path, 'r') as f:
                lines = f.readlines()
                config = {}
                for line in lines:
                    if '=' in line and not line.strip().startswith('#'):
                        key, value = line.strip().split('=', 1)
                        config[key] = value
                return config
        else:
            print("No .env.local file found, using environment variables")
            return {
                'NEXT_PUBLIC_FIREBASE_PROJECT_ID': os.getenv('NEXT_PUBLIC_FIREBASE_PROJECT_ID'),
                'NEXT_PUBLIC_FIREBASE_API_KEY': os.getenv('NEXT_PUBLIC_FIREBASE_API_KEY'),
                'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN': os.getenv('NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN'),
            }
    except Exception as e:
        print(f"Error loading config: {e}")
        return {}

def init_firebase():
    """Initialize Firebase Admin SDK"""
    try:
        config = load_config()
        project_id = config.get('NEXT_PUBLIC_FIREBASE_PROJECT_ID')
        
        if not project_id:
            print("❌ Project ID not found in configuration")
            print("Please ensure NEXT_PUBLIC_FIREBASE_PROJECT_ID is set in .env.local")
            return None
            
        print(f"📋 Project ID: {project_id}")
        
        # Check if already initialized
        if firebase_admin._apps:
            print("✅ Firebase already initialized")
            return firestore.client()
            
        # Try to use default credentials first (for local development)
        try:
            cred = credentials.ApplicationDefault()
            firebase_admin.initialize_app(cred, {
                'projectId': project_id
            })
            print("✅ Firebase initialized with Application Default Credentials")
        except Exception as e:
            print(f"⚠️ Application Default Credentials failed: {e}")
            
            # Try to use service account key if available
            service_key_path = os.path.join(os.path.dirname(__file__), 'firebase-service-account.json')
            if os.path.exists(service_key_path):
                print(f"📋 Using service account key: {service_key_path}")
                cred = credentials.Certificate(service_key_path)
                firebase_admin.initialize_app(cred)
                print("✅ Firebase initialized with Service Account")
            else:
                print("❌ No service account key found")
                print("Please download your Firebase service account key and save it as 'firebase-service-account.json'")
                return None
        
        return firestore.client()
        
    except Exception as e:
        print(f"❌ Error initializing Firebase: {e}")
        return None

def test_connection(db):
    """Test basic Firestore connection"""
    try:
        print("\n🔍 Testing Firestore connection...")
        
        # Try to read a simple collection
        test_ref = db.collection('test')
        docs = test_ref.limit(1).stream()
        
        # This will trigger the connection
        doc_count = len(list(docs))
        print("✅ Firestore connection successful")
        return True
        
    except Exception as e:
        print(f"❌ Firestore connection failed: {e}")
        return False

def check_polls_collection(db):
    """Check the polls collection and analyze the data"""
    try:
        print("\n📊 Analyzing 'polls' collection...")
        
        polls_ref = db.collection('polls')
        docs = list(polls_ref.stream())
        
        print(f"📈 Total documents in 'polls' collection: {len(docs)}")
        
        if len(docs) == 0:
            print("⚠️ No polls found in the database")
            return
            
        print("\n📋 Poll Analysis:")
        print("-" * 50)
        
        for i, doc in enumerate(docs[:5]):  # Analyze first 5 polls
            data = doc.to_dict()
            print(f"\n📄 Poll #{i+1} (ID: {doc.id})")
            print(f"   Title: {data.get('title', 'NO TITLE')}")
            print(f"   Owner: {data.get('ownerName', data.get('creator', 'NO OWNER'))}")
            print(f"   Visible: {data.get('visible', 'NOT SET')}")
            print(f"   Created: {data.get('createdAt', 'NO DATE')}")
            
            # Check questions structure
            questions = data.get('questions', [])
            if isinstance(questions, list):
                print(f"   Questions: {len(questions)} found")
                for j, q in enumerate(questions[:2]):  # Show first 2 questions
                    if isinstance(q, dict):
                        print(f"     Q{j+1}: {q.get('question', 'NO QUESTION TEXT')}")
                        options = q.get('options', [])
                        print(f"          Options: {len(options) if isinstance(options, list) else 'INVALID'}")
            else:
                print(f"   Questions: Invalid format - {type(questions)}")
            
            # Check for old format (single question with options at root)
            if 'options' in data:
                options = data.get('options', [])
                print(f"   Root Options: {len(options) if isinstance(options, list) else 'INVALID'} (old format)")
            
            print(f"   Total Votes: {data.get('totalVotes', 0)}")
            print(f"   Tags: {data.get('tags', [])}")
            
        if len(docs) > 5:
            print(f"\n... and {len(docs) - 5} more polls")
            
    except Exception as e:
        print(f"❌ Error checking polls collection: {e}")

def check_users_collection(db):
    """Check the users collection"""
    try:
        print("\n👥 Analyzing 'users' collection...")
        
        users_ref = db.collection('users')
        docs = list(users_ref.limit(10).stream())
        
        print(f"📈 Total users found: {len(docs)}")
        
        for i, doc in enumerate(docs[:3]):  # Show first 3 users
            data = doc.to_dict()
            print(f"\n👤 User #{i+1} (ID: {doc.id})")
            print(f"   Name: {data.get('displayName', 'NO NAME')}")
            print(f"   Email: {data.get('email', 'NO EMAIL')}")
            print(f"   Points: {data.get('points', 0)}")
            
    except Exception as e:
        print(f"❌ Error checking users collection: {e}")

def check_votes_collection(db):
    """Check the votes collection"""
    try:
        print("\n🗳️ Analyzing 'votes' collection...")
        
        votes_ref = db.collection('votes')
        docs = list(votes_ref.limit(10).stream())
        
        print(f"📈 Total votes found: {len(docs)}")
        
        for i, doc in enumerate(docs[:3]):  # Show first 3 votes
            data = doc.to_dict()
            print(f"\n🗳️ Vote #{i+1} (ID: {doc.id})")
            print(f"   Poll ID: {data.get('pollId', 'NO POLL ID')}")
            print(f"   User ID: {data.get('userUid', 'NO USER ID')}")
            print(f"   Question ID: {data.get('questionId', 'NO QUESTION ID')}")
            print(f"   Selected Options: {data.get('selectedOptions', [])}")
            
    except Exception as e:
        print(f"❌ Error checking votes collection: {e}")

def test_query_operations(db):
    """Test specific query operations that the app uses"""
    try:
        print("\n🔍 Testing Query Operations...")
        
        # Test the main query used by getFeedPolls
        print("\n1. Testing visible polls query...")
        try:
            polls_ref = db.collection('polls')
            visible_query = polls_ref.where('visible', '==', True).limit(10)
            visible_docs = list(visible_query.stream())
            print(f"   ✅ Found {len(visible_docs)} visible polls")
        except Exception as e:
            print(f"   ❌ Visible polls query failed: {e}")
        
        # Test ordering by createdAt
        print("\n2. Testing createdAt ordering...")
        try:
            polls_ref = db.collection('polls')
            ordered_query = polls_ref.order_by('createdAt', direction=firestore.Query.DESCENDING).limit(5)
            ordered_docs = list(ordered_query.stream())
            print(f"   ✅ Found {len(ordered_docs)} polls with createdAt ordering")
        except Exception as e:
            print(f"   ❌ CreatedAt ordering failed: {e}")
            
        # Test combined query (visible + ordered)
        print("\n3. Testing combined query (visible + ordered)...")
        try:
            polls_ref = db.collection('polls')
            combined_query = polls_ref.where('visible', '==', True).order_by('createdAt', direction=firestore.Query.DESCENDING).limit(5)
            combined_docs = list(combined_query.stream())
            print(f"   ✅ Found {len(combined_docs)} polls with combined query")
        except Exception as e:
            print(f"   ❌ Combined query failed: {e}")
            print(f"       This might indicate missing Firestore indexes")
            
    except Exception as e:
        print(f"❌ Error testing queries: {e}")

def main():
    """Main function"""
    print("🔥 Firebase Firestore Connection Test")
    print("=" * 40)
    
    # Load and display configuration
    config = load_config()
    project_id = config.get('NEXT_PUBLIC_FIREBASE_PROJECT_ID', 'NOT SET')
    print(f"📋 Project ID: {project_id}")
    
    if project_id == 'NOT SET':
        print("\n❌ Configuration Error!")
        print("Please ensure your Firebase configuration is set up correctly.")
        print("Create a .env.local file with your Firebase configuration.")
        return
    
    # Initialize Firebase
    db = init_firebase()
    if not db:
        print("\n❌ Failed to initialize Firebase")
        return
        
    # Test connection
    if not test_connection(db):
        print("\n❌ Failed to connect to Firestore")
        return
    
    # Analyze collections
    check_polls_collection(db)
    check_users_collection(db)
    check_votes_collection(db)
    
    # Test queries
    test_query_operations(db)
    
    print("\n✅ Firebase test completed!")
    print("\nIf you see polls in the database but they're not showing on the website:")
    print("1. Check if polls have 'visible: true'")
    print("2. Verify the questions array structure")
    print("3. Ensure Firestore indexes are created")
    print("4. Check browser console for JavaScript errors")

if __name__ == "__main__":
    main()
