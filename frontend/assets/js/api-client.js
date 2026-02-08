// API Client for Portfolio Frontend
// Communicates with backend API

const API_BASE_URL = "/api";

class PortfolioApiClient {
  async getProjects() {
    try {
      const response = await fetch(`${API_BASE_URL}/projects?published=true`);
      if (!response.ok) throw new Error("Failed to fetch projects");
      const data = await response.json();
      return data.data?.data || [];
    } catch (error) {
      console.error("Error fetching projects:", error);
      return [];
    }
  }

  async getContent(type) {
    try {
      const response = await fetch(`${API_BASE_URL}/content/${type}`);
      if (!response.ok) throw new Error(`Failed to fetch ${type} content`);
      const data = await response.json();
      return data.data || null;
    } catch (error) {
      console.error(`Error fetching ${type} content:`, error);
      return null;
    }
  }

  async submitMessage(name, email, message) {
    try {
      const response = await fetch(`${API_BASE_URL}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, message }),
      });
      if (!response.ok) throw new Error("Failed to submit message");
      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error("Error submitting message:", error);
      return { success: false, error: error.message };
    }
  }

  async logEvent(eventName, attributes = {}) {
    try {
      // Non-blocking telemetry - don't wait for response
      fetch(`${API_BASE_URL}/telemetry/events`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          eventName,
          attributes,
          sessionId: this.getSessionId(),
        }),
      }).catch(() => {
        // Silently fail - telemetry is not critical
      });
    } catch (error) {
      // Silently ignore errors
    }
  }

  getSessionId() {
    let sessionId = sessionStorage.getItem("portfolio_session_id");
    if (!sessionId) {
      sessionId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem("portfolio_session_id", sessionId);
    }
    return sessionId;
  }
}

// Create global instance
const portfolioApi = new PortfolioApiClient();
