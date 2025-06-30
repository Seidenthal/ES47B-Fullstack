# Script PowerShell para gerar certificados SSL auto-assinados para desenvolvimento
# ATENÇÃO: Não use estes certificados em produção!

Write-Host "Gerando certificados SSL auto-assinados para desenvolvimento..." -ForegroundColor Green

# Criar diretório de certificados
if (!(Test-Path "certs")) {
    New-Item -ItemType Directory -Path "certs"
}

# Verificar se OpenSSL está disponível
try {
    $null = Get-Command openssl -ErrorAction Stop
    
    # Gerar certificado auto-assinado usando OpenSSL
    openssl req -x509 -newkey rsa:4096 -keyout certs/server.key -out certs/server.cert -days 365 -nodes -subj "/C=BR/ST=Estado/L=Cidade/O=ES47B-Fullstack/OU=Dev/CN=localhost"
    
    Write-Host "Certificados gerados em ./certs/" -ForegroundColor Green
    Write-Host "server.key - Chave privada" -ForegroundColor Yellow
    Write-Host "server.cert - Certificado público" -ForegroundColor Yellow
    
} catch {
    Write-Host "OpenSSL não encontrado. Gerando certificado usando PowerShell..." -ForegroundColor Yellow
    
    # Alternativa usando PowerShell nativo (Windows 10/11)
    $cert = New-SelfSignedCertificate -DnsName "localhost" -CertStoreLocation "cert:\LocalMachine\My" -KeyLength 4096 -KeyAlgorithm RSA -HashAlgorithm SHA256 -KeyUsage KeyEncipherment,DigitalSignature -Type SSLServerAuthentication -NotAfter (Get-Date).AddDays(365)
    
    # Exportar certificado
    $certBytes = $cert.Export([System.Security.Cryptography.X509Certificates.X509ContentType]::Cert)
    [System.IO.File]::WriteAllBytes("certs\server.cert", $certBytes)
    
    # Exportar chave privada (necessário exportar via pfx primeiro)
    $password = ConvertTo-SecureString -String "temp" -Force -AsPlainText
    Export-PfxCertificate -Cert $cert -FilePath "certs\temp.pfx" -Password $password | Out-Null
    
    # Converter pfx para pem usando OpenSSL se disponível, senão aviso
    Write-Host "Certificado gerado usando PowerShell. Para usar HTTPS, você pode precisar converter o formato." -ForegroundColor Yellow
    Write-Host "Certificado salvo em: certs\server.cert" -ForegroundColor Green
    
    # Limpar certificado temporário do store
    Remove-Item "cert:\LocalMachine\My\$($cert.Thumbprint)" -Force
}

Write-Host ""
Write-Host "IMPORTANTE: Estes são certificados auto-assinados apenas para desenvolvimento!" -ForegroundColor Red
Write-Host "Para produção, use certificados válidos de uma CA confiável." -ForegroundColor Red
