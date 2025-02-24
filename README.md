# Canify: Rewarding the "Made in Canada" Movement 🇨🇦

Canify boosts the Canadian economy by rewarding consumers who support the **“Made in Canada”** movement. This is particularly important when international trade policies pose challenges to our economic growth (*ahem*, USA). Users who back Canadian businesses receive **cryptocurrency rewards** and government incentives 💰.

Using **blockchain technology**, Canify provides a transparent and secure way for consumers to be recognized for their commitment to supporting local products.

---

## 🔥 What is Canify?
We developed a **Google Chrome extension** that analyzes the items in your **Amazon cart**, assessing them based on:
- ✅ Whether they are **Canadian-made**
- ✅ Whether they are **ethically sourced**
- ✅ Whether they provide **good value for money** 🛍️

### 🎯 How Rewards Work
Users **earn NEAR coins** based on the **Canadian content** of their purchases. These coin transactions are funded through **affiliate earnings generated from Amazon**, creating a **sustainable ecosystem** that benefits both consumers and the Canadian economy 🌱.

---

## 🛠 Tools and Technologies

### **Frontend Development**
- JavaScript
- Tailwind CSS
- Gemini API

### **Backend Development**
- Flask (Python)
- Rust & Cargo
- Shade Agents
- NEAR Protocol

### **Infrastructure**
- Phala Network
- Docker

---

![shade-architecture](media/shade-architecture.png)

## 🔒 NEAR Shade Agents Integration
To enhance **security and efficiency**, Canify integrates with **NEAR Protocol** and **Shade Agents**. Here’s how:

### **Smart Contract Deployment**
- Developed **smart contracts** using **Rust & Cargo**, defining rules for minting and distributing **Canify Coins**.
- Ensures rewards are allocated based on **user purchases** and **Canadian content**.

### **Trusted Execution Environments (TEEs)**
- Shade Agents **host smart contracts** in a **secure environment**.
- Protects **sensitive operations** and **safeguards user data**.
- Ensures **transactions and rewards** are **transparent and secure**.

### **Token Management**
- Shade Agents **manage NEAR Coin distribution**.
- Ensures transactions are **processed efficiently** and **accurately**.

---

## 🛠 Google Toolkit Integration
Our implementation of the **Google Toolkit**, specifically the **Gemini API** and **Chrome extension**, plays a vital role in **user experience**:

### **Chrome Extension Development**
- Built using **JavaScript & Tailwind CSS**.
- Seamlessly interacts with **Amazon’s interface**.
- Provides **real-time feedback** on **cart items**.

### **Gemini API Integration**
- Facilitates **communication** between the frontend and backend.
- Enables **instant product assessments**.

### **User Engagement**
- Enhances user interaction.
- Allows users to **track rewards** and see their **economic impact**.

---

## 🔄 Pipeline Process

### **🛒 Cart Scanning**
- The extension scans the user’s **Amazon cart in real-time**.
- Retrieves **product details** such as **name, category, and origin**.
- Prepares data for the **assessment process**.

### **⚙️ Assessment Algorithm**
- Evaluates each item based on:
  - **Canadian Origin** 🇨🇦
  - **Ethical Sourcing** ✅
  - **Value for Money** 💰
- Assigns a **score** reflecting its alignment with these criteria.

### **📊 Scoring and Rewards Calculation**
- Calculates the **total Canadian content percentage** of the cart.
- Users **earn NEAR Coins** based on **Canadian content**.

### **🔗 Transaction Management**
- **Shade Agents** securely handle token transactions.
- **NEAR Coins** are **minted and transferred** to users’ wallets.

---

## 🚀 Installation Guide

### **Mac/Linux Users** 🐧🍏
1. Open your terminal and navigate to the project directory.
2. Run the following command:
   ```sh
   ./s.sh
   ```
3. This script will:
   - Create a **virtual environment**.
   - Install **dependencies**.
   - Start the **Flask backend server**.
4. Open **Google Chrome** and go to:
   ```
   chrome://extensions
   ```
5. Click **"Load unpacked"** and select **this repository's folder**.
6. Turn on the extension and start using Canify! 🎉

### **Windows Users** 🖥️
1. Open **Command Prompt (cmd)** and navigate to the project directory.
2. Run the following command:
   ```sh
   ./s.bat
   ```
3. This script will:
   - Create a **virtual environment**.
   - Install **dependencies**.
   - Start the **Flask backend server**.
4. Open **Google Chrome** and go to:
   ```
   chrome://extensions
   ```
5. Click **"Load unpacked"** and select **this repository's folder**.
6. Turn on the extension and start using Canify! 🚀

---

## 🔑 Setting Up Gemini API Key
To enable the **Gemini API** for product assessments, save your Gemini API key in the project root directory as **API_KEY.txt**.

---

## 🤝 Contributing
We welcome contributions! If you’d like to **enhance Canify**, feel free to:
- Submit **pull requests**.
- Report **issues**.
- Suggest **improvements**.

---

