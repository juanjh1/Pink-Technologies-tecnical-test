# Pink Technologies API

Esta aplicacion se conecta con la API externa de **CoinGecko** y su funcion principal es convertir precios de criptomonedas de **USD a pesos colombianos (COP)**.

## Requisitos

- Node.js 20+
- MySQL
- pnpm

## Variables de entorno

Crea un archivo `.env` usando `.env.example`:

```env
DB_USER=""
DB_PASSWORD=""
DB_NAME=""
GECKO_KEY=""
JWT_SECRET=""
BCRYPT_SALT_ROUNDS="10"
USD_TO_COP_RATE="4000"
```

## Como ejecutar

1. Instalar dependencias:
```bash
pnpm install
```

2. Compilar:
```bash
pnpm run build
```

3. Ejecutar:
```bash
pnpm start
```

Servidor por defecto: `http://localhost:8100`

## Autenticacion

La API usa JWT.

1. Login:
- `POST /auth/login`
- Body:
```json
{
  "username": "usuario",
  "password": "password"
}
```

2. Usar token en endpoints protegidos:
- Header: `Authorization: Bearer <token>`

## Endpoint principal de conversion

- `GET /coins/convert?coins=bitcoin,ethereum&amount=2`
- Requiere token JWT

La conversion se hace en el servicio con multiplicacion:
- `totalUsd = unitPriceUsd * amount`
- `totalCop = totalUsd * USD_TO_COP_RATE`

## Otros endpoints

- `POST /users` crear usuario
- `GET /users` protegido
- `GET /users/:id` protegido
- `PUT /users/:id` protegido
- `DELETE /users/:id` protegido

## Arquitectura 

Para el proyecto se hablaba de una arquitectura por capas asi que la use 
ya que me premite manejar errores con monads y tambien me permite usar 
un estilo hibrydo entre poo y funcional.

Para el manejo de errores como dije use monads, pero tambien try catch

## Inversion de dependencias 

La verdad para el proyecto, intente usar algo de inversion de dependencias pero
por el tiempo que me tomo planear la arquitectura, no alcance a dejarlo clean
me enfoque mas que todo en que el endpoint que iba a utilizar funcionara y que la 
aplicacion fuera "segura" en temas de Autenticacion y Authorization.

#Deployment 
El Deployment se hizo en azure tal y como se pidio, se uso un virtual machine
ya que no se esta trabajando con mucho storage, no estamos usando nigun storage 
externo.
