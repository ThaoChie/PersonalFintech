# OWLFIN - AI-Powered Personal Finance Management Application

> **Hệ thống Quản lý Tài chính Cá nhân Thông minh kết hợp Phương pháp 6 Chiếc Hũ & Trí tuệ Nhân tạo**

[![.NET](https://img.shields.io/badge/.NET-9.0-512BD4?logo=dotnet)](https://dotnet.microsoft.com/)
[![React](https://img.shields.io/badge/React-19.0-61DAFB?logo=react)](https://react.dev/)
[![MySQL](https://img.shields.io/badge/MySQL-9.0-4479A1?logo=mysql)](https://www.mysql.com/)
[![Qdrant](https://img.shields.io/badge/Qdrant-Vector_DB-DC2626)](https://qdrant.tech/)
[![Google Gemini](https://img.shields.io/badge/AI-Google_Gemini-4285F4?logo=google)](https://ai.google.dev/)

---

## 1. Giới thiệu tổng quan (Overview)

**OWLFIN** là ứng dụng quản lý tài chính cá nhân toàn diện, kết hợp phương pháp quản lý dòng tiền **6 Chiếc Hũ** (Jars System của T. Harv Eker) với công nghệ **Trí Tuệ Nhân Tạo (Generative AI)** và **Truy xuất Tăng cường Ngữ nghĩa (RAG)**.

Hệ thống được thiết kế theo ngôn ngữ giao diện tối giản hiện đại chuẩn **VJU (Red - White - Gray)**, hỗ trợ người dùng:
* Phân bổ thu nhập tự động theo tỷ lệ khoa học (Thiết yếu 55%, Đầu tư 10%, Tiết kiệm 10%, Giáo dục 10%, Hưởng thụ 10%, Cho đi 5%).
* Kiểm soát hạn mức chi tiêu mỗi ngày cho từng hũ trong thời gian thực.
* Quét hóa đơn mua sắm tự động qua camera/ảnh chụp sử dụng mô hình thị giác máy tính **Gemini Multimodal Vision**.
* Trợ lý ảo AI tài chính thông minh 24/7 với cơ chế tìm kiếm tri thức ngữ nghĩa qua cơ sở dữ liệu véc-tơ **Qdrant**.
* Thử thách tiết kiệm tự động theo tuần và hệ thống cảnh báo vượt ngân sách.

---

## 2. Kiến trúc hệ thống & Công nghệ (Tech Stack)

```
[ Frontend: React 19 + Vite ] <--- Axios JWT ---> [ Backend: ASP.NET Core 9 Web API ]
                                                               |
                                     +-------------------------+-------------------------+
                                     |                         |                         |
                           [ MySQL 9.0 Database ]     [ Qdrant Vector DB ]      [ Google Gemini API ]
                              (Entity Framework)          (Semantic RAG)         (Advisory & Vision OCR)
```

* **Frontend**: React 19, Vite, React Router 7, Chart.js, React-Chartjs-2, FontAwesome 6, Minimalist Red-White-Gray CSS.
* **Backend**: ASP.NET Core 9 Web API, Entity Framework Core 9, Pomelo MySQL Provider, JWT Bearer Authentication, BCrypt.
* **Hạ tầng & Vector DB**: Docker, Docker Compose, MySQL 9.0, Qdrant Vector Search Engine (gRPC 6334 / HTTP 6333).
* **AI & Thị giác**: Google Gemini 2.5 Flash (Generative Text & Multimodal Vision Receipt OCR), Semantic Text Chunking.
* **Kiểm thử**: xUnit (Backend Unit Tests), Playwright (Frontend E2E Automated Tests).

---

## 3. Cấu trúc thư mục (Project Structure)

```text
├── ClientReact/            # Ứng dụng Frontend React 19 + Vite
│   ├── src/
│   │   ├── components/     # Header, Sidebar, Transaction & Jar Modals
│   │   ├── pages/          # Dashboard, Jars, History, ScanReceipt, Chatbot, Settings, Login
│   │   └── assets/         # Logo VJU, Icons, Stylesheet
│   └── package.json
├── Server/                 # Backend ASP.NET Core 9 Web API
│   ├── Controller/         # Auth, Jars, Transactions, Chat, OCR, Challenges, Notifications
│   ├── Models/             # Entity Models (User, Jar, Transaction, Notification, Challenge)
│   ├── Data/               # AppDbContext, Migrations, Financial Knowledge Base
│   ├── Services/           # GeminiService, QdrantService, AICoachingService
│   └── DTOs/               # Data Transfer Objects
├── Tests/                  # Bộ kiểm thử tự động
│   ├── Backend/            # xUnit tests cho phân tích tài chính & đồng bộ ngân hàng
│   └── FrontendE2E/        # Playwright E2E automation tests
├── docker-compose.yml      # Cấu hình container MySQL 9.0 & Qdrant
├── SYSTEM_SPECIFICATION.md # Tài liệu đặc tả hệ thống & kiến trúc chi tiết
└── USER_REQUIREMENTS_DOCUMENT.md # Tài liệu yêu cầu người dùng (URD)
```

---

## 4. Hướng dẫn cài đặt & Khởi chạy Local (Getting Started)

### Yêu cầu tiên quyết:
* [.NET 9 SDK](https://dotnet.microsoft.com/download/dotnet/9.0)
* [Node.js 18+](https://nodejs.org/) & npm
* [Docker Desktop](https://www.docker.com/)

### Bước 1: Khởi động Cơ sở dữ liệu & Vector DB
```bash
docker compose up -d
```
* MySQL 9.0: `localhost:3306` (Database: `FinanceJarDb`)
* Qdrant: `localhost:6333` (HTTP) / `localhost:6334` (gRPC)

### Bước 2: Chạy Backend Server
```bash
cd Server
dotnet run --launch-profile http
```
Backend API sẽ khởi động tại: `http://localhost:8080` (Swagger UI: `http://localhost:8080/swagger`).

### Bước 3: Chạy Frontend Client
```bash
cd ClientReact
npm install
npm run dev
```
Truy cập ứng dụng tại: `http://localhost:3000`.

---

## 5. Tài liệu & Đặc tả (Documentation)
* [USER_REQUIREMENTS_DOCUMENT.md](USER_REQUIREMENTS_DOCUMENT.md): Đặc tả chân dung người dùng, bài toán kinh doanh, User Story & Use Case.
* [SYSTEM_SPECIFICATION.md](SYSTEM_SPECIFICATION.md): Thiết kế thực thể CSDL (ERD), Luồng nghiệp vụ Sequence Diagram, Kiến trúc API.
