// ================================================================
// WHATSAPP DA SANTA CHAPA
// ================================================================

const numeroWhatsApp = "5548998469374";


// ================================================================
// VARIÁVEIS PRINCIPAIS
// ================================================================

const carrinho = [];

let produtoSelecionado = null;
let localizacaoCliente = "";


// ================================================================
// ELEMENTOS DO HTML
// ================================================================

const painelCarrinho =
  document.getElementById("carrinho");

const fundoModal =
  document.getElementById("fundoModal");

const listaCarrinho =
  document.getElementById("listaCarrinho");

const contadorCarrinho =
  document.getElementById("contadorCarrinho");

const contadorFlutuante =
  document.getElementById("contadorFlutuante");

const valorTotal =
  document.getElementById("valorTotal");

const modalObservacao =
  document.getElementById("modalObservacao");

const observacaoItem =
  document.getElementById("observacaoItem");

const pagamento =
  document.getElementById("pagamento");

const campoTroco =
  document.getElementById("campoTroco");

const botaoLocalizacao =
  document.getElementById("usarLocalizacao");

const statusLocalizacao =
  document.getElementById("statusLocalizacao");

const areaOpcionais =
  document.getElementById("areaOpcionais");

const listaOpcionais =
  document.getElementById("listaOpcionais");

const totalItemModal =
  document.getElementById("totalItemModal");


// ================================================================
// LOCALIZAÇÃO ATUAL DO CLIENTE
// ================================================================

botaoLocalizacao.addEventListener(
  "click",
  function () {

    if (!navigator.geolocation) {

      statusLocalizacao.textContent =
        "Seu navegador não permite obter a localização.";

      return;
    }

    botaoLocalizacao.disabled = true;

    botaoLocalizacao.textContent =
      "Buscando localização...";

    statusLocalizacao.textContent =
      "Autorize o acesso à localização quando o navegador solicitar.";

    navigator.geolocation.getCurrentPosition(
      function (posicao) {

        const latitude =
          posicao.coords.latitude;

        const longitude =
          posicao.coords.longitude;

        localizacaoCliente =
          `https://www.google.com/maps?q=${latitude},${longitude}`;

        statusLocalizacao.textContent =
          "Localização atual adicionada ao pedido.";

        botaoLocalizacao.textContent =
          "Localização adicionada";

        botaoLocalizacao.disabled = false;

      },
      function (erro) {

        const mensagens = {
          1: "Você não autorizou o acesso à localização.",
          2: "Não foi possível encontrar sua localização.",
          3: "A busca da localização demorou demais. Tente novamente."
        };

        statusLocalizacao.textContent =
          mensagens[erro.code] ||
          "Não foi possível obter sua localização.";

        botaoLocalizacao.textContent =
          "Tentar obter localização novamente";

        botaoLocalizacao.disabled = false;

      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0
      }
    );

  }
);


// ================================================================
// FILTROS DO CARDÁPIO
// ================================================================

const botoesFiltro =
  document.querySelectorAll(
    ".filtro-cardapio"
  );

const categoriasCardapio =
  document.querySelectorAll(
    ".categoria"
  );

botoesFiltro.forEach(function (botao) {

  botao.addEventListener(
    "click",
    function () {

      const filtroSelecionado =
        botao.dataset.filtro;

      botoesFiltro.forEach(
        function (item) {

          item.classList.remove("ativo");

        }
      );

      botao.classList.add("ativo");

      categoriasCardapio.forEach(
        function (categoria) {

          const deveAparecer =
            filtroSelecionado === "todos" ||
            categoria.dataset.categoria ===
              filtroSelecionado;

          if (deveAparecer) {

            categoria.classList.remove(
              "escondida"
            );

          } else {

            categoria.classList.add(
              "escondida"
            );

          }

        }
      );

    }
  );

});


// ================================================================
// FORMATAR VALORES EM REAIS
// ================================================================

function dinheiro(valor) {

  return valor.toLocaleString(
    "pt-BR",
    {
      style: "currency",
      currency: "BRL"
    }
  );

}


// ================================================================
// LER OS OPCIONAIS DO HTML
//
// FORMATO:
// Nome do adicional|preço;Outro adicional|preço
//
// EXEMPLO:
// Bacon extra|5;Queijo extra|3;Ovo|2
// ================================================================

function lerOpcionais(texto) {

  if (!texto || texto.trim() === "") {
    return [];
  }

  return texto
    .split(";")
    .map(function (opcional) {

      const partes =
        opcional.split("|");

      const nome =
        (partes[0] || "").trim();

      const preco =
        Number(
          (partes[1] || "0")
            .trim()
            .replace(",", ".")
        );

      return {

        nome: nome,

        preco:
          Number.isFinite(preco)
            ? preco
            : 0

      };

    })
    .filter(function (opcional) {

      return opcional.nome !== "";

    });

}


