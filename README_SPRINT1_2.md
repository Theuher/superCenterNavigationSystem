# Sprint 1 + Sprint 2 Setup

This workspace now includes a working MVP for:

- Sprint 1: JWT auth, register/login, RBAC, profile view/update
- Sprint 2: category/product/location entities and CRUD APIs
- Minimal responsive React UI for login, profile, products, and locations

## Services and ports

- `gateway-service`: `8080`
- `auth-service`: `8081`
- `product-service`: `8082`
- `map-service`: `8083`
- `user-service`: `8084`
- Frontend dev server: `5173`

## Databases

- MySQL (auth): database `auth_db`
- MongoDB (product): database `supercenter_product_db`
- MongoDB (map): database `supercenter_map_db`
- MySQL (user profile): database `user_db`

## Required environment variables

Use the same JWT secret across all backend services.

- `JWT_SECRET` (at least 32 chars)
- `AUTH_DB_URL`, `AUTH_DB_USERNAME`, `AUTH_DB_PASSWORD`
- `PRODUCT_MONGO_URI`
- `MAP_MONGO_URI`
- `USER_DB_URL`, `USER_DB_USERNAME`, `USER_DB_PASSWORD`

Optional:

- `EUREKA_ENABLED=false` (default)
- `EUREKA_DEFAULT_ZONE=http://localhost:8761/eureka`

Future integrations (prepared in config-repo):

- Redis: `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD`, `REDIS_TIMEOUT`
- RabbitMQ: `RABBITMQ_HOST`, `RABBITMQ_PORT`, `RABBITMQ_USERNAME`, `RABBITMQ_PASSWORD`, `RABBITMQ_VHOST`
- MinIO: `MINIO_ENDPOINT`, `MINIO_ACCESS_KEY`, `MINIO_SECRET_KEY`, `MINIO_BUCKET`, `MINIO_SECURE`
- Jasper/reporting: `JASPER_TEMPLATES_PATH`, `JASPER_TEMP_DIR`, `REPORT_REQUEST_QUEUE`, `REPORT_READY_QUEUE`, `REPORT_BUCKET`

## Start backend services

Run each command in a separate terminal.

```powershell
Set-Location "C:\Users\user\Desktop\SuperCenterProductNavigation\backend\discovery-service"
.\mvnw.cmd spring-boot:run
```

```powershell
Set-Location "C:\Users\user\Desktop\SuperCenterProductNavigation\backend\config-service"
$env:EUREKA_ENABLED="true"
$env:EUREKA_DEFAULT_ZONE="http://localhost:8761/eureka"
$env:CONFIG_SERVER_PROFILE="native"
.\mvnw.cmd spring-boot:run
```

```powershell
Set-Location "C:\Users\user\Desktop\SuperCenterProductNavigation\backend\auth-service"
$env:JWT_SECRET="change-me-please-change-me-please-change-me-please-change-me"
$env:AUTH_DB_URL="jdbc:mysql://localhost:3306/auth_db?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC"
$env:AUTH_DB_USERNAME="root"
$env:AUTH_DB_PASSWORD="root"
.\mvnw.cmd spring-boot:run
```

Quick checks:

```powershell
Invoke-WebRequest -Uri "http://localhost:8761" -UseBasicParsing | Select-Object -ExpandProperty StatusCode
Invoke-WebRequest -Uri "http://localhost:8888/application/default" -UseBasicParsing | Select-Object -ExpandProperty StatusCode
```

```powershell
Set-Location "C:\Users\user\Desktop\SuperCenterProductNavigation\backend\product-service"
$env:JWT_SECRET="change-me-please-change-me-please-change-me-please-change-me"
$env:PRODUCT_MONGO_URI="mongodb://localhost:27017/supercenter_product_db"
.\mvnw.cmd spring-boot:run
```

```powershell
Set-Location "C:\Users\user\Desktop\SuperCenterProductNavigation\backend\map-service"
$env:JWT_SECRET="change-me-please-change-me-please-change-me-please-change-me"
$env:MAP_MONGO_URI="mongodb://localhost:27017/supercenter_map_db"
.\mvnw.cmd spring-boot:run
```

```powershell
Set-Location "C:\Users\user\Desktop\SuperCenterProductNavigation\backend\user-service"
$env:JWT_SECRET="change-me-please-change-me-please-change-me-please-change-me"
$env:USER_DB_URL="jdbc:mysql://localhost:3306/user_db?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC"
$env:USER_DB_USERNAME="root"
$env:USER_DB_PASSWORD="root"
.\mvnw.cmd spring-boot:run
```

```powershell
Set-Location "C:\Users\user\Desktop\SuperCenterProductNavigation\backend\gateway-service"
.\mvnw.cmd spring-boot:run
```

## Start frontend

```powershell
Set-Location "C:\Users\user\Desktop\SuperCenterProductNavigation\frontend\store-navigation-frontend"
npm install
npm run dev
```

## Implemented API endpoints

Auth (`auth-service`):

- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `GET /api/v1/auth/me`
- `PATCH /api/v1/auth/me`
- `GET /api/v1/auth/users` (manager/admin)
- `PATCH /api/v1/auth/users/{id}/role` (manager/admin)

Catalog (`product-service`):

- Categories: `GET/POST /api/v1/categories`, `GET/PUT/DELETE /api/v1/categories/{id}`
- Products: `GET/POST /api/v1/products`, `GET/PUT/DELETE /api/v1/products/{id}`

Locations (`map-service`):

- `GET/POST /api/v1/locations`
- `GET/PUT/DELETE /api/v1/locations/{id}`

User profile (`user-service`):

- `GET /api/v1/users/me`
- `PUT /api/v1/users/me`

## Default admin

Created automatically at auth-service startup:

- Email: `admin@supercenter.mn`
- Password: `Admin123!`

You can override with:

- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`



