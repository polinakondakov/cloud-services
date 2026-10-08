from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def root():
    return {"service": "B", "message": "Hello from Service B!"}