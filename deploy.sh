#!/bin/bash

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}================================${NC}"
echo -e "${BLUE}LF Flauto Website Deployment${NC}"
echo -e "${BLUE}================================${NC}\n"

# Step 1: Pull latest changes
echo -e "${YELLOW}Step 1: Pulling latest changes from git...${NC}"
git pull origin v1
if [ $? -ne 0 ]; then
    echo -e "${RED}Failed to pull from git${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Git pull successful${NC}\n"

# Step 2: Build Docker image
echo -e "${YELLOW}Step 2: Building new Docker image...${NC}"
docker build -t lflauto-website:latest .
if [ $? -ne 0 ]; then
    echo -e "${RED}Failed to build Docker image${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Docker image built successfully${NC}\n"

# Step 3: Stop old container
echo -e "${YELLOW}Step 3: Stopping old container...${NC}"
if docker ps -q -f name=lflauto-website | grep -q .; then
    docker stop lflauto-website
    echo -e "${GREEN}✓ Container stopped${NC}"
else
    echo -e "${YELLOW}⚠ No running container found${NC}"
fi

# Step 4: Remove old container
echo -e "${YELLOW}Step 4: Removing old container...${NC}"
if docker ps -a -q -f name=lflauto-website | grep -q .; then
    docker rm lflauto-website
    echo -e "${GREEN}✓ Container removed${NC}\n"
else
    echo -e "${YELLOW}⚠ No container to remove${NC}\n"
fi

# Step 5: Start new container
echo -e "${YELLOW}Step 5: Starting new container...${NC}"
docker run -d \
  --name lflauto-website \
  -p 80:80 \
  --restart unless-stopped \
  lflauto-website:latest

if [ $? -ne 0 ]; then
    echo -e "${RED}Failed to start container${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Container started successfully${NC}\n"

# Step 6: Wait for container to be healthy
echo -e "${YELLOW}Step 6: Waiting for container to start...${NC}"
sleep 3

# Step 7: Check if container is running
if docker ps -q -f name=lflauto-website | grep -q .; then
    echo -e "${GREEN}✓ Container is running${NC}\n"
else
    echo -e "${RED}✗ Container failed to start${NC}"
    echo -e "${YELLOW}Checking logs:${NC}"
    docker logs lflauto-website
    exit 1
fi

# Step 8: Show container logs
echo -e "${YELLOW}Step 7: Container logs (last 20 lines):${NC}"
docker logs --tail 20 lflauto-website
echo ""

# Step 9: Clean up old images
echo -e "${YELLOW}Step 8: Cleaning up old Docker images...${NC}"
docker image prune -f > /dev/null 2>&1
echo -e "${GREEN}✓ Cleanup complete${NC}\n"

# Success message
echo -e "${GREEN}================================${NC}"
echo -e "${GREEN}Deployment Complete! ✓${NC}"
echo -e "${GREEN}================================${NC}\n"

echo -e "${BLUE}Test these URLs:${NC}"
echo -e "  • Home: ${YELLOW}https://lflauto.co.uk${NC}"
echo -e "  • Admin: ${YELLOW}https://lflauto.co.uk/maduadmin${NC}"
echo -e "  • About: ${YELLOW}https://lflauto.co.uk/about${NC}\n"

echo -e "${BLUE}Useful commands:${NC}"
echo -e "  • View logs: ${YELLOW}docker logs -f lflauto-website${NC}"
echo -e "  • Restart: ${YELLOW}docker restart lflauto-website${NC}"
echo -e "  • Stop: ${YELLOW}docker stop lflauto-website${NC}\n"

echo -e "${YELLOW}⚠ Remember to change the admin password!${NC}"
echo -e "  Default password: madu2025admin\n"
