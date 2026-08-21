# Consultorio Médico

<p align="center">
  <img src="frontend/public/logo-fl.svg" alt="Logo del consultorio" width="110" />
</p>

Aplicación web para la gestión privada de un consultorio de medicina estética. Centraliza pacientes, historias clínicas, consultas y procedimientos en una interfaz simple, con una API REST protegida y persistencia en PostgreSQL.

> [!IMPORTANT]
> El proyecto se encuentra en etapa MVP. Antes de usarlo con datos clínicos reales se deben revisar la seguridad, la privacidad, los respaldos y los requisitos legales aplicables.

## Funcionalidades

- Inicio de sesión mediante sesión segura, cookie `HttpOnly` y protección CSRF.
- Alta, edición, búsqueda y consulta de pacientes.
- Historia clínica individual con antecedentes, alergias y medicación habitual.
- Registro cronológico de consultas, evaluaciones y diagnósticos.
- Registro de procedimientos, productos, lotes y controles posteriores.
- Interfaz adaptable orientada al trabajo diario del consultorio.

## Tecnologías

| Capa | Tecnologías |
| --- | --- |
| Frontend | React 18, Vite 8, Lucide React, CSS |
| Backend | Java 17, Spring Boot 3, Spring Web, Spring Security, Spring Data JPA |
| Base de datos | PostgreSQL 16 |
| Infraestructura local | Docker Compose |

## Puesta en marcha

### Requisitos

- Java 17
- Maven 3.9 o superior
- Node.js y npm
- Docker con Docker Compose

### 1. Clonar el repositorio

```bash
git clone https://github.com/tomasliberi/consultorio-medico.git
cd consultorio-medico
```

### 2. Iniciar PostgreSQL

Desde la raíz del proyecto:

```bash
docker compose up -d
```

La base queda disponible en `localhost:5433`.

### 3. Iniciar el backend

Con Maven instalado globalmente:

```bash
cd backend
mvn spring-boot:run
```

Los scripts `run.ps1` y `test.ps1` son una alternativa para entornos que tengan Maven instalado localmente en `.tools/apache-maven-3.9.9`.

La API queda disponible en `http://localhost:8080/api`.

### 4. Iniciar el frontend

En otra terminal:

```bash
cd frontend
npm install
npm run dev
```

Abrir `http://localhost:5173` en el navegador.

## Acceso inicial

No existen usuarios ni contraseñas predeterminados. Para crear el primer usuario, habilitá el inicializador únicamente durante el primer arranque con `INITIAL_USER_ENABLED=true`, `INITIAL_USER_USERNAME` e `INITIAL_USER_PASSWORD`. Después del alta, eliminá esas variables y reiniciá el backend.

## Configuración

El backend admite las siguientes variables de entorno:

| Variable | Valor local predeterminado |
| --- | --- |
| `DB_URL` | `jdbc:postgresql://localhost:5433/consultorio` |
| `DB_USERNAME` | `consultorio_user` |
| `DB_PASSWORD` | Obligatoria, sin valor predeterminado |
| `INITIAL_USER_ENABLED` | `false` |
| `INITIAL_USER_USERNAME` | Sin valor predeterminado |
| `INITIAL_USER_PASSWORD` | Sin valor predeterminado |
| `CORS_ALLOWED_ORIGINS` | `http://localhost:5173` |
| `APP_ZONE_ID` | `America/Argentina/Buenos_Aires` |

Los valores de ejemplo no son secretos reales y deben reemplazarse antes de iniciar el sistema.

## Despliegue en producción

1. Creá fuera del repositorio un archivo de variables protegido y definí secretos aleatorios para la base y el usuario inicial.
2. Configurá `PUBLIC_ORIGIN` con el dominio HTTPS definitivo.
3. Si se utiliza Docker, ejecutá `docker compose --env-file /ruta/segura/produccion.env -f docker-compose.prod.yml up -d --build`.
4. Poné un proxy TLS delante de `127.0.0.1:8081`.
5. Tras el primer ingreso, eliminá las variables `INITIAL_USER_*` y recreá el backend.

PostgreSQL no publica puertos en producción. La sesión usa cookies `HttpOnly`, `Secure` y `SameSite=Strict`; las operaciones de escritura requieren CSRF.

## API

Todos los endpoints de negocio requieren una sesión autenticada.

```text
POST /api/auth/login

GET  /api/pacientes
GET  /api/pacientes?buscar=texto
GET  /api/pacientes/{id}
POST /api/pacientes
PUT  /api/pacientes/{id}

GET  /api/pacientes/{pacienteId}/historia-clinica
PUT  /api/pacientes/{pacienteId}/historia-clinica

GET  /api/pacientes/{pacienteId}/consultas
POST /api/pacientes/{pacienteId}/consultas
GET  /api/consultas/{id}
PUT  /api/consultas/{id}

GET  /api/pacientes/{pacienteId}/procedimientos
POST /api/pacientes/{pacienteId}/procedimientos
GET  /api/procedimientos/{id}
PUT  /api/procedimientos/{id}
```

## Estructura

```text
consultorio-medico/
├── backend/             API REST con Spring Boot
│   └── src/main/java/   Controladores, servicios, repositorios y modelos
├── frontend/            Aplicación React
│   ├── public/          Recursos estáticos
│   └── src/             Interfaz y estilos
└── docker-compose.yml   PostgreSQL para desarrollo local
```

## Pruebas y compilación

Backend:

```bash
cd backend
mvn test
```

Frontend:

```bash
cd frontend
npm run build
```

## Seguridad y próximos pasos

El MVP cifra las contraseñas con BCrypt y exige autenticación en toda la API. Para una instalación productiva quedan pendientes, entre otros puntos:

- Autenticación con sesiones seguras o tokens de corta duración.
- Gestión de roles y permisos.
- Auditoría de accesos y modificaciones.
- Cifrado, respaldos y políticas de retención de datos.
- Variables de entorno y secretos administrados fuera del repositorio.
- Configuración de CORS para el dominio definitivo.

## Licencia

Este repositorio no incluye actualmente una licencia de uso.
