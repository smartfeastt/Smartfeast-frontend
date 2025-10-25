# 🍽️ SmartFeast

**SmartFeast** is a QR-based digital dining platform that lets customers scan a QR code to view menus, place orders, and make payments — all from their smartphones.  
It’s built for modern restaurants and cafés to enable **contactless**, **fast**, and **smart dining experiences**.

> 🏷️ **Tagline:** *Scan the Code. Skip the Wait.*

---

## 🚀 Features

- 🔗 **QR Code Ordering** – Customers can instantly access menus by scanning a QR code.  
- 📋 **Digital Menu Management** – Restaurants can easily add, edit, or remove menu items.  
- ⚡ **Live Order Tracking** – Staff can view and update order statuses in real time.  
- 💻 **Responsive UI** – Designed for mobile and desktop using Tailwind CSS and React.  
- 🔒 **Secure Backend** – Built with Express.js, Node.js, and MySQL.  
- 👥 **Role-Based Access** – Different dashboards for customers, staff, and admins.

---

## 🧠 Tech Stack

| Layer | Technologies |
|-------|---------------|
| **Frontend** | React, Tailwind CSS, Vite |
| **Backend** | Express.js, Node.js |
| **Database** | MongoDB |
| **Other Tools** | CashFree SDK,JWT Authentication, RESTful APIs, QR Code Integration |

---

## ⚙️ Installation

### **Prerequisites**
- Node.js (v16 or higher)
- npm (comes with Node.js)
- MONGO DB (ATLAS OR COMPASS)

### **Steps**

1. **Clone the Repository**
   ```bash
   git clone https://github.com/your-username/smartfeast.git
   cd smartfeast
Install Dependencies

bash
Copy code
npm install
cd client
npm install
Set Up Environment Variables
Create a .env file in the root directory:


bash
Copy code
# Start backend
npm run server

# Start frontend
cd client
npm run dev
🧱 Project Structure
pgsql
Copy code                    

smartfeast/       
├── client/                                
│   ├── src/                  
│   │   ├── components/                
│   │   ├── pages/                 
│   │   ├── data/               
│   │   ├── App.jsx                
│   │   └── main.jsx              
│   └── public/           
│       └── index.html               
│
│
├── .env          
├── package.json          
└── README.md

🖥️ Scripts
Command	Description
npm run dev	Run frontend in development mode
npm run server	Run backend server
npm run build	Build production frontend
npm start	Run both frontend & backend

👩‍🍳 Roles
Customer: Scan QR → View Menu → Place Order

Staff: View Orders → Update Order Status

Admin: Manage Menus → Monitor Analytics

🔗 Repository
GitHub: https://github.com/your-username/smartfeast

🧑‍💻 Author
Yashwanth Munikuntla

📄 License
This project is licensed under the MIT License.
You are free to use and modify it with proper attribution.

🌟 Keywords
QR Menu • Smart Dining • React • Express • Tailwind CSS • MongoDB • Restaurant Automation • Full Stack


