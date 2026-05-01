document.addEventListener('DOMContentLoaded', () => {
  const API_URL = "https://YOUR_GOOGLE_APPS_SCRIPT_URL/exec";

  const form = document.querySelector('#participation-form');
  const messageContainer = document.querySelector('#form-message');
  const localDisplayElements = document.querySelectorAll('.local-name');
  const submitBtn = form.querySelector('button[type="submit"]');

  const urlParams = new URLSearchParams(window.location.search);
  const rawLocal = (urlParams.get('local') || 'belcebu').toLowerCase();

  const local = rawLocal === 'pecat' ? 'pecat' : 'belcebu';
  const displayName = local === 'pecat' ? 'EL PECAT' : 'BELCEBÚ';

  localDisplayElements.forEach(el => {
    el.textContent = displayName;
  });

  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    hideMessage();

    const formData = new FormData(form);

    const payload = {
      local,
      nombre: String(formData.get('nombre') || '').trim(),
      telefono: String(formData.get('telefono') || '').trim(),
      email: String(formData.get('email') || '').trim(),
      ticket: String(formData.get('ticket') || '').trim(),
      aceptaPrivacidad: formData.get('aceptaPrivacidad') === 'on',
      aceptaBases: formData.get('aceptaBases') === 'on',
      aceptaPromociones: formData.get('aceptaPromociones') === 'on',
      origen: window.location.href,
      userAgent: navigator.userAgent,
      timestampCliente: new Date().toISOString()
    };

    if (!payload.nombre || !payload.telefono || !payload.email || !payload.ticket) {
      showMessage('Completa todos los campos obligatorios.', 'error');
      return;
    }

    if (!isValidEmail(payload.email)) {
      showMessage('Introduce un correo electrónico válido.', 'error');
      return;
    }

    if (!payload.aceptaPrivacidad || !payload.aceptaBases) {
      showMessage('Debes aceptar la política de privacidad y las bases legales para participar.', 'error');
      return;
    }

    if (API_URL.includes('YOUR_GOOGLE_APPS_SCRIPT_URL')) {
      showMessage('Falta configurar la URL de Google Apps Script.', 'error');
      return;
    }

    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Enviando...';

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8'
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (!result.ok) {
        showMessage(result.message || 'No se ha podido registrar la participación.', 'error');
        return;
      }

      showMessage(result.message || '¡Participación registrada con éxito! Mucha suerte.', 'success');
      form.reset();

    } catch (error) {
      console.error(error);
      showMessage('Error de conexión. Inténtalo de nuevo en unos minutos.', 'error');

    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
    }
  });

  function showMessage(text, type) {
    messageContainer.textContent = text;
    messageContainer.className = `message ${type}`;
    messageContainer.style.display = 'block';
    messageContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  function hideMessage() {
    messageContainer.textContent = '';
    messageContainer.className = 'message';
    messageContainer.style.display = 'none';
  }
});