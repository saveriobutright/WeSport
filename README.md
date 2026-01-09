# WeSport – Sports Event Management Platform

Backend Java + Maven. Start: `mvn spring-boot:run`.  
Docker: check `docker-compose.yml` and Keycloak notes.

## Overview
WeSport is a full-stack web application designed to manage amateur sports events.
Users can create events, join matches with specific roles and handle payments for sports facilities.

The project focuses on clean backend architecture, security and real-world use cases.

---

## Why this project
This project was developed to simulate a real production-ready system,
covering backend design, authentication, authorization and data persistence.

---

##  Tech Stack
### Backend
- Java 17
- Spring Boot
- Spring Security
- Keycloak
- Maven

### Database
- PostgreSQL
- H2 (local development)

### Infrastructure
- Docker
- Docker Compose

### Frontend
- Angular 2+ (user interaction)
- HTML/CSS/Typescript (writing, style, angular pages logic)
- AJAX/REST API (backend/frontend asynchronous communication)

---

## Architecture
- Layered architecture (Controller / Service / Repository)
- DTO pattern
- RESTful APIs
- Role-based access control (RBAC)

---

## Security
- Authentication and authorization via Keycloak
- JWT-based access control
- Role-based permissions (Admin / User)

---

## ⚙️ How to run the project
```bash
docker-compose up

---

## Demo accounts (user/password)
- admin/admin
- user/user

---

## Overcame challenges
- Desining RESTful APIs
- Structuring and producing a real backend project
- Managing authentication with Keycloak
- Handling relational databases
- Using Docker for local development

---

## License
This project is licensed under the MIT License.
