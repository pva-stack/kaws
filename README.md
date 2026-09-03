# ARCHIVE ✕✕ — Companion Reimaginado

Uma **exposição digital conceitual** inspirada na linguagem visual da escultura
colecionável contemporânea e da cultura de rua: uma cena de galeria em tons
escuros, duas inversões em branco de museu, uma grade editorial com etiquetas
técnicas e um filme cinematográfico em Higgsfield no centro da experiência.

Sem frameworks, sem etapa de build e sem dependências. Abra o `index.html` e a
página funciona.

---

## Como executar

Qualquer servidor estático serve:

```bash
python -m http.server 5178
```

Em seguida, abra <http://localhost:5178>. (Abrir o arquivo diretamente com
`file://` também funciona, mas um servidor é melhor — ele permite que o
elemento `<video>` seja transmitido corretamente.)

## O filme

A seção do filme é o centro da experiência e está preenchida com:
`video/higgsfield-film.mp4` — 1280×720, 16:9, 8 s, em loop. Ele reproduz em
mudo ao entrar na tela, liga o som ao clicar e expande para o modo cinema
(Esc para sair). O pôster é o próprio primeiro quadro do filme, então a imagem
fixa e o vídeo coincidem e nada salta ao iniciar a reprodução.

Para trocar o filme, sobrescreva esse arquivo e salve um novo primeiro quadro em
`assets/film-poster.jpg`. **O `video/README.md` contém as configurações de
exportação e os prompts do Higgsfield** ajustados à direção artística da seção.

Se o arquivo estiver ausente ou ilegível, o player informa isso no próprio local
e orienta onde colocar o arquivo — a página nunca mostra uma imagem quebrada.

## Estrutura

```
index.html                 uma página, 13 seções, semântica + etiquetas
css/style.css              sistema de design → componentes → movimento → responsividade
js/main.js                 vanilla, ~15 módulos independentes
assets/                    biblioteca final de imagens (gerada, não editar manualmente)
images/                    capturas originais de referência (fonte de verdade)
tools/build_assets.py      regenera assets/ a partir de images/
video/                     o slot do Higgsfield + sua brief
```

### A jornada

| | Seção | Base | Destaque |
|---|---|---|---|
| 01 | Hero — vista da instalação | preto | ácido |
| 02 | Manifesto | **papel** | rosa |
| 03 | Figuras em destaque — estudo de rotação + edição preta | preto | ácido |
| 04 | Anatomia — exemplar fixo com hotspots | preto | ciano |
| 05 | **O filme — Higgsfield** | quase preto | ácido |
| 06 | Exposição — sala de galeria | **papel** | rosa |
| 07 | Evolução da forma — blueprint | azul-marinho profundo | ciano |
| 08 | Rua — do muro ao objeto | preto | rosa |
| 09 | Lançamentos limitados | preto | ácido / rosa |
| 10 | Vestuário | preto | ácido |
| 11 | Arquivo — índice horizontal | preto | — |
| 12 | Acesso | preto | ácido |

Uma cor de destaque por seção, nunca todas de uma vez. As duas seções em papel
são o ritmo: elas evitam que o fundo escuro vire um simples papel de parede.

## Assets

As capturas de referência em `images/` possuem tipografia mockada gravada no
arquivo, então não são usadas diretamente. O `tools/build_assets.py` transforma
essas imagens em uma biblioteca limpa:

- **as figuras são recortadas** do fundo branco do estúdio — preenchimento
  de borda, segunda varredura rígida para bolsos selados (o espaço entre as
  pernas é fechado onde as botas se encontram), varredura de contorno e
  desmultiplicação mate para que uma figura preta não mantenha contorno branco
  em um palco preto;
- **as placas fotográficas são recortadas** para remover qualquer texto
  gravado e depois ampliadas com LANCZOS + unsharp para manter qualidade em
  1440/1920;
- um **pôster de filme** e uma placa de **grain** em mosaico são gerados.

```bash
python tools/build_assets.py      # requer Pillow
```

Tudo em `assets/` é gerado. Edite o script, não a saída.

## Observações sobre a construção

- **Tipografia** — Archivo (display, largura variável), Inter (UI), JetBrains
  Mono (etiquetas técnicas), carregadas do Google Fonts com stacks reais de
  fallback.
- **Movimento** — uma única curva de easing (`cubic-bezier(.16,1,.3,1)`),
  transform e opacidade apenas, IntersectionObserver para cada revelação e um
  bus de rolagem com rAF em vez de listeners concorrentes.
- **`prefers-reduced-motion`** — paralaxe, marquee, cursor customizado, deriva
  do grain e todas as transições de revelação são removidas; a página continua
  completa.
- **Acessibilidade** — skip link, anéis de foco visível, labels aria na navegação,
  menu e player, texto alternativo em todas as imagens e trilha do arquivo
  acessível por teclado.
- **Desempenho** — sem bibliotecas, carregamento lento abaixo da dobra,
  `width`/`height` nas imagens para manter o layout, marquee pausada fora da
  tela e o cursor estaciona quando está ocioso.

## Aviso legal

Peça conceitual independente e não comercial inspirada na linguagem visual do
KAWS. Não é um site oficial e não é afiliado nem endossado pelo artista ou por
nenhum detentor de direitos. As imagens de referência são usadas apenas para
estudo.
