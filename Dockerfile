# Build stage
FROM maven:3.9-eclipse-temurin-21 AS builder
WORKDIR /app
COPY mvnw ./
COPY pom.xml ./
COPY src ./src
RUN chmod +x mvnw
RUN ./mvnw -DskipTests clean package -Pproduction

# Runtime stage
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=builder /app/target/aicrm-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8086
ENTRYPOINT ["java", "-jar", "app.jar"]