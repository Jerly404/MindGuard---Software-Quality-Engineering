import os

from dotenv import load_dotenv
from groq import Groq

load_dotenv()


def test_groq():
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        print("ERROR: No se encontró GROQ_API_KEY en el .env")
        return

    print(f"Probando Groq con llave: {api_key[:10]}...")
    try:
        client = Groq(api_key=api_key)
        completion = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": "Eres un asistente de prueba."},
                {"role": "user", "content": "Responde solo con: GROQ FUNCIONA"},
            ],
        )
        print(f"Respuesta: {completion.choices[0].message.content}")
    except Exception as e:
        print(f"ERROR: {str(e)}")


if __name__ == "__main__":
    test_groq()
