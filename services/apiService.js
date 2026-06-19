const ApiService = {
  baseUrl: 'https://fakestoreapi.com',
  async get(endpoint) {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`);
      if (!response.ok) {
        throw new Error(`Error en la petición: ${response.status} ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Error en ApiService al llamar a ${endpoint}:`, error);
      throw error;
    }
  },
  async post(endpoint, data) {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      if (!response.ok) {
        throw new Error(`Error en la petición POST: ${response.status} ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Error en ApiService (POST) al llamar a ${endpoint}:`, error);
      throw error;
    }
  }
};
window.ApiService = ApiService;
