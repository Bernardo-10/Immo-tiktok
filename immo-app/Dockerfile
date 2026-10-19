# Image de développement : Node est dans le conteneur, rien à installer sur l'ordinateur.
FROM node:20-slim

WORKDIR /app

# Dépendances installées dans l'image (cache Docker tant que package*.json ne change pas)
COPY package.json package-lock.json ./
RUN npm ci

# Le code est ensuite monté en volume par docker-compose (modifs en direct)
COPY . .

EXPOSE 3000

# -H 0.0.0.0 : indispensable pour que le navigateur de l'hôte atteigne le serveur
CMD ["npm", "run", "dev", "--", "-H", "0.0.0.0", "-p", "3000"]
