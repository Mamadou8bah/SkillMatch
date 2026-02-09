# Build stage
FROM maven:3.9.6-eclipse-temurin-17-alpine AS build
WORKDIR /app

# Try to copy from either root or nested path to be safe
COPY pom.xml* backend/SkillMatch/pom.xml* ./ 
COPY src* backend/SkillMatch/src* ./src/

# Build the application
RUN mvn clean package -DskipTests

# Run stage
FROM eclipse-temurin:17-jdk-alpine
WORKDIR /app

# Copy the jar from the build stage
COPY --from=build /app/target/SkillMatch-0.0.1-SNAPSHOT.jar skillmatch.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "skillmatch.jar"]
