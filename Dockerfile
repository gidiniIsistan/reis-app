FROM oven/bun:1
RUN apt update && apt install python3 python3-pip make g++ -y
WORKDIR /app
COPY . .
RUN bun install
RUN bun --bun run build

ENV HOST=0.0.0.0
ENV PORT=3000
EXPOSE 3000 
 
 
CMD ["bun", "start"]