// ================================================================
// ATUALIZAR TOTAL DO PRODUTO NO MODAL
// ================================================================

function atualizarTotalItemModal() {

  if (!produtoSelecionado) {
    return;
  }

  const totalAdicionais =
    Array.from(
      listaOpcionais.querySelectorAll(
        'input[type="checkbox"]:checked'
      )
    )
      .reduce(
        function (soma, checkbox) {

          return (
            soma +
            Number(
              checkbox.dataset.preco
            )
          );

        },
        0
      );

  totalItemModal.textContent =
    dinheiro(
      produtoSelecionado.preco +
      totalAdicionais
    );

}


// ================================================================
// MOSTRAR OS OPCIONAIS DO PRODUTO
// ================================================================

function mostrarOpcionais(opcionais) {

  if (opcionais.length === 0) {

    areaOpcionais.hidden = true;

    listaOpcionais.innerHTML = "";

    return;
  }

  areaOpcionais.hidden = false;

  listaOpcionais.innerHTML =
    opcionais
      .map(
        function (opcional, indice) {

          const textoPreco =
            opcional.preco > 0
              ? `+ ${dinheiro(opcional.preco)}`
              : "Grátis";

          return `
            <label class="opcional-item">

              <span>

                <input
                  type="checkbox"
                  class="opcional-checkbox"
                  data-indice="${indice}"
                  data-preco="${opcional.preco}"
                >

                ${opcional.nome}

              </span>

              <strong>
                ${textoPreco}
              </strong>

            </label>
          `;

        }
      )
      .join("");

  listaOpcionais
    .querySelectorAll(
      ".opcional-checkbox"
    )
    .forEach(
      function (checkbox) {

        checkbox.addEventListener(
          "change",
          atualizarTotalItemModal
        );

      }
    );

}


// ================================================================
// MOSTRAR AVISO
// ================================================================

function mostrarAviso(texto) {

  const aviso =
    document.getElementById("aviso");

  aviso.textContent = texto;

  aviso.classList.add("mostrar");

  setTimeout(
    function () {

      aviso.classList.remove(
        "mostrar"
      );

    },
    2200
  );

}


// ================================================================
// ABRIR E FECHAR CARRINHO
// ================================================================

function abrirCarrinho() {

  painelCarrinho.classList.add(
    "aberto"
  );

  fundoModal.classList.add(
    "aberto"
  );

}

function fecharCarrinho() {

  painelCarrinho.classList.remove(
    "aberto"
  );

  fundoModal.classList.remove(
    "aberto"
  );

}


// ================================================================
// BOTÕES ADICIONAR
// ================================================================

document
  .querySelectorAll(".adicionar")
  .forEach(
    function (botao) {

      botao.addEventListener(
        "click",
        function () {

          const card =
            botao.closest(".produto");

          produtoSelecionado = {

            nome:
              card.dataset.nome,

            preco:
              Number(
                card.dataset.preco
              ),

            opcionais:
              lerOpcionais(
                card.dataset.opcionais
              )

          };

          document.getElementById(
            "nomeObservacao"
          ).textContent =
            produtoSelecionado.nome;

          observacaoItem.value = "";

          mostrarOpcionais(
            produtoSelecionado.opcionais
          );

          atualizarTotalItemModal();

          modalObservacao.classList.add(
            "aberto"
          );

        }
      );

    }
  );


// ================================================================
// CONFIRMAR PRODUTO
// ================================================================

document
  .getElementById("confirmarItem")
  .addEventListener(
    "click",
    function () {

      if (!produtoSelecionado) {
        return;
      }

      const observacao =
        observacaoItem.value.trim();

      const adicionaisSelecionados =
        Array.from(
          listaOpcionais.querySelectorAll(
            'input[type="checkbox"]:checked'
          )
        )
          .map(
            function (checkbox) {

              const indice =
                Number(
                  checkbox.dataset.indice
                );

              return (
                produtoSelecionado
                  .opcionais[indice]
              );

            }
          );

      const chaveAdicionais =
        adicionaisSelecionados
          .map(
            function (adicional) {

              return (
                `${adicional.nome}|` +
                `${adicional.preco}`
              );

            }
          )
          .join(";");

      const precoAdicionais =
        adicionaisSelecionados
          .reduce(
            function (
              soma,
              adicional
            ) {

              return (
                soma +
                adicional.preco
              );

            },
            0
          );

      const produtoExistente =
        carrinho.find(
          function (item) {

            return (
              item.nome ===
                produtoSelecionado.nome &&
              item.observacao ===
                observacao &&
              item.chaveAdicionais ===
                chaveAdicionais
            );

          }
        );

      if (produtoExistente) {

        produtoExistente.quantidade++;

      } else {

        carrinho.push({

          nome:
            produtoSelecionado.nome,

          preco:
            produtoSelecionado.preco +
            precoAdicionais,

          precoBase:
            produtoSelecionado.preco,

          quantidade: 1,

          observacao:
            observacao,

          adicionais:
            adicionaisSelecionados,

          chaveAdicionais:
            chaveAdicionais

        });

      }

      modalObservacao.classList.remove(
        "aberto"
      );

      produtoSelecionado = null;

      atualizarCarrinho();

      mostrarAviso(
        "Produto adicionado ao carrinho!"
      );

    }
  );


