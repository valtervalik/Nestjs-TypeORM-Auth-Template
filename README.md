<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

# Nestjs Authentication and Authorization Template

## Description

This is an authentication and authorization template using Nestjs. It implements JWT access and refresh tokens in the safest way using HTTPOnly cookies and Redis for token invalidation. It also implements user roles and permissions for authorization using Nestjs guards. The database used for storing user, role, and permission entities is PostgreSQL.

In addition to these features, this template provides Two Factor Authentication and Google OAuth2 authentication functionalities.

## Steps to Run the Application

1. **Clone the repository**: Use git clone command to clone the repository to your local machine.

```bash
git clone https://github.com/valtervalik/Nestjs-auth-template.git
```

2. **Enter the project folder**:

```bash
cd Nestjs-auth-template
```

3. **Install dependencies**: Run any of the following commands to install all the necessary dependencies.

```bash
npm install
```
```bash
yarn install
```
```bash
pnpm install
```

4. **Run docker-compose**: Use the following command to start the Docker containers.

```bash
docker-compose up -d
```

5. **Set your environment variables**: Set up your environment variables based on the `.env.example` file in the repository.

6. **Run the application in development mode**: Use any of the following commands to start the application in development mode.

```bash
npm run start:dev
```
```bash
yarn start:dev
```
```bash
pnpm start:dev
```
