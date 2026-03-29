# Staging Deployment (No Server)

This setup runs your staging environment locally using Docker Compose.

## Includes

- `discovery-service` (Eureka)
- `config-service` (Spring Cloud Config Server)
- `auth-service`
- `product-service`
- `map-service`
- `user-service`
- `gateway-service`
- `frontend` (Nginx static hosting)
- MySQL
- MongoDB

## Prerequisites

- Docker Desktop installed and running
- Ports available: `8088`, `8762`, `8889`, `5174`, `3307`, `27018`

## 1) Create staging env file

Copy `.env.staging.example` to `.env.staging` and set strong secrets.

```powershell
Set-Location "C:\Users\user\Desktop\SuperCenterProductNavigation"
Copy-Item ".env.staging.example" ".env.staging"
```

If your machine already uses MySQL/Mongo ports, keep defaults (`3307`, `27018`) or set custom values in `.env.staging`:

```dotenv
MYSQL_HOST_PORT=3307
MONGO_HOST_PORT=27018
DISCOVERY_HOST_PORT=8762
CONFIG_HOST_PORT=8889
GATEWAY_HOST_PORT=8088
FRONTEND_HOST_PORT=5174
```

## 2) Start staging stack

```powershell
Set-Location "C:\Users\user\Desktop\SuperCenterProductNavigation"
docker compose --env-file .env.staging -f docker-compose.staging.yml up -d --build
```

## 3) Check status

```powershell
docker compose --env-file .env.staging -f docker-compose.staging.yml ps
```

## 4) Verify endpoints

```powershell
Invoke-WebRequest -Uri "http://localhost:8762" -UseBasicParsing | Select-Object -ExpandProperty StatusCode
Invoke-WebRequest -Uri "http://localhost:8889/auth-service/default" -UseBasicParsing | Select-Object -ExpandProperty StatusCode
Invoke-WebRequest -Uri "http://localhost:8088/api/v1/auth/login" -Method Post -ContentType "application/json" -Body '{"email":"admin@supercenter.mn","password":"Admin123!"}' -UseBasicParsing
Invoke-WebRequest -Uri "http://localhost:5174" -UseBasicParsing | Select-Object -ExpandProperty StatusCode
```

## 5) Stop staging stack

```powershell
docker compose --env-file .env.staging -f docker-compose.staging.yml down
```

## Optional: remove volumes (DB data)

```powershell
docker compose --env-file .env.staging -f docker-compose.staging.yml down -v
```

## Notes

- `config-service` reads from `backend/config-repo` mounted into the container.
- Default API entry point is `gateway-service` on `http://localhost:8088`.
- Frontend staging entry point is `http://localhost:5174`.
- If you change config files under `backend/config-repo`, restart `config-service`.




