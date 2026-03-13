# MultiHub

A multi-platform dashboard built with React and Vite that aggregates four distinct services — weather, job listings, recipes, and news headlines — into a single, unified interface.

---

## Overview

MultiHub was developed as a React fundamentals project demonstrating real-world API integration, component-based architecture, and responsive UI design. The application features a collapsible sidebar on desktop and a drawer-style navigation on mobile, with persistent user preferences stored via localStorage.

---

## Features

**Weather**
Search any city worldwide and view current temperature, humidity, wind speed, and weather conditions. Toggle between Celsius and Fahrenheit. Includes a curated list of default cities across India and major global destinations.

**Job Portal**
Fetches live job listing data and allows users to search by role, company, or location. Jobs can be saved and unsaved, with the saved list persisted across sessions.

**Recipe Finder**
Displays recipes across multiple categories with infinite scroll pagination. Supports vegetarian filtering, ingredient details, and links to instructional videos. Favourites are saved to localStorage.

**News Headlines**
Fetches top headlines across seven categories: general, technology, business, sports, entertainment, health, and science. Articles can be marked as read, with read state persisted across sessions.

---

## Tech Stack

- React 18
- Vite 5
- React Icons
- OpenWeatherMap API
- NewsAPI
- TheMealDB API
- JSONPlaceholder API

---

## Getting Started

**Prerequisites**

- Node.js 18 or higher
- npm

**Installation**

```bash
git clone https://github.com/sambhavdwivediofficial/Multihub.git
cd multihub
npm install
```

**Environment Variables**

Create a `.env` file in the project root:

```
VITE_WEATHER_API_KEY=your_openweathermap_api_key
VITE_NEWS_API_KEY=your_newsapi_api_key
```

- OpenWeatherMap API key: [openweathermap.org](https://openweathermap.org/api)
- NewsAPI key: [newsapi.org](https://newsapi.org)

**Run locally**

```bash
npm run dev
```

The application will open at `http://localhost:5173`.

**Build for production**

```bash
npm run build
```

---

## Project Structure

```
src/
├── components/
│   ├── Sidebar/
│   │   └── Sidebar.jsx
│   ├── Weather/
│   │   └── Weather.jsx
│   ├── Jobs/
│   │   └── Jobs.jsx
│   ├── Recipe/
│   │   └── Recipe.jsx
│   └── News/
│       └── News.jsx
├── App.jsx
├── App.css
└── main.jsx
```

---

## React Concepts Demonstrated

- `useState` for UI state and data management
- `useEffect` for API calls and side effects
- Conditional rendering for loading, error, and empty states
- `map()` with proper keys for list rendering
- Search and filter interactions
- Toggle interactions (unit toggle, veg filter, save/unsave, mark as read)
- `localStorage` for persistent state across sessions

---

## License

This project is licensed under the MIT License.

```
MIT License

Copyright (c) 2026 Sambhav Dwivedi

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## Author

**Sambhav Dwivedi**
[sambhavdwivedi.in](https://sambhavdwivedi.in)