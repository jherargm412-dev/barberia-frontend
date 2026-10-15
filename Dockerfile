# Imagen del frontend para Railway: se compila con Node y se sirve con nginx.
# VITE_API_URL se fija al COMPILAR (Railway la pasa como build arg): si se cambia, hay que volver a desplegar.

# ---------- Etapa 1: compilar con Vite ----------
FROM node:22-alpine AS build
WORKDIR /app

# Primero solo package*.json: Docker reutiliza node_modules mientras no cambien las dependencias.
COPY package.json package-lock.json ./
RUN npm ci

COPY . .
ARG VITE_API_URL
RUN test -n "$VITE_API_URL" || (echo "Falta VITE_API_URL (ej. https://mi-backend.up.railway.app/api/v1)" && exit 1)
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

# ---------- Etapa 2: solo los archivos compilados + nginx ----------
FROM nginx:1.27-alpine

# La imagen de nginx reemplaza ${PORT} de la plantilla al arrancar (Railway asigna el puerto).
ENV PORT=80
COPY nginx/default.conf.template /etc/nginx/templates/default.conf.template
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
