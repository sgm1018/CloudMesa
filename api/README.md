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
# CloudMesa API

<div align="center">
    <h1>CloudMesa</h1>
    <p><strong>Secure Cloud File/Password Storage with End-to-End Encryption</strong></p>
    
[![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)](https://nestjs.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
</div>

## 🔒 Overview

CloudMesa is a secure cloud storage platform that enables users to safely store and share both files and passwords. Built with security as the primary focus, CloudMesa implements end-to-end encryption, zero knowledge, and zero trust architectures using modern cryptographic primitives to ensure your data remains protected at all times.

### Key Principles

- **End-to-End Encryption:** All data is encrypted on your device before transmission
- **Zero Knowledge Architecture:** The server host never have access to unencrypted data or encryption keys
- **Zero Trust Security:** No implicit trust in any system component or user
- **Chunked Uploads:** Large files are split into secure chunks for reliable transmission and resumable uploads

## ✨ Features
- **📁 Secure Storage:** Upload files without worry — end-to-end encryption on your device, resumable chunked uploads, and automatic chunk management and cleanup.
- **🔑 Password Management:** Store and organize passwords securely in your encrypted vault, accessible only to you or authorized individuals.
- **🔄 Secure Sharing:** Share files and passwords with others using ephemeral key cryptography.
- **📤 Resumable Uploads:** Large files are uploaded in chunks with automatic retry and resume capabilities
- **🚫 Access Revocation:** Instantly revoke access to shared files when needed
- **📱 Cross-Platform Support:** Access your data securely from any device
- **🧹 Automatic Cleanup:** Background services clean up lost uploads and temporary files

## 🔐 Security Architecture

CloudMesa employs a sophisticated security model based on modern cryptographic primitives:

### Encryption Technology

| Type | Algorithm | Used For |
|------|-----------|----------|
| Symmetric | ChaCha20-Poly1305 | File/content encryption MAC Message Authenticaction and integrity |
| Asymmetric | Curve25519 | Key exchange and protection |
| forward secrecy | Derived from ephemeral and recipient keys | Secure key exchange (ensures that even if a private key is exposed, new files cannot be decrypted without the corresponding ephemeral public key) |

### Key Concepts

- **Long-term Keys:** Each user has a Curve25519 key pair for receiving encrypted content
- **Ephemeral Keys:** Fresh key pairs generated for each encryption operation (forward secrecy)
- **Symmetric Keys:** Random ChaCha20 keys generated per file/item
- **Nonces:** Unique random values ensuring identical files produce different ciphertexts

### Security Process Flow

1. **User Authentication:** Secure login protected with JWT tokens
2. **Key Generation:** ephemeral key pairs for each encryption
3. **Local Encryption:** Files encrypted in browser using ChaCha20-Poly1305
4. **Key Wrapping:** Symmetric keys encrypted using Curve25519 key agreement
5. **Secure Transmission:** Only encrypted blobs and wrapped keys sent to server
6. **Secure Sharing:** Content encryption keys are securely re-encrypted using the recipient's public key, ensuring only authorized users can access the shared data.


## 📦 Chunked Upload System

CloudMesa implements a robust chunked upload system for handling large files and unreliable networks:

### Upload Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/items/chunk-upload/init` | POST | Initialize upload session |
| `/items/chunk-upload/chunk` | POST | Upload individual chunk |
| `/items/chunk-upload/finish` | POST | Finalize and assemble file |
| `/items/chunk-upload/status/:id` | GET | Check upload progress |
| `/items/chunk-upload/cancel/:id` | DELETE | Cancel upload session |

### Chunked Upload Process

1. **Initialization:** Client requests upload session with file metadata
2. **Encryption:** File encrypted locally, then split into 1-5MB chunks
3. **Chunk Upload:** Each chunk uploaded with validation and deduplication
4. **Progress Tracking:** Real-time progress callbacks and resume capability
5. **Assembly:** Server assembles chunks in correct order after all received
6. **Cleanup:** Temporary chunk files automatically removed

### Security in Chunked Uploads

- Chunking happens **after** encryption (chunks contain encrypted data only)
- Each chunk validated for size, sequence, and integrity
- Abandoned uploads cleaned up within 24 hours
- Resume capability allows recovery from network interruptions

## 🚀 Getting Started

### Prerequisites
- Node.js 
- MongoDB
- Angular

### Installation

1. Clone the repository
    ```bash
    git clone https://github.com/sgm1018/CloudMesa.git
    cd CloudMesa/api
    ```

2. Install dependencies
    ```bash
    npm install
    ```

3. Configure environment variables
    ```bash
    cp .env.example .env
    # Edit .env with your MongoDB URI and JWT secrets
    ```

4. Start the development server
    ```bash
    npm run dev
    ```

### Basic Usage

1. Create an account through the frontend application
2. Encryption keys generated automatically using TweetNaCl
3. Upload files (automatically chunked for large files)
4. Store passwords in encrypted password manager
5. Share items with other users using secure key exchange

## 🔄 Data Flow Examples

### File Upload Process
1. Client encrypts file locally using random ChaCha20 key
2. Symmetric key encrypted using ephemeral + recipient key agreement
3. Encrypted file split into chunks if large
4. Chunks uploaded with session tracking
5. Server assembles chunks without decrypting content
6. Final encrypted file stored with wrapped keys

### File Sharing Process
1. Owner requests recipient's public key
2. File's symmetric key re-encrypted using fresh ephemeral key pair
3. New wrapped key stored for recipient
4. Recipient can decrypt using their private key + ephemeral public key
5. File decrypted locally in recipient's browser

### Password Storage Process
1. Password metadata encrypted using same process as files
2. Stored as encrypted items with type "password"
3. Retrieved and decrypted locally when accessed
4. Never transmitted or stored in plaintext

## 🛠️ Technology Stack

- **Backend Framework:** NestJS (Node.js)
- **Language:** TypeScript
- **Database:** MongoDB with Mongoose
- **Cryptography:** TweetNaCl (NaCl/libsodium port)
- **Authentication:** JWT with bearer tokens
- **File Handling:** Multer for multipart uploads
- **Task Scheduling:** @nestjs/schedule for cleanup jobs
- **Validation:** class-validator for DTO validation


## 🔒 Security Considerations

- **Never share your PRIVATE KEY**
- **Private keys never leave the client device**
- **Ephemeral keys provide forward secrecy**
- **Server cannot decrypt any user content**
- **ChaCha20-Poly1305 provides authenticated encryption**
- **Unique nonces prevent replay attacks**
- **Automatic cleanup prevents storage exhaustion attacks**

## 🤝 Contributing

Contributions are welcome!

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

<div align="center">
    <p>Built with modern cryptography and zero-trust principles</p>
    <p>
        <a href="https://github.com/sgm1018/CloudMesa/issues">Report Bug</a> · 
        <a href="https://github.com/sgm1018/CloudMesa/issues">Request Feature</a>
    </p>
</div>
