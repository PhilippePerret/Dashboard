#!/usr/bin/env bash
# 
# Script pour lancer le serveur Puma qui recevra les url-runner
# et les exécutera.
# 

dossier=$(dirname $(readlink -f "${BASH_SOURCE}"))
# main_folder=$(dirname $(readlink -f "${dossier}"))

ruby "${dossier}/server.rb"
