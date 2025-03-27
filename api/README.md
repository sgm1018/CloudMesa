# CloudMesa API

CloudMesa is a secure and private cloud storage service designed for managing files and passwords. This project implements end-to-end encryption (E2E), zero knowledge, and zero trust technologies, ensuring that user data remains confidential and accessible only by the owners or those with explicit permissions.

## Table of Contents

1. [Introduction](#introduction)
2. [Objectives](#objectives)
3. [Architecture](#architecture)
4. [Core Features](#core-features)
5. [Installation](#installation)
6. [Usage](#usage)
7. [Contributing](#contributing)
8. [License](#license)

## Introduction

CloudMesa provides a robust solution for secure file and password management. The architecture is built around the principles of security, privacy, and usability, ensuring that users have complete control over their data.

## Objectives

- **Security**: Protect files and passwords using E2E encryption.
- **Privacy**: Ensure the server has no knowledge of user data (zero knowledge).
- **Trust**: Operate under a zero trust model, not relying on server infrastructure for security.
- **Secure Sharing**: Allow users to share files and passwords while maintaining E2E encryption.
- **Access Control**: Provide granular permissions and revocation capabilities for shared data.
- **Usability**: Deliver an intuitive user experience for managing files and passwords.

## Architecture

The application consists of the following main components:

- **Client (Frontend - Angular)**: Handles key generation, encryption, and user interface.
- **Server (Backend - NestJS)**: Manages encrypted data storage, authentication, and key distribution.
- **Database (MongoDB)**: Stores user metadata, files, and passwords.
- **Cache (Redis)**: Optimizes performance through temporary data storage.

## Core Features

- **User Authentication**: Secure registration and login processes.
- **File Management**: Upload, download, and share files with E2E encryption.
- **Password Management**: Create, store, and share passwords securely.
- **Search Functionality**: Search for files and passwords by name or metadata.

## Installation

To set up the project, clone the repository and install the required dependencies:

```bash
git clone <repository-url>
cd cloudmesa-api
npm install
```

Make sure to set up your `.env` file with the necessary environment variables for database connections and other configurations.

## Usage

To start the application, run:

```bash
npm run start
```

For Docker deployment, use:

```bash
docker-compose up -d
```

## Contributing

Contributions are welcome! Please submit a pull request or open an issue for any enhancements or bug fixes.

## License

This project is licensed under the MIT License. See the LICENSE file for details.