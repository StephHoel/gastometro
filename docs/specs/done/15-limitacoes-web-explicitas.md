# Mini-spec: Limitações web explicitamente documentadas

Número: 15
Status: implementado

## Problema

A compatibilidade web com GitHub Pages já está funcional, mas as limitações específicas da plataforma ainda aparecem de forma parcial e dispersa. Isso aumenta o risco de interpretação errada sobre paridade com Android, comportamento de fallbacks e expectativas de uso em navegador.

## Objetivo

Determinar, consolidar e documentar explicitamente as limitações conhecidas da versão web do Gastômetro, deixando claro para usuários e contribuidores o que funciona, o que depende do navegador e o que continua fora de escopo na plataforma web.

## Comportamento esperado

- A documentação do projeto deve ter uma seção dedicada e fácil de localizar sobre limitações da versão web.
- As limitações descritas devem refletir o comportamento real já implementado, sem prometer paridade total com Android.
- Diferenças entre Android e web devem ser descritas em linguagem objetiva, com foco em impacto prático para uso e suporte.
- Limitações técnicas relevantes para deploy e troubleshooting web devem ficar registradas em documentação voltada a desenvolvimento.

## Telas afetadas

- Sem telas novas.
- README do projeto.
- Documentação de deploy e operação web.
- Opcionalmente, specs e notas de compatibilidade quando necessário para manter consistência.

## Dados e persistência

- A documentação deve explicitar que os dados da web ficam isolados no storage do navegador.
- Deve ficar claro que não existe sincronização entre web e Android.
- Deve ficar claro que limpeza de dados do navegador pode remover os dados persistidos da versão web.
- Não alterar formato de persistência nem chave atual do storage.

## Regras de validação

- Registrar apenas limitações confirmadas pelo comportamento atual do app ou pela infraestrutura usada no projeto.
- Diferenciar limitação estrutural da web de limitação atual de implementação.
- Evitar linguagem ambígua como "pode funcionar" quando o comportamento esperado já for conhecido.
- Manter coerência entre README, `docs/WEB_DEPLOY.md` e mini-spec da web quando o mesmo tema aparecer em mais de um documento.
- Preservar textos em pt-BR e alinhados ao foco Android-first do projeto.

## Critérios de aceite

- [x] Existe uma lista explícita de limitações web em local de fácil acesso para usuários do projeto.
- [x] A documentação informa que compartilhamento via WhatsApp na web usa `wa.me`/WhatsApp Web, não deep link nativo.
- [x] A documentação informa que clipboard na web depende da Clipboard API do navegador e de contexto compatível (`https` ou `localhost`).
- [x] A documentação informa que persistência web é local ao navegador e separada do Android.
- [x] A documentação informa que a versão web ainda não possui suporte offline completo/PWA e depende de carregamento inicial com internet.
- [x] A documentação informa limitações conhecidas do fallback de roteamento SPA quando isso impactar comportamento observado ou troubleshooting.
- [x] Não há contradição entre README e `docs/WEB_DEPLOY.md` sobre capacidades e limites da plataforma web.

## Fora de escopo

- Implementar novas capacidades web para eliminar as limitações listadas.
- Adicionar sincronização entre plataformas.
- Criar Service Worker/PWA nesta entrega.
- Alterar o comportamento atual de compartilhamento, clipboard ou persistência.
- Criar suíte E2E para validar a documentação.

## Limitações documentadas

- Compartilhamento via WhatsApp na web ocorre por URL `wa.me`/WhatsApp Web, sem a mesma experiência de deep link nativo do Android.
- Clipboard na web depende de permissão do navegador, HTTPS ou `localhost`, podendo falhar por bloqueio do ambiente.
- Persistência fica restrita ao navegador/dispositivo atual e pode ser perdida ao limpar dados locais.
- Web e Android não compartilham armazenamento nem sincronizam listas.
- A build web não oferece suporte PWA/offline completo no estado atual.
- O fallback de rotas profundas no GitHub Pages depende de `404.html` + `sessionStorage`; com storage desabilitado, o retorno da rota pode falhar.
- Recursos nativos fora do escopo web, como notificações push e integrações específicas do dispositivo, não devem ser anunciados como disponíveis na web.

## Observações para IA

- Antes de alterar limitações web, revisar `README.md`, `docs/WEB_DEPLOY.md` e mini-spec da web para evitar divergências.
- Se alguma limitação ainda estiver incerta, confirmar o comportamento no app ou no código antes de documentar como fato.
- Priorizar documentação útil para suporte e expectativa de uso, não apenas notas internas de implementação.

## Registro de implementação

- 2026-06-13: seção de limitações web consolidada no `README.md`.
- 2026-06-13: seção de limitações conhecidas de deploy/documentação web ampliada em `docs/WEB_DEPLOY.md`.
