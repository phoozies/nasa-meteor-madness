# Meteor Madness 🌍💥

**2025 NASA Space Apps Challenge - Asteroid Defense Simulation Platform**

An interactive educational platform that transforms complex astronomical data into accessible, engaging tools for understanding asteroid impact risks and mitigation strategies. Built for scientists, policymakers, educators, and the public.

## 🎯 Project Overview

Meteor Madness addresses the challenge of making asteroid impact science accessible by integrating real NASA Near-Earth Object (NEO) data and USGS geological datasets into an interactive web platform. Users can:

- **Simulate asteroid impacts** with scientifically accurate physics calculations
- **Visualize real NEO data** from NASA's tracking systems  
- **Explore mitigation strategies** like kinetic impactors and gravity tractors
- **Learn through interactive education** modules and quizzes
- **Assess regional risks** using integrated geological and environmental data

## 🚀 Features

### 🎮 Interactive Simulation
- Real-time asteroid impact modeling
- Adjustable parameters (size, velocity, angle, composition)
- Physics-based calculations for crater size, seismic effects, and damage zones
- 3D trajectory visualization

### 📊 Data Visualization  
- Live NASA NEO API integration
- Interactive maps with USGS geological data
- Risk assessment overlays
- Customizable filters and views

### 🛡️ Mitigation Analysis
- Comprehensive deflection strategy comparison
- Mission feasibility assessments  
- Success probability calculations
- Timeline and cost analysis

### 🎓 Educational Content
- Interactive learning modules
- Concept explanations with tooltips
- Knowledge testing quizzes
- Scientific resource links

## 🛠️ Technology Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type safety and developer experience  
- **Tailwind CSS** - Utility-first styling
- **React Three Fiber** - 3D visualizations
- **React Leaflet** - Interactive maps
- **D3.js** - Data visualization charts

### Backend & APIs
- **Next.js API Routes** - Server-side data processing
- **NASA NEO API** - Real asteroid tracking data
- **USGS APIs** - Geological and seismic information
- **Axios** - HTTP client for external APIs

## 🏗️ Quick Start

```bash
# Clone the repository
git clone https://github.com/phoozies/nasa-meteor-madness.git
cd nasa-meteor-madness

# Install dependencies
npm install

# Set up environment variables (optional - works with demo key)
echo "NASA_API_KEY=DEMO_KEY" > .env.local

# Run development server
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev

# Open http://localhost:3000 in your browser
```

## 📁 Project Structure

The project is organized into a clean, modular structure:

- **`/src/app`** - Next.js App Router pages (simulation, visualization, mitigation, education, about)
- **`/src/components`** - Reusable UI components organized by functionality
- **`/src/lib`** - Core utilities, API services, and scientific calculations
- **`/public`** - Static assets and 3D textures

## 🎯 NASA Space Apps Challenge

This project addresses the **"Meteor Madness"** challenge by providing:

✅ **Real Data Integration** - NASA NEO API + USGS geological datasets  
✅ **Interactive Simulations** - Physics-based impact modeling  
✅ **Educational Focus** - Accessible to multiple audiences  
✅ **Mitigation Analysis** - Deflection strategy evaluation  
✅ **Scientific Accuracy** - Established physics relationships  

## 🤝 Contributing

This project was built for the 2025 NASA Space Apps Challenge. The folder structure is ready for:

- Additional visualization components
- Enhanced simulation physics
- More mitigation strategies
- Extended educational content
- API integrations with additional data sources

---

**Built with 💙 for Earth's Defense**  
*2025 NASA Space Apps Challenge • October 4-5, 2025*