const ProductService = {
  mapProduct(item) {
    const tasaCambioCop = 4000;
    const precioConvertido = Math.round(item.price * tasaCambioCop);

    return {
      id: item.id,
      nombre: item.title,
      title: item.title,
      precio: precioConvertido,
      price: precioConvertido,
      imagen: item.image,
      image: item.image,
      descripcion: item.description,
      description: item.description,
      categoria: item.category,
      category: item.category,
      valoracion: item.rating ? item.rating.rate : 0,
      rating: item.rating ? item.rating.rate : 0
    };
  },
  async getProducts() {
    try {
      const data = await window.ApiService.get('/products');
      return data.map(item => this.mapProduct(item));
    } catch (error) {
      console.warn("Fallo al obtener productos de la API, usando respaldo local...", error);
      const fallback = window.PRODUCTOS_RESPALDO || [];
      return fallback;
    }
  },
  async getFeaturedProducts(limit = 4) {
    try {
      const data = await window.ApiService.get(`/products?limit=${limit}`);
      return data.map(item => this.mapProduct(item));
    } catch (error) {
      console.warn(`Fallo al obtener productos destacados de la API, usando respaldo local...`, error);
      const fallback = window.PRODUCTOS_RESPALDO || [];
      return fallback.slice(0, limit);
    }
  },
  async getProductById(id) {
    try {
      const item = await window.ApiService.get(`/products/${id}`);
      return this.mapProduct(item);
    } catch (error) {
      console.warn(`Fallo al obtener producto con id ${id} de la API, buscando en respaldo...`, error);
      const fallback = window.PRODUCTOS_RESPALDO || [];
      const product = fallback.find(p => p.id === parseInt(id));
      if (!product) throw new Error("Producto no encontrado");
      return product;
    }
  },
  async getCategories() {
    try {
      return await window.ApiService.get('/products/categories');
    } catch (error) {
      console.warn("Fallo al obtener categorías de la API, usando respaldo...", error);
      const fallback = window.PRODUCTOS_RESPALDO || [];
      return [...new Set(fallback.map(p => p.categoria))];
    }
  },

  async searchAndFilter({ query = "", category = "", sortBy = "" } = {}) {
    try {
      let products = [];
      if (category) {
        const data = await window.ApiService.get(`/products/category/${encodeURIComponent(category)}`);
        products = data.map(item => this.mapProduct(item));
      } else {
        products = await this.getProducts();
      }
      if (query.trim()) {
        const q = query.toLowerCase().trim();
        products = products.filter(p => 
          p.nombre.toLowerCase().includes(q) || 
          p.descripcion.toLowerCase().includes(q)
        );
      }
      if (sortBy) {
        switch (sortBy) {
          case "price-asc":
            products.sort((a, b) => a.precio - b.precio);
            break;
          case "price-desc":
            products.sort((a, b) => b.precio - a.precio);
            break;
          case "rating":
            products.sort((a, b) => b.valoracion - a.valoracion);
            break;
          case "name-asc":
            products.sort((a, b) => a.nombre.localeCompare(b.nombre));
            break;
          default:
            break;
        }
      }

      return products;
    } catch (error) {
      console.error("Error en searchAndFilter:", error);
      return [];
    }
  }
};
window.ProductService = ProductService;
