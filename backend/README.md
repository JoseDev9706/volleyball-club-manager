
# Volleyball Club Manager - Backend

Este backend está construido con Node.js, Express, TypeScript y Prisma ORM para conectarse a una base de datos PostgreSQL.

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Lenguaje:** TypeScript
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Validación:** (Opcional, se puede añadir `zod` o `joi`)

## Requisitos Previos

- Node.js (v16 o superior)
- npm o yarn
- Una instancia de PostgreSQL corriendo (localmente o en un servicio como Docker o Supabase).

## Configuración y Ejecución

1.  **Navegar al directorio del backend:**
    ```bash
    cd backend
    ```

2.  **Instalar Dependencias:**
    ```bash
    npm install
    ```

3.  **Configurar Variables de Entorno:**
    - Crea un archivo `.env` en la raíz del directorio `/backend`.
    - Copia el contenido de `.env.example` en tu nuevo archivo `.env`.
    - Modifica la variable `DATABASE_URL` con la cadena de conexión de tu base de datos PostgreSQL. El formato es: `postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public`

    Ejemplo de archivo `.env`:
    ```
    # URL de conexión de la base de datos PostgreSQL
    DATABASE_URL="postgresql://user:password@localhost:5432/voley-club?schema=public"

    # Puerto en el que correrá el servidor backend
    PORT=3001
    ```

4.  **Ejecutar Migración de la Base de Datos:**
    - Este comando creará las tablas en tu base de datos basándose en el `schema.prisma`.
    ```bash
    npx prisma migrate dev --name init
    ```
    - Después de la migración, es recomendable sembrar la base de datos con datos iniciales, especialmente para la configuración del club. Puedes crear un archivo `prisma/seed.ts` y ejecutar `npx prisma db seed`.

5.  **Iniciar el Servidor de Desarrollo:**
    - El servidor se ejecutará en el puerto definido en tu `.env` (por defecto `3001`) y se reiniciará automáticamente al detectar cambios.
    ```bash
    npm run dev
    ```

6.  **(Opcional) Abrir Prisma Studio:**
    - Prisma Studio es una interfaz gráfica para ver y editar los datos en tu base de datos.
    ```bash
    npx prisma studio
    ```

## Estructura del Proyecto

El proyecto sigue una estructura simplificada para facilitar el inicio:

-   `prisma/schema.prisma`: Define el esquema de la base de datos.
-   `src/server.ts`: Archivo principal que configura y ejecuta el servidor Express, y define todos los endpoints de la API.
-   `src/lib/prisma.ts`: Exporta una instancia singleton del cliente de Prisma.

## API Endpoints Implementados

El archivo `src/server.ts` implementa todos los endpoints necesarios para que la aplicación frontend funcione, reemplazando la `mockApi`. Esto incluye operaciones CRUD para jugadores, equipos, asistencias y configuraciones del club.
