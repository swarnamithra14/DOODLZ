const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:5000';

export async function fetchHealthStatus() {
  const response = await fetch(`${SERVER_URL}/api/health`);
  if (!response.ok) {
    throw new Error(`Health check failed with status: ${response.status}`);
  }
  return response.json();
}
