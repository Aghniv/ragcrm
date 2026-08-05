
FROM eclipse-temurin:21-jdk-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy the built jar file (Adjust path depending on Maven/Gradle)
# Maven uses 'target/*.jar', Gradle uses 'build/libs/*.jar'
COPY target/aicrm-0.0.1-SNAPSHOT.jar app.jar

# Expose the default Spring Boot port
EXPOSE 8080

# Command to execute the application
CMD ["java", "-jar", "app.jar"]