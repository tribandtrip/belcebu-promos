const CONFIG = {
  // Sustituir por la URL /exec del Apps Script desplegado como Web App
  endpoint: "PASTE_APPS_SCRIPT_WEB_APP_URL_HERE",
  locals: {
    belcebu: "Belcebú",
    pecat: "El Pecat de Belcebú"
  }
};

const qs = new URLSearchParams(window.location.search);
const localParam = (qs.get("local") || "belcebu").toLowerCase();
const localKey = CONFIG.locals[localParam] ? localParam : "belcebu";

const form = document.getElementById("entryForm");
const result = document.getElementById("result");
const submitBtn = document.getElementById("submitBtn");
const localInput = document.getElementById("local");
const localName = document.getElementById("localName");

localInput.value = localKey;
localName.textContent = CONFIG.locals[localKey];

function setResult(message, type) {
  result.textContent = message;
  result.className = `result ${type || ""}`.trim();
}

function clean(value) {
  return String(value || "").trim();
}

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  setResult("", "");

  const payload = {
    local: clean(localInput.value),
    name: clean(document.getElementById("name").value),
    phone: clean(document.getElementById("phone").value),
    email: clean(document.getElementById("email").value).toLowerCase(),
    ticket: clean(document.getElementById("ticket").value).toUpperCase(),
    acceptRules: document.getElementById("acceptRules").checked,
    acceptPrivacy: document.getElementById("acceptPrivacy").checked,
    acceptMarketing: document.getElementById("acceptMarketing").checked,
    website: clean(document.getElementById("website").value)
  };

  if (!payload.name || !payload.phone || !payload.email || !payload.ticket) {
    setResult("Revisa los campos obligatorios antes de participar.", "error");
    return;
  }
  if (!validateEmail(payload.email)) {
    setResult("Introduce un email válido.", "error");
    return;
  }
  if (!payload.acceptRules || !payload.acceptPrivacy) {
    setResult("Para participar debes aceptar las bases legales y la política de privacidad.", "error");
    return;
  }
  if (CONFIG.endpoint.includes("PASTE_APPS_SCRIPT")) {
    setResult("Falta configurar la URL del Apps Script en js/app.js.", "error");
    return;
  }

  submitBtn.disabled = true;
  submitBtn.textContent = "Enviando...";

  try {
    const response = await fetch(CONFIG.endpoint, {
      method: "POST",
      mode: "cors",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (data.ok) {
      setResult(data.message || "Participación registrada correctamente. ¡Suerte!", "ok");
      form.reset();
      localInput.value = localKey;
    } else {
      setResult(data.message || "No se ha podido registrar la participación.", "error");
    }
  } catch (error) {
    setResult("Ha ocurrido un error al enviar. Prueba de nuevo o avisa al personal del local.", "error");
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "Enviar participación";
  }
});
