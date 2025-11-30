# 🏆 Blockchain Certificate API Documentation

## Overview
Blockchain Certificate সিস্টেম যেখানে স্টুডেন্টরা তাদের লার্নিং অ্যাচিভমেন্ট NFT সার্টিফিকেট হিসেবে মিন্ট করতে পারবে। এটি Polygon, Ethereum, Solana, Binance Smart Chain সাপোর্ট করে।

## Features
- ✅ NFT সার্টিফিকেট মিন্টিং
- ✅ IPFS মেটাডাটা স্টোরেজ
- ✅ মাল্টি-ব্লকচেইন সাপোর্ট
- ✅ পাবলিক ভেরিফিকেশন
- ✅ ওয়ালেট ইন্টিগ্রেশন (MetaMask)
- ✅ অটো-জেনারেটেড সার্টিফিকেট ইমেজ
- ✅ LinkedIn/Twitter শেয়ার
- ✅ XP + Coin রিওয়ার্ড

---

## API Endpoints

### 1. Create Certificate
নতুন সার্টিফিকেট তৈরি করুন (এখনও মিন্ট হয়নি)।

**Endpoint:** `POST /api/blockchain-certificates`

**Headers:**
```json
{
  "Authorization": "Bearer <access_token>"
}
```

**Request Body:**
```json
{
  "title": "Full Stack Web Development Mastery",
  "description": "Completed comprehensive full-stack web development course covering React, Node.js, MongoDB, and deployment strategies.",
  "courseId": "674a1b2c3d4e5f6a7b8c9d0e",
  "courseName": "MERN Stack Complete Course",
  "skills": ["React", "Node.js", "MongoDB", "Express", "REST API"],
  "walletAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
  "blockchainNetwork": "polygon"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "message": "Certificate created successfully",
  "data": {
    "_id": "674b3c2a4f9e5d3c6d7a8e90",
    "user": "674a1b2c3d4e5f6a7b8c9d0e",
    "certificateId": "CERT-1733019274-A3B5C7D9",
    "title": "Full Stack Web Development Mastery",
    "description": "Completed comprehensive full-stack...",
    "issueDate": "2025-11-30T12:00:00.000Z",
    "courseId": "674a1b2c3d4e5f6a7b8c9d0e",
    "courseName": "MERN Stack Complete Course",
    "skills": ["React", "Node.js", "MongoDB", "Express", "REST API"],
    "walletAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
    "blockchainNetwork": "polygon",
    "issuer": "MicroLearning Platform",
    "credentialUrl": "https://microlearning.com/certificates/CERT-1733019274-A3B5C7D9",
    "verificationUrl": "https://microlearning.com/verify/CERT-1733019274-A3B5C7D9",
    "status": "pending",
    "createdAt": "2025-11-30T12:00:00.000Z",
    "updatedAt": "2025-11-30T12:00:00.000Z"
  }
}
```

**Field Descriptions:**
- `title` (required): সার্টিফিকেট টাইটেল (3-200 chars)
- `description` (required): বিস্তারিত বর্ণনা (10-1000 chars)
- `courseId` (optional): কোর্স আইডি
- `courseName` (optional): কোর্সের নাম
- `skills` (optional): স্কিল লিস্ট
- `walletAddress` (required): Ethereum/Polygon ওয়ালেট অ্যাড্রেস
- `blockchainNetwork` (optional): `polygon` | `ethereum` | `solana` | `binance` (default: `polygon`)

---

### 2. Mint Certificate as NFT
সার্টিফিকেট ব্লকচেইনে মিন্ট করুন।

**Endpoint:** `POST /api/blockchain-certificates/mint`

**Headers:**
```json
{
  "Authorization": "Bearer <access_token>"
}
```

