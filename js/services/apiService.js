const ApiService = {
  /**
   * Realiza una petición GET
   * @param {string} url - URL del endpoint
   * @param {object} headers - Cabeceras opcionales
   */
  get: async (url, headers = {}) => {
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...headers
        }
      });
      if (!response.ok) throw new Error(`Error en GET ${url}: ${response.statusText}`);
      return await response.json();
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  /**
   * Realiza una petición POST
   * @param {string} url - URL del endpoint
   * @param {object} body - Datos a enviar en el cuerpo de la petición
   * @param {object} headers - Cabeceras opcionales
   */
  post: async (url, body, headers = {}) => {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...headers
        },
        body: JSON.stringify(body)
      });
      if (!response.ok) throw new Error(`Error en POST ${url}: ${response.statusText}`);
      return await response.json();
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  /**
   * Realiza una petición PUT
   * @param {string} url - URL del endpoint
   * @param {object} body - Datos a enviar en el cuerpo de la petición
   * @param {object} headers - Cabeceras opcionales
   */
  put: async (url, body, headers = {}) => {
    try {
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...headers
        },
        body: JSON.stringify(body)
      });
      if (!response.ok) throw new Error(`Error en PUT ${url}: ${response.statusText}`);
      return await response.json();
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  /**
   * Realiza una petición DELETE
   * @param {string} url - URL del endpoint
   * @param {object} headers - Cabeceras opcionales
   */
  delete: async (url, headers = {}) => {
    try {
      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...headers
        }
      });
      if (!response.ok) throw new Error(`Error en DELETE ${url}: ${response.statusText}`);
      return await response.json();
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
};

window.ApiService = ApiService;
