# FlowBoard runs as a single container -- it's a modular monolith, not a fleet of
# services (see ADR-0001). One image, one process.
FROM node:20-alpine

WORKDIR /app

# Install only production deps first for better layer caching.
COPY package.json package-lock.json* ./
RUN npm install --omit=dev

COPY src ./src

ENV PORT=3000
EXPOSE 3000
CMD ["node", "src/index.js"]
