import uvicorn
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

if __name__ == "__main__":
    from app.core.config import settings
    port = int(os.environ.get("PORT", settings.PORT))
    host = os.environ.get("HOST", settings.HOST)
    print(f"Starting {settings.APP_NAME} server on http://{host}:{port}")
    uvicorn.run("app.main:app", host=host, port=port, reload=False)
