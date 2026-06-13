#!/usr/bin/env node
/**
 * Script para adicionar suporte a SPA routing no GitHub Pages
 * Injeta o script de redirecionamento no index.html após a build do Expo
 */

const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, '../dist/index.html');

const redirectScript = `  <script>
    // GitHub Pages SPA routing - Processa redirecionamento armazenado
    if (sessionStorage.redirect) {
      const redirect = sessionStorage.redirect;
      delete sessionStorage.redirect;
      const pathArray = redirect.split('?');
      const pathToRoute = pathArray[0];
      if (window.location.pathname !== pathToRoute) {
        window.history.replaceState(null, null, pathToRoute + (pathArray[1] ? '?' + pathArray[1] : ''));
      }
    }
  </script>
`;

try {
  let html = fs.readFileSync(indexPath, 'utf-8');
  
  // Verifica se o script já foi adicionado
  if (html.includes('sessionStorage.redirect')) {
    console.log('✓ Script de redirecionamento já presente');
    process.exit(0);
  }
  
  // Adiciona o script no final do <head> (antes de fechar)
  html = html.replace('</head>', redirectScript + '</head>');
  
  fs.writeFileSync(indexPath, html, 'utf-8');
  console.log('✓ Script de redirecionamento injetado com sucesso');
  process.exit(0);
} catch (error) {
  console.error('✗ Erro ao injetar script de redirecionamento:', error.message);
  process.exit(1);
}