// ================================================================
// FECHAR JANELA DE OBSERVAÇÃO
// ================================================================

document
  .getElementById("fecharObservacao")
  .addEventListener(
    "click",
    function () {

      modalObservacao.classList.remove(
        "aberto"
      );

      produtoSelecionado = null;

    }
  );


// ================================================================
// BOTÕES DO CARRINHO
// ================================================================

document
  .getElementById("abrirCarrinho")
  .addEventListener(
    "click",
    abrirCarrinho
  );

document
  .getElementById("carrinhoFlutuante")
  .addEventListener(
    "click",
    abrirCarrinho
  );

document
  .getElementById("fecharCarrinho")
  .addEventListener(
    "click",
    fecharCarrinho
  );

document
  .getElementById("continuarPedindo")
  .addEventListener(
    "click",
    fecharCarrinho
  );

fundoModal.addEventListener(
  "click",
  fecharCarrinho
);


// ================================================================
// ATUALIZAR CARRINHO
// ================================================================

function atualizarCarrinho() {

  const quantidadeTotal =
    carrinho.reduce(
      function (soma, item) {

        return (
          soma +
          item.quantidade
        );

      },
      0
    );

  const total =
    carrinho.reduce(
      function (soma, item) {

        return (
          soma +
          item.preco *
          item.quantidade
        );

      },
      0
    );

  contadorCarrinho.textContent =
    quantidadeTotal;

  contadorFlutuante.textContent =
    quantidadeTotal;

  valorTotal.textContent =
    dinheiro(total);

  if (carrinho.length === 0) {

    listaCarrinho.innerHTML = `
      <div class="carrinho-vazio">

        <span>
          🛒
        </span>

        <strong>
          Seu carrinho está vazio
        </strong>

        <p>
          Adicione algum produto do cardápio.
        </p>

      </div>
    `;

    return;
  }

  listaCarrinho.innerHTML =
    carrinho
      .map(
        function (item, indice) {

          const adicionaisCarrinho =
            item.adicionais.length > 0
              ? `
                <p class="item-adicionais">

                  Adicionais:

                  ${item.adicionais
                    .map(
                      function (
                        adicional
                      ) {

                        if (
                          adicional.preco > 0
                        ) {

                          return (
                            `${adicional.nome} ` +
                            `(+ ${dinheiro(adicional.preco)})`
                          );

                        }

                        return adicional.nome;

                      }
                    )
                    .join(", ")}

                </p>
              `
              : "";

          const observacaoCarrinho =
            item.observacao
              ? `
                <p class="item-observacao">

                  Obs.: ${item.observacao}

                </p>
              `
              : "";

          return `
            <div class="item-carrinho">

              <div class="item-linha">

                <strong>
                  ${item.nome}
                </strong>

                <div class="quantidade">

                  <button
                    type="button"
                    data-menos="${indice}"
                    aria-label="Diminuir quantidade"
                  >
                    −
                  </button>

                  <span>
                    ${item.quantidade}
                  </span>

                  <button
                    type="button"
                    data-mais="${indice}"
                    aria-label="Aumentar quantidade"
                  >
                    +
                  </button>

                </div>

                <button
                  class="remover"
                  type="button"
                  data-remover="${indice}"
                >
                  Excluir
                </button>

              </div>

              ${adicionaisCarrinho}

              ${observacaoCarrinho}

              <p class="item-observacao">

                ${dinheiro(
                  item.preco *
                  item.quantidade
                )}

              </p>

            </div>
          `;

        }
      )
      .join("");

}


// ================================================================
// AUMENTAR, DIMINUIR OU EXCLUIR PRODUTO
// ================================================================

listaCarrinho.addEventListener(
  "click",
  function (evento) {

    const mais =
      evento.target.dataset.mais;

    const menos =
      evento.target.dataset.menos;

    const remover =
      evento.target.dataset.remover;

    if (mais !== undefined) {

      carrinho[
        Number(mais)
      ].quantidade++;

    }

    if (menos !== undefined) {

      const indice =
        Number(menos);

      carrinho[indice].quantidade--;

      if (
        carrinho[indice].quantidade <= 0
      ) {

        carrinho.splice(
          indice,
          1
        );

      }

    }

    if (remover !== undefined) {

      carrinho.splice(
        Number(remover),
        1
      );

    }

    atualizarCarrinho();

  }
);


