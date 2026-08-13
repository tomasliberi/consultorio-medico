# Consultorio Médico

<p align="center">
  <img src="frontend/public/logo-fl.svg" alt="Logo del consultorio" width="110" />
</p>

Aplicación web para la gestión privada de un consultorio de medicina estética. Centraliza pacientes, historias clínicas, consultas y procedimientos en una interfaz simple, con una API REST protegida y persistencia en PostgreSQL.

> [!IMPORTANT]
> El proyecto se encuentra en etapa MVP. Antes de usarlo con datos clínicos reales se deben revisar la seguridad, la privacidad, los respaldos y los requisitos legales aplicables.

## Funcionalidades

- Inicio de sesión y acceso protegido mediante HTTP Basic.
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

Para desarrollo local se crea automáticamente este usuario si todavía no existe:

```text
Usuario: admin
Contraseña: admin123
```

Las credenciales se pueden reemplazar con variables de entorno:

```text
INITIAL_USER_USERNAME
INITIAL_USER_PASSWORD
```

## Configuración

El backend admite las siguientes variables de entorno:

| Variable | Valor local predeterminado |
| --- | --- |
| `DB_URL` | `jdbc:postgresql://localhost:5433/consultorio` |
| `DB_USERNAME` | `consultorio_user` |
| `DB_PASSWORD` | `consultorio_password` |
| `INITIAL_USER_USERNAME` | `admin` |
| `INITIAL_USER_PASSWORD` | `admin123` |

Los valores incluidos son únicamente para desarrollo local. No deben reutilizarse en producción.

## API

Todos los endpoints requieren autenticación HTTP Basic.

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
