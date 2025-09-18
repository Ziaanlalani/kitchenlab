# Expo Web Prototype

This is a prototype React Native project built with [Expo](https://expo.dev/), currently optimized to run **only on the web via localhost**. It is not yet compatible with the Expo Go mobile app.

---

## 🚀 Prerequisites

Before getting started, ensure you have the following installed:

- **Node.js** (v16 or newer recommended) – [Download Node.js](https://nodejs.org/)
- **Expo CLI** – Install globally using:
  ```bash
  npm install -g expo-cli
  ```

---

## 📦 Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/your-repo-name.git
   cd your-repo-name
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server** (web only):
   ```bash
   expo start --web
   ```

4. **Open in browser**:
   - Visit `http://localhost:19006` (or the URL shown in the terminal)
   - The app should open in your default browser

---

## ⚠️ Note

This project is currently a **web-only prototype**. Mobile support via Expo Go is not implemented yet.

---

## 📂 Project Structure

```
.expo/
  └── metro/
  └── devices.json
node_modules/
src/
  ├── components/
  │   ├── LoadingScreen.tsx
  │   └── Logo.tsx
  ├── context/
  │   ├── DancingScript.ttf
  │   └── ThemeContext.tsx
  ├── screens/
  │   ├── ChatScreen.tsx
  │   ├── ChatScreenWorking.tsx
  │   ├── ConversionScreen.tsx
  │   ├── NotesScreen.tsx
  │   ├── ScannerScreen.tsx
  │   └── TimerScreen.tsx
  └── assets/   # (optional - add here if used)
App.tsx
babel.config.js
metro.config.js
package.json
package-lock.json
README.md
tsconfig.json
```

---

## 🙋‍♂ Support

For questions or issues, feel free to open an [issue](https://github.com/your-username/your-repo-name/issues).
Refer to the documentation for React Native for further information: (https://reactnative.dev/docs/getting-started)