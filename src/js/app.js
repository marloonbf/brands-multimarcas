(function () {
    // Número REAL da loja (sem +, espaços ou traços)
    var WHATS_NUMBER = "5521984634094"; // +55 21 98463-4094
  
    var grids = {
      lancamentos: document.querySelector('[data-type="lancamentos"]'),
      catalogo: document.querySelector('[data-type="catalogo"]')
    };
  
    var anoSpan = document.getElementById("ano");
    if (anoSpan) {
      anoSpan.textContent = new Date().getFullYear();
    }
  
    // ------- Estado de "Carregando..." -------
    function setLoading(container, isLoading) {
      if (!container) return;
      if (isLoading) {
        container.innerHTML = "<p class='products-empty'>Carregando produtos...</p>";
      } else if (container.innerHTML.indexOf("Carregando produtos...") !== -1) {
        container.innerHTML = "";
      }
    }
  
    // ------- Navegação suave para âncoras -------
    var anchorLinks = document.querySelectorAll('a[href^="#"]');
    for (var i = 0; i < anchorLinks.length; i++) {
      anchorLinks[i].addEventListener("click", function (e) {
        var id = this.getAttribute("href").substring(1);
        var el = document.getElementById(id);
        if (el) {
          e.preventDefault();
          el.scrollIntoView({ behavior: "smooth" });
        }
      });
    }
  
    var goLanc = document.querySelector(".js-go-lancamentos");
    if (goLanc) {
      goLanc.addEventListener("click", function () {
        var sec = document.getElementById("lancamentos");
        if (sec) sec.scrollIntoView({ behavior: "smooth" });
      });
    }
  
    var goContato = document.querySelector(".js-go-contato");
    if (goContato) {
      goContato.addEventListener("click", function () {
        var sec = document.getElementById("contato");
        if (sec) sec.scrollIntoView({ behavior: "smooth" });
      });
    }
  
    // ------- Dados de produtos -------
    var products = [];
  
    function fetchProducts() {
      setLoading(grids.catalogo, true);
      setLoading(grids.lancamentos, true);
  
      var xhr = new XMLHttpRequest();
      xhr.open("GET", "data/products.json", true);
      xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
          setLoading(grids.catalogo, false);
          setLoading(grids.lancamentos, false);
  
          if (xhr.status === 200) {
            try {
              products = JSON.parse(xhr.responseText);
              renderAll();
            } catch (e) {
              console.error("Erro ao ler JSON de produtos", e);
            }
          } else {
            console.error("Erro ao carregar products.json, status:", xhr.status);
          }
        }
      };
      xhr.send();
    }
  
    function renderAll(categoryFilter) {
      if (!categoryFilter) categoryFilter = "todos";
  
      // catálogo completo (com filtro de categoria)
      renderGrid(
        grids.catalogo,
        products,
        categoryFilter === "todos" ? null : categoryFilter
      );
  
      // lançamentos
      var lancamentos = [];
      for (var i = 0; i < products.length; i++) {
        if (products[i].isNew) lancamentos.push(products[i]);
      }
      renderGrid(grids.lancamentos, lancamentos, null);
    }
  
    function createWhatsLink(product) {
      // tenta montar URL da imagem se for arquivo local
      var imageFile = product.image ? product.image.split("/").pop() : null;
      var imageUrl = imageFile ? window.location.origin + "/img/" + imageFile : "";
  
      var text = "";
      text += "Olá, vim do site da Brands Multimarcas e gostei do produto:\n";
      text += "*" + product.name + "* - R$ " + product.price.toFixed(2) + "\n";
  
      if (product.sizes && product.sizes.length) {
        text += "Tamanhos: " + product.sizes.join(" / ") + "\n";
      }
  
      if (imageUrl) {
        text += "Imagem: " + imageUrl + "\n\n";
      } else {
        text += "\n";
      }
  
      text += "Pode me passar mais detalhes de tamanho e disponibilidade?";
  
      return "https://wa.me/" + WHATS_NUMBER + "?text=" + encodeURIComponent(text);
    }
  
    function renderGrid(container, list, filterCategory) {
      if (!container) return;
  
      var filtered = [];
      if (filterCategory) {
        for (var i = 0; i < list.length; i++) {
          if (list[i].category === filterCategory) {
            filtered.push(list[i]);
          }
        }
      } else {
        filtered = list.slice();
      }
  
      container.innerHTML = "";
  
      if (!filtered.length) {
        container.innerHTML =
          "<p class='products-empty'>Nenhum produto nessa categoria ainda.</p>";
        return;
      }
  
      for (var j = 0; j < filtered.length; j++) {
        var p = filtered[j];
  
        var card = document.createElement("article");
        card.className = "product-card";
  
        if (p.isNew) {
          var badge = document.createElement("span");
          badge.className = "product-card__badge";
          badge.textContent = "LANÇAMENTO";
          card.appendChild(badge);
        }
  
        var imgWrapper = document.createElement("div");
        imgWrapper.className = "product-card__image";
  
        var img = document.createElement("img");
        img.src = p.image;
        img.alt = p.name;
        imgWrapper.appendChild(img);
        card.appendChild(imgWrapper);
  
        var info = document.createElement("div");
        info.className = "product-card__info";
  
        var name = document.createElement("div");
        name.className = "product-card__name";
        name.textContent = p.name;
  
        var price = document.createElement("div");
        price.className = "product-card__price";
        price.textContent = "R$ " + p.price.toFixed(2);
  
        var details = document.createElement("div");
        details.className = "product-card__details";
        var sizes =
          p.sizes && p.sizes.length
            ? p.sizes.join(" • ")
            : "Tamanhos sob consulta";
        details.textContent = "Tamanhos: " + sizes;
  
        info.appendChild(name);
        info.appendChild(price);
        info.appendChild(details);
  
        card.appendChild(info);
  
        var btn = document.createElement("a");
        btn.className = "btn btn--whatsapp";
        btn.href = createWhatsLink(p);
        btn.target = "_blank";
        btn.rel = "noopener";
        btn.textContent = "Comprar pelo WhatsApp";
  
        card.appendChild(btn);
  
        container.appendChild(card);
      }
    }
  
    // aplica filtro de categoria e rola até catálogo
    function applyCategoryFilter(category) {
      var cat = category || "todos";
  
      var chips = document.querySelectorAll(".chip.js-filter");
      for (var i = 0; i < chips.length; i++) {
        chips[i].classList.remove("is-active");
      }
  
      var selector;
      if (cat === "todos") {
        selector = '.chip.js-filter[data-category="todos"]';
      } else {
        selector = '.chip.js-filter[data-category="' + cat + '"]';
      }
  
      var activeChip = document.querySelector(selector);
      if (activeChip) activeChip.classList.add("is-active");
  
      renderAll(cat);
  
      var catalogo = document.getElementById("catalogo");
      if (catalogo) catalogo.scrollIntoView({ behavior: "smooth" });
    }
  
    // chips do catálogo
    var chipButtons = document.querySelectorAll(".chip.js-filter");
    for (var k = 0; k < chipButtons.length; k++) {
      chipButtons[k].addEventListener("click", function (e) {
        e.preventDefault();
        var category = this.getAttribute("data-category") || "todos";
        applyCategoryFilter(category);
      });
    }
  
    // links de menu Masculino/Feminino que filtram o catálogo
    var navFilters = document.querySelectorAll(".js-nav-filter");
    for (var n = 0; n < navFilters.length; n++) {
      navFilters[n].addEventListener("click", function (e) {
        e.preventDefault();
        var category = this.getAttribute("data-category") || "todos";
        applyCategoryFilter(category);
      });
    }
  
    fetchProducts();
  })();
  