**Request Body:**
```json
{
  "certificateId": "CERT-1733019274-A3B5C7D9",
  "walletAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Certificate minted successfully on blockchain",
  "data": {
    "_id": "674b3c2a4f9e5d3c6d7a8e90",
    "certificateId": "CERT-1733019274-A3B5C7D9",
    "title": "Full Stack Web Development Mastery",
    "tokenId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "contractAddress": "0x1234567890123456789012345678901234567890",
    "transactionHash": "0x8f3a2b1c4d5e6f7890abcdef1234567890abcdef1234567890abcdef12345678",
    "metadataUri": "ipfs://QmYwAPJzv5CZsnAzt8auVZRn5rcqPvYcNaEJKM3N6k7T8a",
    "nftImageUrl": "https://certificates.microlearning.com/a1b2c3d4-e5f6-7890.png",
    "blockchainNetwork": "polygon",
    "status": "minted",
    "createdAt": "2025-11-30T12:00:00.000Z",
    "updatedAt": "2025-11-30T12:02:15.000Z"
  }
}
```

**Minting Process:**
1. ইমেজ জেনারেট (Certificate design with user info)
2. মেটাডাটা তৈরি (NFT attributes)
3. IPFS আপলোড (Decentralized storage)
4. ব্লকচেইনে মিন্ট (Smart contract call)
5. XP/Coins রিওয়ার্ড (100 XP + 50 Coins)

**Minting Time:** ~30-60 seconds (network dependent)

---

### 3. Get My Certificates
ইউজারের সব সার্টিফিকেট দেখুন।

**Endpoint:** `GET /api/blockchain-certificates/my-certificates?page=1&limit=10`

**Headers:**
```json
{
  "Authorization": "Bearer <access_token>"
}
```

**Query Parameters:**
- `page` (optional): পেজ নম্বর (default: 1)
- `limit` (optional): প্রতি পেজে রেজাল্ট (default: 10)

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "User certificates retrieved successfully",
  "data": [
    {
      "_id": "674b3c2a4f9e5d3c6d7a8e90",
      "certificateId": "CERT-1733019274-A3B5C7D9",
      "title": "Full Stack Web Development Mastery",
      "courseName": "MERN Stack Complete Course",
      "status": "minted",
      "transactionHash": "0x8f3a2b1c...",
      "nftImageUrl": "https://certificates.microlearning.com/...",
      "createdAt": "2025-11-30T12:00:00.000Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 5,
    "totalPages": 1
  }
}
```

---

### 4. Get Certificate by ID (Public)
নির্দিষ্ট সার্টিফিকেট দেখুন (কোনো অথেন্টিকেশন লাগবে না)।

**Endpoint:** `GET /api/blockchain-certificates/:certificateId`

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Certificate retrieved successfully",
  "data": {
    "certificateId": "CERT-1733019274-A3B5C7D9",
    "title": "Full Stack Web Development Mastery",
    "description": "Completed comprehensive...",
    "user": {
      "_id": "674a1b2c3d4e5f6a7b8c9d0e",
      "profile": {
        "firstName": "Riduan",
        "lastName": "Ahmad"
      },
      "email": "riduan@example.com"
    },
    "issueDate": "2025-11-30T12:00:00.000Z",
    "skills": ["React", "Node.js", "MongoDB"],
    "tokenId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "transactionHash": "0x8f3a2b1c...",
    "blockchainNetwork": "polygon",
    "status": "minted"
  }
}
```

---

### 5. Verify Certificate (Public)
সার্টিফিকেট ভ্যালিড কিনা চেক করুন।

