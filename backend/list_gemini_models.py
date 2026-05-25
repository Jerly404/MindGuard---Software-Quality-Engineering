import asyncio
import os

from dotenv import load_dotenv

load_dotenv()


async def list_models():
    api_key = os.getenv("GOOGLE_API_KEY")
    try:
        from google import genai

        client = genai.Client(api_key=api_key)
        print("Modelos disponibles:")
        for model in client.models.list():
            print(f"- {model.name}")
    except Exception as e:
        print(f"ERROR: {str(e)}")


if __name__ == "__main__":
    asyncio.run(list_models())
