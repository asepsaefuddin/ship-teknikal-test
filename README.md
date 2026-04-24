# Ship Navigation Data Service

Backend service untuk mengelola data navigasi kapal secara near real-time.

## Tech Stack

- Node.js + Express
- MongoDB + Mongoose
- SSE (Server-Sent Events) untuk realtime update

## Project Structure

```text
server.js
src/
  app.js
  controllers/
  services/
  repositories/
  models/
  routes/
  middlewares/
  utils/
```

Arsitektur mengikuti pemisahan tanggung jawab:

- `routes`: definisi endpoint HTTP
- `middlewares`: validasi input
- `controllers`: adapter HTTP request/response
- `services`: business logic utama
- `repositories`: akses data ke MongoDB
- `models`: schema data Mongoose
- `utils`: helper (logging, distance calculation)

## Data Model

Ship minimum fields:

```json
{
  "id": "string",
  "name": "string",
  "lat": 0,
  "lng": 0,
  "heading": 0,
  "speed": 0,
  "timestamp": 0
}
```

Di database:

- `shipId` diset unique
- `distanceTraveled` akumulasi jarak (km)
- `history` menyimpan jejak data posisi (rolling window max 500)

## Setup & Run

## 1) Install dependencies

```bash
npm install
```

## 2) Create `.env`

```env
MONGO_URI=mongodb://127.0.0.1:27017/ship_navigation
PORT=3000
```

## 3) Run app

```bash
npm run dev
```

Jika sukses:

- `MongoDB connected`
- `Server running on port 3000`

## API Endpoints

Base URL: `http://localhost:3000`

### 1) Update/Create Ship

`POST /ships/update`

Request body:

```json
{
  "id": "ship-1",
  "name": "Kapal Nusantara",
  "lat": -6.2,
  "lng": 106.8,
  "heading": 370,
  "speed": 25,
  "timestamp": 1710000000
}
```

Notes:

- Jika `id` belum ada: create ship baru
- Jika `id` sudah ada: update state ship
- `name` bersifat opsional, tetapi jika dikirim harus string non-empty
- `heading` otomatis dinormalisasi ke range `0..359`
- `speed < 0` akan direject

Contoh invalid response (400):

```json
{
  "success": false,
  "message": "speed cannot be negative"
}
```

### 2) Get Current State of All Ships

`GET /ships`

Contoh response:

```json
[
  {
    "shipId": "ship-1",
    "name": "Kapal Nusantara",
    "lat": -6.3,
    "lng": 106.9,
    "heading": 10,
    "speed": 25,
    "timestamp": 1710000100,
    "distanceTraveled": 15.2
  }
]
```

### 3) Get Single Ship

`GET /ships/:id`

Contoh not found (404):

```json
{
  "success": false,
  "message": "Ship not found"
}
```

### 4) Get Ship History

`GET /ships/:id/history`

Contoh response:

```json
[
  {
    "lat": -6.2,
    "lng": 106.8,
    "heading": 10,
    "speed": 20,
    "timestamp": 1710000000
  },
  {
    "lat": -6.25,
    "lng": 106.85,
    "heading": 15,
    "speed": 22,
    "timestamp": 1710000050
  }
]
```

History dibatasi max 500 titik terbaru (rolling window).

### 5) Real-time Stream (SSE)

`GET /stream`

Server akan push event update ship setiap ada data masuk ke `POST /ships/update`.

Contoh test cepat via terminal:

```bash
curl -N http://localhost:3000/stream
```

## Edge Cases Handling

- **Out-of-order timestamp**: data lama tetap masuk history, namun current state tetap mengikuti timestamp terbaru.
- **Distance consistency**: setiap update, history disusun berdasarkan timestamp lalu `distanceTraveled` dihitung ulang dari urutan tersebut agar konsisten walau data datang tidak berurutan.
- **Invalid/null input**: divalidasi di middleware, return 400.
- **Heading out of range**: dinormalisasi ke `0..359`.
- **Negative speed**: direject dengan 400.

## Design & Thinking Answers

### 1) Bagaimana menangani out-of-order data?

Data baru selalu digabung ke history lalu di-sort ascending berdasarkan timestamp. Current ship state diambil dari titik dengan timestamp terbesar, sehingga data lama tidak menimpa data terbaru.

### 2) Bagaimana menghitung distance secara konsisten?

Distance tidak diincrement buta dari state terakhir. Service menghitung ulang total jarak dari history yang sudah terurut timestamp, sehingga hasil tetap konsisten meskipun event datang acak.

### 3) Bagaimana desain jika ada 1000+ kapal?

- Tambahkan index pada `shipId` (sudah unique index).
- Batasi history (sudah max 500) agar ukuran dokumen terkontrol.
- Pisahkan channel ingestion dan processing (queue/stream) jika throughput naik.
- Tambahkan pagination/filter untuk endpoint list.
- Horizontal scaling service + external pub/sub untuk realtime fanout.

### 4) Apakah menyimpan semua history?

Tidak. History dibatasi rolling window 500 titik agar storage dan performa tetap stabil. Untuk kebutuhan analitik jangka panjang, data lama sebaiknya diarsipkan ke storage/time-series terpisah.

### 5) Bagaimana memastikan service performant?

- Cek input di awal.
Jadi kalau ada data yang salah, langsung ditolak sebelum diproses lebih jauh
- Pakai query yang sederhana dan cepat.
Cari data berdasarkan shipId yang sudah diindeks, supaya pencariannya tidak lambat.
- Batasi payload history.
- Pisahkan concern per layer agar mudah optimasi.
- Tambah logging dasar
Supaya kalau ada masalah, mudah dilihat request mana yang lambat atau error di bagian mana.

## Optional Deliverables

- Postman collection tersedia
- Deploy link: belum disertakan.
