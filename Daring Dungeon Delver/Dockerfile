FROM node:20-alpine

WORKDIR /app

# Instala dependencias
COPY package*.json ./
RUN npm install

# Copia el resto del proyecto
COPY . .

# Puerto donde se expondrá el juego dentro del contenedor
EXPOSE 8085

# Levanta el servidor de desarrollo de Vite en el puerto 8085
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "8085"]

