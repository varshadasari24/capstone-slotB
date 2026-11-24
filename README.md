# Smart Transit Performance Benchmark Dashboard

An enterprise-grade, asynchronous performance benchmarking framework and real-time monitoring web application for smart city transit pipelines.

---

## 🌟 Key Features & Modules

1. **Overview Dashboard**: Real-time throughput (events/sec), latency percentiles ($P_{50}, P_{95}, P_{99}$), CPU & memory consumption, active fleet count, and live Recharts visualizations.
2. **Live Transit Monitoring**: High-tech interactive SVG transit route map with moving buses along 4 active corridors, route/status filters, and a deep **Bus Telemetry Inspector** showing live speed, passenger occupancy, and raw JSON payloads.
3. **Data Pipeline Visualization**: 6-stage animated streaming pipeline (*IoT Ingest $\rightarrow$ Go Ingestion $\rightarrow$ Kafka $\rightarrow$ Async Workers $\rightarrow$ TimescaleDB $\rightarrow$ Dashboard*), live counters, and stage-by-stage buffer depth metrics.
4. **Performance Testing Module**: Interactive load-testing engine. Configure 1K to 1M events, 10 to 1,000 virtual users, multiple intensities (Low, Medium, High, Stress), and compare **Async Kafka Worker Pool** against **Synchronous Baseline** with 4Hz live graphing.
5. **Benchmark Analysis**: Statistical latency percentiles, side-by-side run comparison engine with advantage/delta calculation, and throughput scaling curves.
6. **Bottleneck Detection**: Heuristic monitoring of Kafka consumer lag, worker loop delays, and DB write lock contention, with root-cause explanations and a **Trigger Chaos Overload** self-healing simulation.
7. **Reports & Export Engine**: Historical benchmark execution ledger, instant **Export to CSV**, **Export to JSON**, and printable PDF report view.
8. **System Architecture**: Complete technical blueprint (Gatling, Go microservices, Kafka, TimescaleDB, Prometheus, OpenTelemetry, Docker) with a 7-span **Jaeger Distributed Trace Waterfall** simulation.
9. **Settings & Integration Endpoints**: Simulation ticker frequency, fleet size, alert thresholds, and honest backend connection settings.

---

## 🚀 Quick Start Guide

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- [npm](https://www.npmjs.com/) (v9 or higher)

### Installation & Running Locally

1. **Unzip the project** and open a terminal inside the project directory:
   ```bash
   cd smart-transit-benchmark
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the local development server**:
   ```bash
   npm run dev
   ```

4. **Open in your browser**:
   - Local: `http://localhost:5173/`
   - Network (same Wi-Fi): Access via the IP address printed in your terminal (e.g. `http://<your-local-ip>:5173/`)

### Production Build
To create an optimized production build:
```bash
npm run build
```
The output will be generated in the `dist/` directory.

---

## 📁 Project Structure

```
smart-transit-benchmark/
├── public/                 # Static public assets
├── src/
│   ├── types/              # TypeScript domain types & interfaces
│   ├── data/               # Initial seed data, routes, buses & traces
│   ├── context/            # SimulationContext.tsx (Heartbeat engine & load tester)
│   ├── components/
│   │   ├── common/         # Sidebar, Navbar, StatCard, Badge, Button
│   │   ├── dashboard/      # Module 1: Overview Dashboard
│   │   ├── transit/        # Module 2: Live Transit Map & Bus Detail Inspector
│   │   ├── pipeline/       # Module 3: 6-Stage Streaming Pipeline
│   │   ├── testing/        # Module 4: Performance Testing Runner & Modal
│   │   ├── benchmark/      # Module 5: Benchmark Analysis & Run Comparison
│   │   ├── bottlenecks/    # Module 6: Heuristic Bottleneck & Chaos Engine
│   │   ├── reports/        # Module 7: Historical Reports & CSV/PDF Export
│   │   ├── architecture/   # Module 8: System Blueprint & Jaeger Tracing
│   │   └── settings/       # Module 9: Simulation & Integration Settings
│   ├── App.tsx             # Root layout & page router
│   ├── main.tsx            # React application entry point
│   └── index.css           # Tailwind directives & glassmorphic styling
├── index.html              # HTML template
├── package.json            # Project dependencies & scripts
├── tailwind.config.js      # Tailwind CSS dark theme configuration
├── tsconfig.json           # TypeScript configuration
└── vite.config.ts          # Vite configuration with network host enabled
```

---

## 🎯 Target SLA Benchmarks

- **Packet Loss Tolerance**: 0% dropped packets at maximum tested workload (1,000,000 events).
- **Dashboard Synchronization Delay**: $\le 500$ ms.
- **Database Write Deadlock Frequency**: 0.00%.

---

## 🛠️ Built With

- **React 19 / 18** with **TypeScript**
- **Vite**
- **Tailwind CSS**
- **Recharts**
- **Lucide React Icons**
- **Canvas Confetti**
