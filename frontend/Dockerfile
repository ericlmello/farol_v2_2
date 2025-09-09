FROM node:20-alpine

WORKDIR /app

# Instalar dependências necessárias
RUN apk add --no-cache git

# Copiar package.json primeiro para cache de dependências
COPY package*.json ./

# Instalar dependências
RUN npm install

# Copiar arquivos de configuração
COPY next.config.js tailwind.config.ts tsconfig.json postcss.config.js ./

# Copiar código fonte
COPY src/ ./src/

# Expor porta
EXPOSE 3000

# Comando para desenvolvimento
CMD ["npm", "run", "dev"]
