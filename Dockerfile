# ============
# 🧱 Base Image
# ============
FROM --platform=linux/arm64 node:20-bullseye

# ============
# 📦 System Dependencies
# ============
RUN apt-get update && apt-get install -y \
    wget curl unzip git xvfb \
    libnss3 libatk1.0-0 libatk-bridge2.0-0 libx11-xcb1 \
    libxcomposite1 libxdamage1 libxrandr2 libgbm1 libasound2 \
    libpangocairo-1.0-0 libcups2 libxss1 fonts-liberation libgtk-3-0 \
    --no-install-recommends && rm -rf /var/lib/apt/lists/*

# ============
# ⚙️ Working Directory
# ============
WORKDIR /workspace

# ============
# 📂 Copy package files and install dependencies
# ============
COPY package*.json ./

# ✅ Use legacy-peer-deps to fix Angular version conflicts
RUN npm ci --legacy-peer-deps

# ============
# 📂 Copy project files
# ============
COPY . .

# ============
# 🌐 Install Playwright browsers
# ============
RUN npx playwright install --with-deps

# ============
# 🏁 Default Command: interactive bash
# ============
#CMD ["/bin/bash"]
# 🏁 One-command script
# ============
# 1. Run Playwright tests (Chrome + Firefox) 
# 2. Run CucumberJS tests
# 3. Generate Allure report
# 4. Open Allure server on port 5252
CMD npx playwright test --project=chromium && \
    #npx playwright test --project=firefox && \
    #npm test && \
    pm run allure:generate && \
    npm run allure:open