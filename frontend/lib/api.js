const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

function isNetworkError(err) {
  const message = String(err && err.message ? err.message : err || '');
  return (
    err instanceof TypeError ||
    /failed to fetch|networkerror|load failed|econnrefused|backend is unavailable/i.test(message)
  );
}

async function readJsonResponse(res) {
  const text = await res.text();
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch (err) {
    return null;
  }
}

function friendlyFetchError(err, fallback) {
  if (isNetworkError(err)) {
    return 'Backend server is unreachable. Please make sure the backend is running on http://localhost:5000.';
  }
  return err.message || fallback;
}

export async function checkBackendHealth() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/health`, {
      method: 'GET',
      headers: { Accept: 'application/json' }
    });
    if (!res.ok) return { online: false, message: `HTTP ${res.status}` };
    const data = await readJsonResponse(res);
    if (!data || data.success !== true) {
      return { online: false, message: 'Backend is unavailable.' };
    }
    return { online: true, data };
  } catch (err) {
    return { online: false, message: 'Backend is unavailable.' };
  }
}

export async function analyzeProjectZip(file) {
  try {
    const formData = new FormData();
    formData.append('project', file);

    const res = await fetch(`${API_BASE_URL}/api/projects/analyze`, {
      method: 'POST',
      body: formData
    });

    const data = await readJsonResponse(res);
    if (!data) {
      throw new Error(res.ok ? 'Unable to analyze this ZIP file.' : 'Backend is unavailable.');
    }
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Unable to analyze this ZIP file.');
    }

    return data;
  } catch (err) {
    throw new Error(friendlyFetchError(err, 'Unable to analyze this ZIP file.'));
  }
}

export async function sendProjectChatMessage(question, projectContext, previousMessages = []) {
  try {
    const res = await fetch(`${API_BASE_URL}/api/projects/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        question,
        projectContext,
        previousMessages
      })
    });

    const data = await readJsonResponse(res);
    if (!data) {
      throw new Error('Backend is unavailable.');
    }
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Failed to get answer from AI Project Mentor.');
    }

    return data;
  } catch (err) {
    throw new Error(friendlyFetchError(err, 'Failed to get answer from AI Project Mentor.'));
  }
}
