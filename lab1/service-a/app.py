from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def root():
    return {"service": "A", "message": "Hello from Service A!"}