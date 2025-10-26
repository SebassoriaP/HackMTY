#!/bin/bash

# Script para iniciar el servidor Backend AI
# Usage: ./start_backend.sh

echo "🚀 Iniciando Backend AI - YOLO Detection Server"
echo "================================================"

# Verificar si estamos en el directorio correcto
if [ ! -d "backend_ai" ]; then
    echo "❌ Error: Debes ejecutar este script desde la raíz del proyecto"
    exit 1
fi

cd backend_ai

# Verificar si el entorno virtual existe
if [ ! -d "venv" ]; then
    echo "📦 Creando entorno virtual..."
    python3 -m venv venv
    echo "✓ Entorno virtual creado"
fi

# Activar entorno virtual
echo "🔌 Activando entorno virtual..."
source venv/bin/activate

# Instalar/actualizar dependencias
echo "📥 Instalando dependencias..."
pip install -q -r requirements.txt

# Verificar que todo esté instalado
if [ $? -ne 0 ]; then
    echo "❌ Error al instalar dependencias"
    exit 1
fi

echo "✓ Dependencias instaladas"
echo ""
echo "🌐 Iniciando servidor en http://localhost:8000"
echo "📡 WebSocket: ws://localhost:8000/ws/detect"
echo "📚 Docs: http://localhost:8000/docs"
echo ""
echo "Presiona Ctrl+C para detener el servidor"
echo ""

# Iniciar servidor
python server.py
