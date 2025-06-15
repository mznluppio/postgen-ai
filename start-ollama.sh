#!/bin/sh

# Démarrer Ollama en arrière-plan
ollama serve &
PID=$!

# Attendre que le serveur soit prêt
echo "⏳ Attente que Ollama soit prêt..."
until curl -s http://localhost:11434 > /dev/null; do
  sleep 1
done

# Télécharger le modèle
echo "📦 Téléchargement du modèle llama3.2..."
ollama run llama3.2

# Rester en foreground sur le serveur
wait $PID