**Endpoint:** `GET /api/blockchain-certificates/:certificateId/verify`

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Certificate is valid and verified on blockchain",
  "data": {
    "isValid": true,
    "certificate": {
      "certificateId": "CERT-1733019274-A3B5C7D9",
      "title": "Full Stack Web Development Mastery",
      "transactionHash": "0x8f3a2b1c...",
      "blockchainNetwork": "polygon",
      "status": "minted"
    },
    "message": "Certificate is valid and verified on blockchain"
  }
}
```

**Invalid Certificate:**
```json
{
  "success": true,
  "message": "Certificate is not minted on blockchain yet",
  "data": {
    "isValid": false,
    "certificate": null,
    "message": "Certificate is not minted on blockchain yet"
  }
}
```

---

### 6. Get All Certificates (Admin Only)
সব সার্টিফিকেট দেখুন (অ্যাডমিন প্যানেল)।

**Endpoint:** `GET /api/blockchain-certificates/admin/all?page=1&limit=20&status=minted`

**Headers:**
```json
{
  "Authorization": "Bearer <admin_access_token>"
}
```

**Query Parameters:**
- `page` (optional): পেজ নম্বর (default: 1)
- `limit` (optional): প্রতি পেজে রেজাল্ট (default: 20)
- `status` (optional): `pending` | `minting` | `minted` | `failed`

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "All certificates retrieved successfully",
  "data": [
    {
      "certificateId": "CERT-1733019274-A3B5C7D9",
      "title": "Full Stack Web Development Mastery",
      "user": {
        "profile": {
          "firstName": "Riduan",
          "lastName": "Ahmad"
        },
        "email": "riduan@example.com"
      },
      "status": "minted",
      "blockchainNetwork": "polygon",
      "createdAt": "2025-11-30T12:00:00.000Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Certificate already minted",
  "errorMessages": [
    {
      "path": "",
      "message": "Certificate already minted"
    }
  ]
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Certificate not found",
  "errorMessages": [
    {
      "path": "",
      "message": "Certificate not found"
    }
  ]
}
```

### 500 Internal Server Error (Minting Failed)
```json
{
  "success": false,
  "message": "Failed to mint certificate: Insufficient funds",
  "errorMessages": [
    {
      "path": "",
      "message": "Failed to mint certificate: Insufficient funds"
    }
  ]
}
```

---

## NFT Metadata Structure

যখন সার্টিফিকেট মিন্ট হয়, IPFS-এ এই মেটাডাটা স্টোর হয়:

```json
{
  "name": "Full Stack Web Development Mastery",
  "description": "Completed comprehensive full-stack web development course...",
  "image": "https://certificates.microlearning.com/a1b2c3d4-e5f6-7890.png",
  "attributes": [
    {
      "trait_type": "Certificate ID",
      "value": "CERT-1733019274-A3B5C7D9"
    },
    {
      "trait_type": "Issue Date",
      "value": "2025-11-30"
    },
    {
      "trait_type": "Issuer",
      "value": "MicroLearning Platform"
    },
    {
      "trait_type": "Network",
      "value": "polygon"
    },
    {
      "trait_type": "Course",
      "value": "MERN Stack Complete Course"
    },
    {
      "trait_type": "Skill",
      "value": "React"
    },
    {
      "trait_type": "Skill",
      "value": "Node.js"
    }
  ],
  "external_url": "https://microlearning.com/certificates/CERT-1733019274-A3B5C7D9"
}
```

---

## Blockchain Networks

### Supported Networks

| Network | Chain ID | Contract Address | Gas Fee |
|---------|----------|------------------|---------|
| Polygon (Mumbai Testnet) | 80001 | 0x1234...7890 | ~0.001 MATIC |
| Polygon (Mainnet) | 137 | 0x1234...7890 | ~0.01 MATIC |
| Ethereum (Sepolia Testnet) | 11155111 | 0xabcd...abcd | ~0.001 ETH |
| Ethereum (Mainnet) | 1 | 0xabcd...abcd | ~0.05 ETH |
| Binance Smart Chain | 56 | 0xef12...ef12 | ~0.001 BNB |
| Solana (Devnet) | - | - | ~0.000005 SOL |

**রিকমেন্ডেশন:** Polygon ব্যবহার করুন (সস্তা gas fee)

---

## Usage Flow

### Frontend Integration (React + MetaMask)

#### Step 1: Connect Wallet
```typescript
import { ethers } from 'ethers';

const connectWallet = async () => {
  if (window.ethereum) {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const accounts = await provider.send('eth_requestAccounts', []);
    const walletAddress = accounts[0];
    
    return walletAddress;
  } else {
    alert('Please install MetaMask!');
  }
};
```

