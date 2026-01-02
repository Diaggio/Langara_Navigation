# LangaraNAV

LangaraNAV is an indoor navigation web application designed to help students navigate the buildings of Langara College. 

This project uses custom-processed SVG floor plans and Dijkstra's algorithm to provide real-time pathfinding across multiple floors and buildings.

## 🚀 Features
- **Smart Search:** Find any room by number or name.
- **Indoor Pathfinding:** Get the shortest route between any two rooms.
- **Multi-Floor Navigation:** Seamless transitions between floors via stairs and elevators.
- **Accessibility Mode:** Option to prioritize elevator-only routes.
- **Interactive Maps:** Smooth zooming, panning, and room highlighting.

## 🛠️ Technical Stack
- **Frontend:** React + Vite
- **Logic:** Custom Graph implementation and Dijkstra's Algorithm.
- **Data:** Python-extracted node networks from SVG architectural plans.
- **UI Interaction:** `react-zoom-pan-pinch` for map handling.
