# REIS

## Instrucciones de instalación

Instalar Bun

Para instalar Bun en Linux o macOS, ejecuta el siguiente comando:

```bash
curl -fsSL https://bun.sh/install | bash
```

Para más detalles, revisa la [documentación de instalacion de Bun](https://bun.sh/docs/installation).

Clona el repositorio:

```bash
git clone https://github.com/Thesportydar/reis-app
```

Navega al directorio del proyecto:

```bash
cd reis-app
```

Para instalar las dependencias, ejecuta:

```bash
bun install
```

Para construir el proyecto, utiliza:

```bash
bun --bun run build
```
(la opción `--bun` es para asegurarse de que la construcción se realice con Bun y no con Node).

Para iniciar el servidor, ejecuta:

```bash
bun start
```
Esto ejecutará `./dist/server/entry.mjs`.

## Variables de entorno

- **AUTH_SECRET**: Clave secreta para la autenticación.
- **AUTH_TRUST_HOST**: Establece si se debe confiar en el host (puede ser `true` o `false`).
- **AUTH_GOOGLE_ID**: Tu ID de cliente de Google para la autenticación.
- **AUTH_GOOGLE_SECRET**: Tu secreto de cliente de Google para la autenticación.
- **GITHUB_CLIENT_ID**: Tu ID de cliente de GitHub.
- **GITHUB_CLIENT_SECRET**: Tu secreto de cliente de GitHub.
- **DISCORD_CLIENT_ID**: Tu ID de cliente de Discord.
- **DISCORD_CLIENT_SECRET**: Tu secreto de cliente de Discord.
- **HOST**: La dirección IP del host. Si no se especifica, se utilizará `0.0.0.0`.
- **PORT**: El puerto en el que el servidor escuchará (por defecto es `4321`).
- **AUTH_RESEND_KEY**: Tu clave de Resend para enviar magic links.
- **FROM_EMAIL**: El correo electrónico desde el cual se enviarán los magic links de Resend.
- **UPLOADS_DIR**: Directorio donde se subirán los archivos adjuntos de los usuarios
- **DATABASE_URL**: Ruta a la base de datos SQLite

## Notas
- Para las opciones de OAuth se deben configurar en las respectivas paginas los origenes autorizados de javascript y la url de callback. La direccion http://127.0.0.1:4321 ya se encuentra autorizada en los 3 providers que vienen en el env file por defecto.
- Para usar Resend se deben configurar algunos registros dns(1 mx y 2 txt) de los cuales resend enviara los codigos de inicio de sesion. Se debe indicar y validad ademas el dominio en la pagina de resend.
- Se incluye un env file para probar la app.