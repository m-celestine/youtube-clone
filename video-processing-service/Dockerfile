# Use an Official Node.js runtime as a parent image
FROM node:18

# Set the working directory in the container to /app
WORKDIR /app

# Copy the package.json and package-lock.json to the working directory
COPY package*.json ./

# Install ffmpeg in the container
RUN apt-get update && apt-get install -y ffmpeg

# Install any needed packages specified in package.json
RUN npm install

# Copy app source inside the docker image
COPY . .

# Build the TypeScript app
RUN npm run build

# Make port 8080 available outside this container
EXPOSE 8080

# Define the command to run the compiled app when the container starts
CMD ["npm", "run", "serve"]
