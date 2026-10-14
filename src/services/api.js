const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'http://localhost:5000/api'
    : 'https://data-stracter-backend.onrender.com/api');

const getHeaders = (isMultipart = false) => {
  const token = localStorage.getItem('restaurant_token');
  const activeClientId = localStorage.getItem('active_client_id');
  const headers = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  if (activeClientId) {
    headers['x-client-id'] = activeClientId;
  }
  if (!isMultipart) {
    headers['Content-Type'] = 'application/json';
  }
  return headers;
};

export const api = {
  // Auth
  async login(emailOrUsername, password) {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ emailOrUsername, password }),
    });
    return await res.json();
  },

  async getMe() {
    const res = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: getHeaders(),
    });
    return await res.json();
  },

  // Bills
  async extractBill(formData) {
    const res = await fetch(`${API_BASE_URL}/bills/extract`, {
      method: 'POST',
      headers: getHeaders(true),
      body: formData,
    });
    return await res.json();
  },

  async confirmBill(billData) {
    const res = await fetch(`${API_BASE_URL}/bills/confirm`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(billData),
    });
    return await res.json();
  },

  async getBills(search = '', page = 1) {
    const res = await fetch(`${API_BASE_URL}/bills?search=${encodeURIComponent(search)}&page=${page}`, {
      headers: getHeaders(),
    });
    return await res.json();
  },

  // Customers
  async getCustomers({ search = '', filter = 'all', page = 1, sortBy = 'lastVisit', order = 'desc' } = {}) {
    const query = new URLSearchParams({ search, filter, page, sortBy, order }).toString();
    const res = await fetch(`${API_BASE_URL}/customers?${query}`, {
      headers: getHeaders(),
    });
    return await res.json();
  },

  async getCustomerDetails(customerId) {
    const res = await fetch(`${API_BASE_URL}/customers/${customerId}`, {
      headers: getHeaders(),
    });
    return await res.json();
  },

  async updateCustomer(customerId, data) {
    const res = await fetch(`${API_BASE_URL}/customers/${customerId}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return await res.json();
  },

  async getAnalytics() {
    const res = await fetch(`${API_BASE_URL}/customers/analytics/overview`, {
      headers: getHeaders(),
    });
    return await res.json();
  },

  // Marketing & Offers
  async getOfferTemplates() {
    const res = await fetch(`${API_BASE_URL}/marketing/templates`, {
      headers: getHeaders(),
    });
    return await res.json();
  },

  async sendOffer(payload) {
    const res = await fetch(`${API_BASE_URL}/marketing/send-offer`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });
    return await res.json();
  },

  // Super Admin Client Management
  async getClients() {
    const res = await fetch(`${API_BASE_URL}/admin/clients`, {
      headers: getHeaders(),
    });
    return await res.json();
  },

  async getPlatformOverview() {
    const res = await fetch(`${API_BASE_URL}/admin/clients/overview`, {
      headers: getHeaders(),
    });
    return await res.json();
  },

  async createClient(clientData) {
    const res = await fetch(`${API_BASE_URL}/admin/clients`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(clientData),
    });
    return await res.json();
  },

  async updateClient(clientId, clientData) {
    const res = await fetch(`${API_BASE_URL}/admin/clients/${clientId}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(clientData),
    });
    return await res.json();
  },

  async deleteClient(clientId) {
    const res = await fetch(`${API_BASE_URL}/admin/clients/${clientId}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return await res.json();
  },
};
