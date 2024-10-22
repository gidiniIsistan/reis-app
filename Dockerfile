FROM oven/bun:1
WORKDIR /app
COPY . .
RUN bun install
RUN bun --bun run build

ENV HOST=0.0.0.0
ENV PORT=80
EXPOSE 80 
 
 
CMD ["bun", "start"]

