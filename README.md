# FARMART API

## Frontend
Create the React App
```
npm create vite@latest farmart-frontend
cd farmart-frontend
npm install
npm run dev
```

## Backend
Create and activate virtual environment:
```
cd farmart-backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Visit
```
http://127.0.0.1:8000/docs
```