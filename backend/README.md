# Consultorio Backend

Backend MVP para una aplicacion privada de gestion de consultorio medico.

## Stack

- Java 17
- Spring Boot 3
- Spring Web
- Spring Data JPA
- Spring Security
- PostgreSQL

## Capas

- `model`: entidades JPA que representan tablas.
- `repository`: interfaces de acceso a base de datos.
- `service`: logica de negocio.
- `controller`: endpoints REST.
- `dto`: objetos de entrada y salida para no exponer entidades directamente.
- `config`: configuracion de seguridad y datos iniciales.
- `exception`: errores controlados de la API.

## Base de datos local

Desde la raiz del proyecto:

```bash
docker compose up -d
```

Esto levanta PostgreSQL en:

```text
localhost:5433
database: consultorio
user: consultorio_user
password: definida mediante `DB_PASSWORD`
```

## Usuario inicial

No se crea ningún usuario predeterminado. El alta inicial requiere definir explícitamente `INITIAL_USER_ENABLED=true`, `INITIAL_USER_USERNAME` e `INITIAL_USER_PASSWORD`. Eliminá esas variables después del primer arranque.

## Comandos con Maven local

Si Maven no esta instalado globalmente, en este proyecto se puede usar el Maven descargado en `.tools`.

Desde `backend`:

```powershell
.\test.ps1
.\run.ps1
```

O manualmente:

```powershell
..\.tools\apache-maven-3.9.9\bin\mvn.cmd test
..\.tools\apache-maven-3.9.9\bin\mvn.cmd spring-boot:run
```

Para habilitar el alta inicial una sola vez:

```bash
INITIAL_USER_ENABLED=true
INITIAL_USER_USERNAME=usuario-inicial
INITIAL_USER_PASSWORD=usar-un-secreto-largo
```

## Endpoints

Todos los endpoints de negocio requieren una sesión autenticada.

```text
POST /api/auth/login
```

```text
GET  /api/pacientes
GET  /api/pacientes?buscar=texto
GET  /api/pacientes/{id}
POST /api/pacientes
PUT  /api/pacientes/{id}
```

```text
GET /api/pacientes/{pacienteId}/historia-clinica
PUT /api/pacientes/{pacienteId}/historia-clinica
```

```text
GET  /api/pacientes/{pacienteId}/consultas
POST /api/pacientes/{pacienteId}/consultas
GET  /api/consultas/{id}
PUT  /api/consultas/{id}
```

```text
GET  /api/pacientes/{pacienteId}/procedimientos
POST /api/pacientes/{pacienteId}/procedimientos
GET  /api/procedimientos/{id}
PUT  /api/procedimientos/{id}
```

## Nota de seguridad

Este MVP ya guarda contrasenas con BCrypt y exige autenticacion para toda la API.
Mas adelante conviene agregar JWT o sesiones seguras, auditoria por usuario, baja logica y permisos mas granulares.
