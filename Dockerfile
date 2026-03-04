# Use the official Bun image
FROM oven/bun:1.1 AS base
WORKDIR /app

# Install dependencies in a separate stage for caching
FROM base AS install
COPY package.json bun.lock ./
RUN bun install

# Build the application
FROM base AS build
COPY --from=install /app/node_modules ./node_modules
COPY . .
# We must run 'tsr generate' once to ensure routeTree.gen.ts is synced,
# but we disable the auto-watch in the vite plugin to prevent the loop.
ENV TSR_AUTOGENERATE=false
RUN bun run tsr generate && bun vite build --sourcemap

# Production image
FROM base AS release
COPY --from=build /app/.output ./.output

# Expose the port the app runs on
EXPOSE 3000

# Start the application
CMD ["bun", ".output/server/index.mjs"]
