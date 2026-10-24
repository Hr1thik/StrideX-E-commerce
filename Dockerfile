# Step 1: Base image
FROM node:20-alpine AS base
WORKDIR /app

# Step 2: Install dependencies
COPY package*.json ./
RUN npm install

# Step 3: Copy source code and build
COPY . .

# Dummy environment variables to satisfy Next.js build-time route evaluations
ENV MONGODB_URI="mongodb://localhost:27017/dummy"
ENV NEXTAUTH_SECRET="dummy_secret_for_build_purposes_only"
ENV NEXTAUTH_URL="http://localhost:3000"
ENV RAZORPAY_KEY_ID="rzp_test_dummyKeyId12345"
ENV RAZORPAY_KEY_SECRET="dummySecretKey12345"
ENV GEMINI_API_KEY="dummy_gemini_key"

RUN npm run build

# Step 4: Run Next.js app
EXPOSE 3000
ENV HOSTNAME="0.0.0.0"
ENV PORT=3000

CMD ["npm", "start"]