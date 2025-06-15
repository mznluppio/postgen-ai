#!/bin/sh

# Installer le modèle llama3:8b (ou autre)
echo "Vérification et installation du modèle llama3.2..."
ollama pull llama3.2

# Lancer le serveur Ollama
echo "Lancement du serveur Ollama..."
exec ollama serve
