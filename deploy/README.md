# Despliegue en un servidor

Esta configuración está pensada para un servidor Linux con Docker Engine y el
plugin Docker Compose. Solo publica los puertos web 80 y 443. PostgreSQL queda
aislado dentro de la red privada de Docker.

## Requisitos

- Un dominio apuntando mediante un registro DNS `A` a la IP pública del servidor.
- Puertos TCP 80 y 443 abiertos en el firewall. Para HTTP/3 también puede abrirse
  UDP 443.
- Docker Engine y Docker Compose instalados.

## Primera instalación

1. Copiar el repositorio al servidor.
2. Crear la configuración a partir del ejemplo:

   ```bash
   cp .env.production.example .env.production
   ```

3. Editar `.env.production` y colocar el dominio definitivo.
4. Crear secretos diferentes y robustos:

   ```bash
   mkdir -p secrets
   openssl rand -base64 36 > secrets/db_password.txt
   openssl rand -base64 24 > secrets/initial_user_password.txt
   chmod 600 .env.production secrets/*.txt
   ```

5. Construir e iniciar:

   ```bash
   docker compose --env-file .env.production -f compose.production.yml up -d --build
   ```

6. Consultar la contraseña inicial con acceso SSH al servidor:

   ```bash
   cat secrets/initial_user_password.txt
   ```

Caddy obtiene y renueva automáticamente el certificado HTTPS cuando el dominio
resuelve al servidor y los puertos 80/443 son accesibles.

## Actualización

```bash
git pull
docker compose --env-file .env.production -f compose.production.yml up -d --build
```

## Copia de seguridad

Crear el directorio y generar un respaldo cifrable fuera del servidor:

```bash
mkdir -p backups
docker compose --env-file .env.production -f compose.production.yml exec -T db \
  pg_dump -U consultorio_user -d consultorio -Fc > "backups/consultorio-$(date +%F-%H%M).dump"
```

Copiar los respaldos periódicamente a una ubicación externa con acceso
restringido. Una copia que nunca se probó restaurar no debe considerarse válida.

## Diagnóstico

```bash
docker compose --env-file .env.production -f compose.production.yml ps
docker compose --env-file .env.production -f compose.production.yml logs --tail=200
```

Nunca subir `.env.production`, `secrets/`, `backups/` ni datos reales a GitHub.
