# Tradutor Ágil

Extensão Manifest V3 para traduzir um trecho do português para o inglês pelo menu do botão direito. O nome exibido pelo Chrome é **Tradução Ágil**.

## Instalação e configuração

1. Baixe o ZIP do repositório e extraia os arquivos, ou faça um clone com Git.
2. No Google Chrome (106 ou superior), abra `chrome://extensions` e ative **Modo do desenvolvedor**.
3. Clique em **Carregar sem compactação** e selecione a subpasta **tradutor-agil**, que contém `manifest.json`.
4. Mantenha a pasta no mesmo local. Depois de atualizar os arquivos, clique em **Recarregar** no cartão da extensão e atualize a página de teste.

Os ícones já estão incluídos. A instalação dispensa build, chave de API e conta no serviço. Para documentos HTML locais, habilite **Permitir acesso a URLs de arquivo** nos detalhes da extensão.

## Uso

Selecione **Bom dia** em uma página comum, clique com o botão direito e escolha **Traduzir com Tradução Ágil**. O cartão mostra o original e a tradução. Clique em **Copiar tradução** para copiar. Pressione **Esc** ou clique fora para fechar. O ícone da barra de ferramentas abre as instruções.

Seleções em páginas incorporadas podem aparecer no canto superior da página principal. O Chrome restringe extensões em páginas internas e na Chrome Web Store. Se o navegador bloquear a área de transferência, selecione a tradução e use o comando de cópia do sistema.

## Serviço e privacidade

Ao escolher o comando, a extensão envia o texto selecionado ao Google por HTTPS, como parâmetro da URL de tradução. Apenas o trecho selecionado é incluído na consulta. A extensão não mantém histórico e não solicita cookies na requisição. O Google recebe o texto e o endereço IP da conexão. A página onde o cartão aparece pode acessar o texto exibido e sua tradução. O texto também pode constar nos registros do serviço ou em sistemas de rede que inspecionem a conexão. Evite selecionar senhas, dados pessoais sensíveis ou informações confidenciais.

O endpoint utilizado é `translate.googleapis.com/translate_a/single` com o cliente `gtx`. Esse endpoint não é a API oficial documentada do Cloud Translation e não oferece garantia de estabilidade ou suporte para este uso. A extensão depende da disponibilidade e do formato dessa resposta. A espera é limitada a 12 segundos e cada seleção a 4.500 bytes em UTF-8. Em caso de falha de conexão, tente novamente pelo menu. Para seleções maiores, traduza por trechos.

| Permissão | Uso |
| --- | --- |
| contextMenus | Adiciona o comando para a seleção. |
| activeTab e scripting | Abrem o cartão na aba em que o usuário acionou o menu. |
| https://translate.googleapis.com/* | Permite a consulta ao serviço de tradução pelo processo de fundo. |

## Desenvolvimento e verificação

A pasta `tradutor-agil/` contém toda a extensão. O arquivo `background.js` registra o menu e consulta o serviço. O arquivo `content.js` cria o cartão em Shadow DOM. O arquivo `popup.html` contém a ajuda. O script opcional `create_icons.py` usa Pillow para regenerar os ícones a partir da raiz do projeto.

Execute a partir da raiz com Node.js 20 ou superior. Os testes unitários usam respostas simuladas e não exigem acesso à rede.

```sh
node --check tradutor-agil/background.js
node --check tradutor-agil/content.js
node --test tests/background.test.cjs
```

Para testar a integração real, siga o exemplo de **Bom dia** em uma página HTTPS. Confira o resultado em inglês, a cópia e o fechamento. Repita perto da borda inferior após rolar a página. Desconecte a rede e repita para conferir a mensagem de falha.

## Licença

Distribuído sob a licença MIT. Consulte o arquivo LICENSE.
