# O FILME — slot do Higgsfield

A seção do filme (`#film` no `index.html`) é o centro da experiência.

**Status: preenchido.** O arquivo `higgsfield-film.mp4` já está no lugar —
1280×720, 16:9, 8 s, em loop. O pôster (`assets/film-poster.jpg`) é o
próprio primeiro quadro do filme, então a imagem fixa e o vídeo coincidem e o
player não salta ao iniciar.

---

## 1 · Substituindo o filme

Sobrescreva este arquivo:

```
video/higgsfield-film.mp4      ← o filme (H.264 / AAC)
```

Em seguida, gere novamente o pôster para que ele corresponda ao novo primeiro
quadro; caso contrário, o player exibirá o pôster antigo antes da reprodução.
Qualquer captura de frame funciona — exporte um still em 0 s no editor e salve
em `assets/film-poster.jpg` em 1280×720.

Para também servir um WebM mais leve, liste-o **antes** do MP4 no
`index.html`:

```html
<source src="video/higgsfield-film.webm" type="video/webm">
<source src="video/higgsfield-film.mp4" type="video/mp4">
```

O `tools/build_assets.py` não sobrescreve o `film-poster.jpg` uma vez que ele
existe.

## 2 · Configurações de exportação

| | |
|---|---|
| Proporção | 16:9 |
| Resolução | 1920×1080 (1280×720 também serve) |
| Taxa de quadros | 24 fps — a leitura cinematográfica |
| Codec | H.264, contêiner MP4 |
| Duração | 12–25 s, com loop limpo (ele faz loop na página) |
| Bitrate | 6–10 Mbps, depois comprimir para ≈ 8–15 MB |
| Áudio | Opcional. Começa em mudo; o som só toca quando o visitante pede |

Mantenha o primeiro e o último quadro próximos entre si — o player faz loop.

## 3 · Brief de geração

A direção da seção é escrita para ser lenta, iluminada como galeria, material e
premium. Cole qualquer um desses prompts no Higgsfield:

**A — a órbita (recomendado para o slot principal)**

> Órbita cinematográfica lenta ao redor de uma escultura colecionável em vinil,
> de tom cinza mate, com figura cartoon-like e olhos em X cruzados, em pé sobre
> um pedestal preto em uma sala de museu escura. Luz principal suave vinda de
> cima, queda profunda em direção ao preto, destaques especulares suaves
> percorrendo a superfície moldada. Profundidade de campo rasa, sensação
> anamórfica, 24 fps, sem tremor de câmera, sem texto.

**B — o estudo da superfície**

> Deriva macro de close-up extremo sobre a superfície de uma figura em vinil
> fundido: linhas de costura, transição matte-to-gloss, marcas de moldagem, a
> borda de um X pintado. Empurrão lento para dentro, paleta de cinza frio com
> um destaque quente, poeira no ar, iluminação de galeria, cinematográfico,
> 24 fps.

**C — o ensaio de transição**

> Uma galeria escura: uma figura escultórica iluminada de cima. A câmera avança
> e o ambiente dissolve de uma sala de museu branca para uma parede coberta por
> grafite, depois para uma vitrine com uma versão meio dissecada da mesma
> figura. Místico, premium, alto contraste, câmera lenta, sem texto, sem logos.

## 4 · Onde aparece no código

- Estrutura da seção: `index.html` → procurar por `HIGGSFIELD FILM GOES HERE`
- Estilo: `css/style.css` → seção `10 · FILM`
- Comportamento: `js/main.js` → seção `09 · FILM PLAYER`
