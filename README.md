<div align="center">
    <img src="https://via.placeholder.com/200x200?text=CloudMesa" alt="CloudMesa Logo" width="200"/>
    <h1>CloudMesa</h1>
    <p><strong>Secure Cloud File/Password Storage with End-to-End Encryption</strong></p>
    
[![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)](https://nestjs.com/)
[![Angular](https://img.shields.io/badge/Angular-DD0031?style=for-the-badge&logo=angular&logoColor=white)](https://angular.io/)
[![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Redis](https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white)](https://redis.io/)
</div>

## 🔒 Overview

CloudMesa is a secure cloud storage platform that enables users to safely store and share both files and passwords. Built with security as the primary focus, CloudMesa implements end-to-end encryption, zero knowledge, and zero trust architectures to ensure your data remains protected at all times.

### Key Principles

- **End-to-End Encryption:** All data is encrypted on your device before transmission
- **Zero Knowledge Architecture:** Our servers never have access to unencrypted data or encryption keys
- **Zero Trust Security:** No implicit trust in any system component or user

## ✨ Features

- **📁 Secure File Storage:** Upload and store files with powerful AES-256-GCM encryption
- **🔑 Password Management:** Safely store and organize passwords in your encrypted vault
- **🔄 Secure Sharing:** Share files and passwords with others without compromising security
- **🚫 Access Revocation:** Instantly revoke access to shared files when needed
- **📱 Cross-Platform Support:** Access your data securely from any device
- **⚡ High Performance:** Redis-powered caching for optimized access to frequently used data

## 🔐 Security Architecture

CloudMesa employs a sophisticated security model to ensure your data remains private and secure:

### Encryption Technology

| Type | Algorithm | Used For |
|------|-----------|----------|
| Symmetric | AES-256-GCM | File/content encryption |
| Asymmetric | RSA-4096/ECC | Key exchange and protection |
| Hash | SHA-256 | Integrity verification |

### Key Concepts

- **KP (Public Key):** Used to encrypt, can be shared openly
- **KR (Private Key):** Used to decrypt, never leaves your device
- **KC (Content Key):** Unique symmetric key for each file
- **KCX:** Content key encrypted with user X's public key
- **IV (Initialization Vector):** Ensures identical files produce different ciphertexts

### Security Process Flow

1. **User Authentication:** Secure login protected with JWT and token rotation
2. **Local Encryption:** Files are encrypted in your browser before upload
3. **Secure Storage:** Only encrypted data is transmitted and stored
4. **Secure Sharing:** Content keys are re-encrypted for authorized recipients
5. **Controlled Access:** Granular permission management and access revocation

## 🏗️ Technical Architecture

CloudMesa consists of four primary components:

### Frontend (Angular)
- Handles client-side encryption/decryption using WebCrypto API
- Manages key generation and storage in secure browser storage
- Provides reactive user interface for file management

### Backend API (NestJS)
- Authenticates users and manages permissions
- Handles encrypted data storage and distribution
- Never processes unencrypted data

### Database (MongoDB)
- Stores encrypted files and encrypted content keys
- Maintains user permissions and sharing relationships
- Structured for optimal query performance

### Caching Layer (Redis)
- Speeds up frequent operations
- Caches public keys and session tokens
- Manages distributed locks for concurrent operations

## 🚀 Getting Started

### Prerequisites
- Node.js (v14+)
- MongoDB
- Redis

### Installation

1. Clone the repository
    ```bash
    git clone https://github.com/sgm1018/CloudMesa.git
    cd cloudmesa
    ```

2. Install dependencies
    ```bash
    npm install
    ```

3. Configure environment variables
    ```bash
    cp .env.example .env
    # Edit .env with your configuration
    ```

4. Start the server
    ```bash
    npm start
    ```

### Basic Usage

1. Create an account with a strong master password
2. Generate your encryption keys (happens automatically)
3. Upload files or add passwords to your secure vault
4. Share specific items with other CloudMesa users by selecting "Share" and entering their username


## 🔄 Data Flow Examples

### File Upload Process
1. Client generates random Content Key (KC)
2. File is encrypted with KC using AES-256-GCM
3. KC is encrypted with user's Public Key (KP)
4. Encrypted file and encrypted KC are sent to server
5. Server stores both in MongoDB without ability to decrypt

### File Sharing Process
1. Sharer requests recipient's Public Key (KP)
2. Content Key (KC) is re-encrypted with recipient's KP
3. New encrypted KC is stored on server
4. Recipient can now decrypt KC with their Private Key (KR)
5. Recipient decrypts file locally using KC

## 🛠️ Technology Stack

- **Frontend:** Angular with WebCrypto API
- **Backend:** NestJS (Node.js framework)
- **Database:** MongoDB
- **Caching:** Redis
- **Authentication:** JWT with token rotation
- **Encryption:** AES-256-GCM, RSA-4096/ECC

## 🤝 Contributing

Contributions are welcome! Please follow these steps:


## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## ⚠️ Security Considerations

- Private keys are never transmitted to the server
- Always access CloudMesa over HTTPS
- Use a strong master password - we cannot recover your data if you lose it
- Enable two-factor authentication for additional security

<div align="center">
    <p>Developed with ❤️ by SGM1018</p>
    <p>
        <a href="https://github.com/sgm1018/cloudmesa/issues">Report Bug</a> · 
        <a href="https://github.com/sgm1018/cloudmesa/issues">Request Feature</a>
    </p>
</div>
