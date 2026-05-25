import asyncio
import os

from dotenv import load_dotenv

load_dotenv()


async def test_gemini():
    api_key = os.getenv("GOOGLE_API_KEY")
    print(f"Probando con API Key: {api_key[:10]}...")

    try:
        from google import genai

        client = genai.Client(api_key=api_key)
        # Probamos con el modelo 1.5 Flash
        response = client.models.generate_content(
            model="gemini-1.5-flash", contents='Hola, responde con la palabra "FUNCIONANDO"'
        )
        print(f"Resultado: {response.text}")
    except Exception as e:
        print(f"ERROR: {str(e)}")


if __name__ == "__main__":
    asyncio.run(test_gemini())
