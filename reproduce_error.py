import asyncio
import httpx

async def test_payment():
    # 1. Obtener Token (Login como admin)
    async with httpx.AsyncClient() as client:
        login_res = await client.post(
            "http://localhost:8000/api/v1/auth/login/access-token",
            data={"username": "admin@mindguard.ai", "password": "admin123"}
        )
        token = login_res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # 2. Obtener un profesional
        pros_res = await client.get("http://localhost:8000/api/v1/premium/professionals", headers=headers)
        pros = pros_res.json()
        if not pros:
            print("No hay profesionales")
            return
        pro_id = pros[0]["id"]

        # 3. Intentar el pago
        print(f"Intentando activar prueba con Profesional ID: {pro_id}...")
        pay_res = await client.post(
            "http://localhost:8000/api/v1/premium/payment/mock",
            json={"id_profesional": pro_id, "monto": 0, "metodo": "prueba"},
            headers=headers
        )
        
        print(f"Status Code: {pay_res.status_code}")
        print(f"Response: {pay_res.text}")

if __name__ == "__main__":
    asyncio.run(test_payment())
