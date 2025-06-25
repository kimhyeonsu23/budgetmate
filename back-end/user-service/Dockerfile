FROM maven:3.9.7-amazoncorretto-21-debian-bookworm AS builder

WORKDIR /usr/src/app
COPY pom.xml .
RUN mvn -B dependency:go-offline

COPY . .
RUN mvn package -DskipTests #app/target에 빌드됨

# app
FROM amazoncorretto:21.0.3

WORKDIR /app # 현재 작업중인 app으로 복사해옴.
COPY --from=builder /usr/src/app/target/user-service-0.0.1-SNAPSHOT.jar /app/

ENTRYPOINT ["java", "-jar", "/app/user-service-0.0.1-SNAPSHOT.jar"]