#### Step 2: Create Certificate
```typescript
const createCertificate = async () => {
  const walletAddress = await connectWallet();
  
  const response = await fetch('/api/blockchain-certificates', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      title: 'JavaScript Mastery',
      description: 'Completed advanced JavaScript course',
      skills: ['ES6', 'Async/Await', 'Promises'],
      walletAddress,
      blockchainNetwork: 'polygon'
    })
  });
  
  const { data } = await response.json();
  return data.certificateId;
};
```

#### Step 3: Mint Certificate
```typescript
const mintCertificate = async (certificateId: string) => {
  const walletAddress = await connectWallet();
  
  const response = await fetch('/api/blockchain-certificates/mint', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      certificateId,
      walletAddress
    })
  });
  
  const { data } = await response.json();
  
  // Show success
  alert(`Certificate minted! Transaction: ${data.transactionHash}`);
  
  // View on blockchain explorer
  window.open(
    `https://polygonscan.com/tx/${data.transactionHash}`,
    '_blank'
  );
};
```

#### Step 4: Display Certificate
```typescript
function CertificateCard({ cert }: { cert: ICertificate }) {
  return (
    <div className="certificate-card">
      <img src={cert.nftImageUrl} alt={cert.title} />
      <h3>{cert.title}</h3>
      <p>{cert.description}</p>
      
      {cert.status === 'minted' && (
        <div>
          <a href={`https://polygonscan.com/tx/${cert.transactionHash}`}>
            View on Blockchain
          </a>
          <button onClick={() => shareOnLinkedIn(cert)}>
            Share on LinkedIn
          </button>
        </div>
      )}
    </div>
  );
}

const shareOnLinkedIn = (cert: ICertificate) => {
  const url = `https://www.linkedin.com/sharing/share-offsite/?url=${cert.credentialUrl}`;
  window.open(url, '_blank');
};
```

---

## Smart Contract (Solidity Example)

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract MicroLearningCertificate is ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;
    
    mapping(string => bool) private _certificateIds;
    
    constructor() ERC721("MicroLearning Certificate", "MLC") {}
    
    function mintCertificate(
        address recipient,
        string memory tokenURI,
        string memory certificateId
    ) public onlyOwner returns (uint256) {
        require(!_certificateIds[certificateId], "Certificate already minted");
        
        _tokenIds.increment();
        uint256 newTokenId = _tokenIds.current();
        
        _mint(recipient, newTokenId);
        _setTokenURI(newTokenId, tokenURI);
        _certificateIds[certificateId] = true;
        
        return newTokenId;
    }
    
    function verifyCertificate(string memory certificateId) 
        public 
        view 
        returns (bool) 
    {
        return _certificateIds[certificateId];
    }
}
```

---

## Best Practices

1. **Wallet Security**
   - Private key কখনও শেয়ার করবেন না
   - Hardware wallet ব্যবহার করুন (Ledger, Trezor)
   - Testnet-এ প্রথমে টেস্ট করুন

2. **Gas Optimization**
   - Polygon ব্যবহার করুন (সস্তা)
   - Batch minting করুন (একসাথে multiple)
   - Off-peak hours-এ mint করুন

3. **IPFS Storage**
   - Pinata/Infura ব্যবহার করুন (IPFS pinning)
   - Metadata backup রাখুন
   - Image compression করুন

4. **Verification**
   - Certificate link সবসময় public রাখুন
   - QR code যোগ করুন
   - Blockchain explorer link দিন

---

## Rate Limits
- **Max 5 certificates** per day per user
- **Max 1 minting** at a time per user
- **Admin**: Unlimited

---

## Future Enhancements
- 🔜 Layer 2 scaling (Optimism, Arbitrum)
- 🔜 Dynamic NFTs (level up as you learn)
- 🔜 Certificate templates (customizable)
- 🔜 Batch minting for admins
- 🔜 Certificate marketplace (sell/transfer)
- 🔜 Soulbound tokens (non-transferable)
