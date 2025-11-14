(function () {
    const productsListEl = document.getElementById("admin-products-list");
    const loginForm = document.getElementById("login-form");
    const productForm = document.getElementById("product-form");
    const loginStatus = document.getElementById("login-status");
    const productStatus = document.getElementById("product-status");
  
    let authHeader = null;
  
    function renderProducts(products) {
      productsListEl.innerHTML = "";
  
      if (!products.length) {
        productsListEl.innerHTML = "<p>Nenhum produto cadastrado ainda.</p>";
        return;
      }
  
      products.forEach((p) => {
        const card = document.createElement("article");
        card.className = "product-card";
  
        const img = document.createElement("img");
        img.src = p.image;
        img.alt = p.name;
        card.appendChild(img);
  
        const name = document.createElement("div");
        name.className = "product-card__name";
        name.textContent = p.name;
        card.appendChild(name);
  
        const price = document.createElement("div");
        price.className = "product-card__price";
        price.textContent = `R$ ${p.price.toFixed(2)}`;
        card.appendChild(price);
  
        const details = document.createElement("div");
        details.innerHTML =
          `${p.category} • ${p.gender} <br> Tamanhos: ${
            p.sizes?.join(" / ") || "S/C"
          }`;
        details.style.fontSize = "13px";
        details.style.color = "#bbb";
        card.appendChild(details);
  
        const del = document.createElement("button");
        del.className = "btn btn--outline";
        del.textContent = "Excluir";
        del.style.marginTop = "8px";
        del.onclick = () => deleteProduct(p.id);
  
        card.appendChild(del);
        productsListEl.appendChild(card);
      });
    }
  
    function loadProducts() {
      fetch("/api/products")
        .then((r) => r.json())
        .then(renderProducts);
    }
  
    // -------- LOGIN ----------
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const user = document.getElementById("admin-user").value;
      const pass = document.getElementById("admin-pass").value;
  
      authHeader = "Basic " + btoa(`${user}:${pass}`);
  
      fetch("/api/admin/ping", {
        headers: { Authorization: authHeader },
      })
        .then((res) => {
          if (res.status === 200) {
            loginStatus.textContent = "✔ Login OK";
            loginStatus.style.color = "limegreen";
          } else {
            loginStatus.textContent = "❌ Usuário ou senha incorretos";
            loginStatus.style.color = "red";
            authHeader = null;
          }
        })
        .catch(() => {
          loginStatus.textContent = "Erro ao conectar";
          loginStatus.style.color = "orange";
        });
    });
  
    // -------- UPLOAD IMAGEM ----------
    async function uploadImageIfNeeded() {
      const fileInput = document.getElementById("p-image-file");
      const manualInput = document.getElementById("p-image");
  
      if (fileInput.files.length > 0) {
        const formData = new FormData();
        formData.append("image", fileInput.files[0]);
  
        const res = await fetch("/api/upload", {
          method: "POST",
          headers: { Authorization: authHeader },
          body: formData,
        });
  
        const data = await res.json();
        return data.path;
      }
  
      return manualInput.value || "";
    }
  
    // -------- CADASTRAR ----------
    productForm.addEventListener("submit", async (e) => {
      e.preventDefault();
  
      if (!authHeader) {
        productStatus.textContent = "Faça login primeiro";
        productStatus.style.color = "red";
        return;
      }
  
      const name = document.getElementById("p-name").value;
      const price = parseFloat(document.getElementById("p-price").value);
      const gender = document.getElementById("p-gender").value;
      const category = document.getElementById("p-category").value;
      const sizes = document
        .getElementById("p-sizes")
        .value.split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      const isNew = document.getElementById("p-isNew").checked;
  
      try {
        productStatus.textContent = "Salvando...";
        productStatus.style.color = "#ccc";
  
        const image = await uploadImageIfNeeded();
  
        const res = await fetch("/api/products", {
          method: "POST",
          headers: {
            Authorization: authHeader,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name,
            price,
            gender,
            category,
            sizes,
            isNew,
            image,
          }),
        });
  
        if (res.status === 201) {
          productStatus.textContent = "✔ Produto salvo";
          productStatus.style.color = "limegreen";
          productForm.reset();
          document.getElementById("p-isNew").checked = true;
          loadProducts();
        } else {
          productStatus.textContent = "Erro ao cadastrar";
          productStatus.style.color = "red";
        }
      } catch (err) {
        productStatus.textContent = "Erro ao enviar";
        productStatus.style.color = "red";
        console.error(err);
      }
    });
  
    // -------- DELETE ----------
    function deleteProduct(id) {
      if (!authHeader) {
        alert("Faça login primeiro");
        return;
      }
  
      if (!confirm("Excluir este produto?")) return;
  
      fetch(`/api/products/${id}`, {
        method: "DELETE",
        headers: { Authorization: authHeader },
      }).then(() => loadProducts());
    }
  
    loadProducts();
  })();
  