# Inmutabilidad de auditorías en producción

La migración crea `auditorias_clinicas`, pero no asigna permisos a un usuario fijo:
`DB_USERNAME` cambia entre instalaciones y una migración genérica no debe asumirlo.

Después de desplegar, ejecutá como propietario/administrador de PostgreSQL, sustituyendo
`NOMBRE_USUARIO_APP` por el valor real de `DB_USERNAME`:

```sql
REVOKE UPDATE, DELETE ON TABLE auditorias_clinicas FROM NOMBRE_USUARIO_APP;
GRANT INSERT ON TABLE auditorias_clinicas TO NOMBRE_USUARIO_APP;
```

El usuario debe conservar los permisos necesarios para que Flyway cree tablas durante
el despliegue inicial, o las migraciones deben ejecutarse con un usuario administrador
separado. No se agregó un endpoint para leer, modificar o eliminar auditorías.
