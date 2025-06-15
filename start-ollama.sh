#!/bin/sh
# Installe le modèle llama3 s'il n'est pas déjà installé
if ! ollama list | grep -q "llama3.2"; then
  echo "Modèle llama3.2 non trouvé, installation en cours..."
  ollama pull llama3.2
else
  echo "Modèle llama3.2 déjà installé."
fi

# Démarre Ollama en mode serveur
ollama serve
