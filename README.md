# Soldoway 🚀
**The Decentralized Task Management & Sales Payout Platform**

Soldoway is a Web3 platform built on the **Solana** blockchain designed to revolutionize how businesses manage and pay their sales force. By leveraging **Yield-Bearing Escrows**, businesses can deploy marketing campaigns where deposited funds don't sit idle—they generate real-time yield in DeFi protocols (Kamino/Jito) while awaiting sales claim verification.

---

## ✨ Key Features

*   **Yield-Bearing Escrow**: Deposits for sales missions are automatically routed to **Kamino Finance** or **Jito** vaults via CPI (Cross-Program Invocation) to earn interest for the business owner.
*   **Privy Wallet Integration**: Provides a seamless, mobile-friendly onboarding experience with support for email, social, and gasless Solana transactions.
*   **Mobile-First Dashboard**: A fully responsive UI designed specifically for the mobile-active workforce in regions like Bali and beyond.
*   **Hybrid Data Architecture**: Combines the security of **On-chain** Solana transactions with the speed of **Off-chain** PostgreSQL (Prisma) metadata for a fast and reliable user experience.
*   **Real-time Partner Marketplace**: A dedicated sales page where partners can browse active missions, strategies, and payout capacities directly from the database.

---

## 🛠️ Tech Stack

*   **Frontend**: Next.js 16 (Turbopack), Tailwind CSS.
*   **Blockchain**: Solana, Anchor Framework (Rust).
*   **Authentication & Wallet Management**: Privy.
*   **Database & ORM**: PostgreSQL, Prisma.
*   **Deployment**: Vercel.

---

## 🚀 Getting Started

### Prerequisites
*   Node.js 18+
*   Solana CLI & Anchor (for contract development)
*   PostgreSQL Instance

### Local Installation
1.  **Clone the repository:**
    ```bash
    git clone https://github.com/wayphantomme/soldoway.git
    cd soldoway
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Setup Environment Variables:**
    Create a `.env` file in the root directory:
    ```env
    DATABASE_URL="your_postgresql_url"
    NEXT_PUBLIC_PRIVY_APP_ID="your_privy_id"
    NEXT_PUBLIC_SOLANA_RPC="your_rpc_url"
    ```

4.  **Initialize Prisma:**
    ```bash
    npx prisma generate
    ```

5.  **Run Development Server:**
    ```bash
    npm run dev
    ```

---

## 🏗️ Deployment Note (Vercel)

This project uses **Prisma**. To ensure successful builds on Vercel, the `package.json` includes a `postinstall` script to prevent client initialization errors:
```json
"scripts": {
  "postinstall": "prisma generate",
  "build": "next build"
}
```

---

## 📜 License
Distributed under the MIT License. See `LICENSE` for more information.
