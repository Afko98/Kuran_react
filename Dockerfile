# -------- Build Stage --------
FROM node:20 AS build

# Set working directory
WORKDIR /app

# Kopiraj package.json za client i server
COPY client/package*.json ./client/
COPY server/package*.json ./server/

# Instaliraj dependencies
RUN cd client && npm install
RUN cd server && npm install

# Kopiraj sav kod
COPY client ./client
COPY server ./server

# Build React
RUN cd client && npm run build

# -------- Production Stage --------
FROM node:20-slim

WORKDIR /app

# Kopiraj backend + build frontend
COPY --from=build /app/server ./server
COPY --from=build /app/client/dist ./client/dist
COPY --from=build /app/server/package*.json ./server/

# Instaliraj samo production dependencies
RUN cd server && npm install --production

WORKDIR /app/server

# Expose port 80
EXPOSE 80

# Start Express server
CMD ["node", "server.js"]
