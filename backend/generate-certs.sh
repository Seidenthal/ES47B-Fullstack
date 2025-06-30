#!/bin/bash

# Script para gerar certificados SSL auto-assinados para desenvolvimento
# ATENÇÃO: Não use estes certificados em produção!

echo "Gerando certificados SSL auto-assinados para desenvolvimento..."

# Criar diretório de certificados
mkdir -p certs

# Gerar certificado auto-assinado
openssl req -x509 -newkey rsa:4096 -keyout certs/server.key -out certs/server.cert -days 365 -nodes -subj "/C=BR/ST=Estado/L=Cidade/O=ES47B-Fullstack/OU=Dev/CN=localhost"

echo "Certificados gerados em ./certs/"
echo "server.key - Chave privada"
echo "server.cert - Certificado público"
echo ""
echo "IMPORTANTE: Estes são certificados auto-assinados apenas para desenvolvimento!"
echo "Para produção, use certificados válidos de uma CA confiável."