// ================================================================
// ENTREGA OU RETIRADA
// ================================================================

document
  .querySelectorAll(
    'input[name="recebimento"]'
  )
  .forEach(
    function (input) {

      input.addEventListener(
        "change",
        function () {

          const campoEndereco =
            document.getElementById(
              "campoEndereco"
            );

          if (
            input.value === "Retirada" &&
            input.checked
          ) {

            campoEndereco.hidden = true;

          }

          if (
            input.value === "Entrega" &&
            input.checked
          ) {

            campoEndereco.hidden = false;

          }

        }
      );

    }
  );


// ================================================================
// MOSTRAR CAMPO DE TROCO
// ================================================================

pagamento.addEventListener(
  "change",
  function () {

    if (
      pagamento.value === "Dinheiro"
    ) {

      campoTroco.hidden = false;

    } else {

      campoTroco.hidden = true;

      document.getElementById(
        "troco"
      ).value = "";

    }

  }
);


// ================================================================
// FINALIZAR PEDIDO
// ================================================================

document
  .getElementById("formPedido")
  .addEventListener(
    "submit",
    function (evento) {

      evento.preventDefault();

      if (carrinho.length === 0) {

        mostrarAviso(
          "Adicione algum produto ao carrinho."
        );

        return;
      }

      const nome =
        document
          .getElementById("nomeCliente")
          .value
          .trim();

      const recebimento =
        document.querySelector(
          'input[name="recebimento"]:checked'
        ).value;

      const endereco =
        document
          .getElementById("endereco")
          .value
          .trim();

      const formaPagamento =
        pagamento.value;

      const troco =
        document
          .getElementById("troco")
          .value
          .trim();

      const observacaoGeral =
        document
          .getElementById(
            "observacaoGeral"
          )
          .value
          .trim();

      if (nome === "") {

        mostrarAviso(
          "Informe seu nome."
        );

        return;
      }

      if (
        recebimento === "Entrega" &&
        endereco === "" &&
        localizacaoCliente === ""
      ) {

        mostrarAviso(
          "Informe o endereço ou compartilhe sua localização atual."
        );

        return;
      }

      if (formaPagamento === "") {

        mostrarAviso(
          "Selecione a forma de pagamento."
        );

        return;
      }

      const itens =
        carrinho
          .map(
            function (item) {

              const observacao =
                item.observacao
                  ? `\n   Obs.: ${item.observacao}`
                  : "";

              const adicionais =
                item.adicionais.length > 0
                  ? `\n   Adicionais: ${
                      item.adicionais
                        .map(
                          function (
                            adicional
                          ) {

                            if (
                              adicional.preco > 0
                            ) {

                              return (
                                `${adicional.nome} ` +
                                `(+ ${dinheiro(adicional.preco)})`
                              );

                            }

                            return adicional.nome;

                          }
                        )
                        .join(", ")
                    }`
                  : "";

              return (
                `${item.quantidade}x ` +
                `${item.nome} — ` +
                `${dinheiro(
                  item.preco *
                  item.quantidade
                )}` +
                adicionais +
                observacao
              );

            }
          )
          .join("\n");

      const total =
        carrinho.reduce(
          function (soma, item) {

            return (
              soma +
              item.preco *
              item.quantidade
            );

          },
          0
        );

      const mensagem = [

        "Olá, Santa Chapa Lanches! Gostaria de fazer um pedido:",

        "",

        itens,

        "",

        `*Total: ${dinheiro(total)}*`,

        "",

        `Nome: ${nome}`,

        `Recebimento: ${recebimento}`,

        recebimento === "Entrega"
          ? `Endereço: ${
              endereco ||
              "Localização compartilhada"
            }`
          : "Retirada no local",

        recebimento === "Entrega" &&
        localizacaoCliente
          ? `Localização no Google Maps: ${localizacaoCliente}`
          : "",

        `Pagamento: ${formaPagamento}`,

        formaPagamento === "Dinheiro"
          ? `Troco para: ${
              troco || "Não precisa"
            }`
          : "",

        observacaoGeral
          ? `Observação geral: ${observacaoGeral}`
          : ""

      ]
        .filter(Boolean)
        .join("\n");

      const link =
        `https://wa.me/${numeroWhatsApp}?text=${
          encodeURIComponent(mensagem)
        }`;

      window.open(
        link,
        "_blank"
      );

    }
  );


// ================================================================
// ANO AUTOMÁTICO DO RODAPÉ
// ================================================================

document.getElementById(
  "anoAtual"
).textContent =
  new Date().getFullYear();


// ================================================================
// INICIAR CARRINHO
// ================================================================

atualizarCarrinho();