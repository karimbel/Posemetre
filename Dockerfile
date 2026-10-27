# Dépendances partagées par le mode dev et la construction de production.
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# Cible de développement : le code est monté depuis la machine hôte.
# Vite détecte les changements et les envoie directement au navigateur.
FROM deps AS dev
EXPOSE 8080
CMD ["npm", "run", "dev"]

# Construction du site statique (svelte-check + vite build).
FROM deps AS build
COPY . .
RUN npm run build

# Cible de production : le site statique servi par nginx.
FROM nginx:1.27-alpine AS runtime
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
