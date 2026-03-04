# Use official Node.js LTS image
FROM node:22-slim AS base
WORKDIR /app

# Install dependencies in a separate stage for caching
FROM base AS install
COPY package.json package-lock.json ./
RUN npm install --legacy-peer-deps

# Build the application
FROM base AS build
COPY --from=install /app/node_modules ./node_modules
COPY . .
ENV FOR_SITES=true
# Remove any pre-existing generated route tree — tanstackStart() plugin
# will auto-generate it synchronously during vite build
RUN rm -f src/routeTree.gen.ts && npx vite build

# Production image
FROM base AS release
WORKDIR /app
COPY --from=build /app/.output ./.output

# Expose the port the app runs on
EXPOSE 3000

# Start the application
CMD ["node", "--input-type=module", "--eval", "import { createServer } from 'node:http'; import { listener } from './.output/server/index.mjs'; const port = parseInt(process.env.PORT || '3000'); createServer(listener).listen(port, '0.0.0.0', () => console.log('Listening on port ' + port));"]
