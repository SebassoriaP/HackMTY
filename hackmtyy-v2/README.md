# Airline Catering Sim

Proyecto desarrollado con React + TypeScript + Vite + Firebase

## 🚀 Configuración del Proyecto

### Prerrequisitos

- Node.js (versión 16 o superior)
- npm o yarn

### Instalación

1. Clona el repositorio:
```bash
git clone <url-del-repositorio>
cd hackmtyy-v2
```

2. Instala las dependencias:
```bash
npm install
```

3. Configura las variables de entorno:
   - Copia el archivo `.env.example` a `.env`
   - Solicita las credenciales de Firebase al equipo
   - Completa las variables en el archivo `.env`

```bash
cp .env.example .env
```

### Variables de Entorno

El proyecto requiere las siguientes variables de entorno de Firebase:

- `VITE_FIREBASE_API_KEY`: API Key de Firebase
- `VITE_FIREBASE_AUTH_DOMAIN`: Dominio de autenticación
- `VITE_FIREBASE_PROJECT_ID`: ID del proyecto
- `VITE_FIREBASE_STORAGE_BUCKET`: Bucket de storage
- `VITE_FIREBASE_MESSAGING_SENDER_ID`: Sender ID para mensajería
- `VITE_FIREBASE_APP_ID`: App ID de Firebase

**Nota:** ⚠️ Nunca compartas o subas el archivo `.env` al repositorio.

## 💻 Comandos Disponibles

### Desarrollo
```bash
npm run dev
```
Inicia el servidor de desarrollo en `http://localhost:5173`

### Build
```bash
npm run build
```
Compila el proyecto para producción en la carpeta `dist/`

### Preview
```bash
npm run preview
```
Previsualiza la versión de producción localmente

### Lint
```bash
npm run lint
```
Verifica errores de TypeScript sin compilar

## 📁 Estructura del Proyecto

```
src/
├── components/       # Componentes React
├── context/         # Context API de React
├── data/            # Datos estáticos y mock
├── firebase/        # Configuración de Firebase
├── App.tsx          # Componente principal
├── main.tsx         # Punto de entrada
├── styles.css       # Estilos globales
└── types.ts         # Tipos TypeScript
```

## 🤝 Contribuir

1. Crea un branch para tu feature: `git checkout -b feature/nueva-caracteristica`
2. Haz commit de tus cambios: `git commit -m 'Add: nueva característica'`
3. Push al branch: `git push origin feature/nueva-caracteristica`
4. Abre un Pull Request

## 📝 Licencia

Proyecto privado para HackMTY
