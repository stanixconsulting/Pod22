// Fieldnote Press — contact form handling
// This is a static site with no backend, so submitting the form validates
// the fields client-side and shows a confirmation message in place of
// sending any data. Wire this up to a real endpoint (fetch/POST, a form
// service, etc.) when the site has somewhere to send messages.

(function () {
  const form = document.getElementById('contact-form');
  if (!form) return; // not on this page

  const status = document.getElementById('form-status');

  const fields = [
    {
      id: 'name',
      validate: (value) => value.trim().length > 0,
      message: 'Enter your name.',
    },
    {
      id: 'email',
      validate: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()),
      message: 'Enter a valid email address.',
    },
    {
      id: 'project-type',
      validate: (value) => value.trim().length > 0,
      message: 'Choose a project type.',
    },
    {
      id: 'message',
      validate: (value) => value.trim().length > 0,
      message: 'Add a short message.',
    },
  ];

  function setError(fieldId, message) {
    const input = document.getElementById(fieldId);
    const errorEl = document.getElementById(fieldId + '-error');
    const wrapper = input.closest('.field');
    if (message) {
      wrapper.classList.add('has-error');
      errorEl.textContent = message;
      input.setAttribute('aria-invalid', 'true');
    } else {
      wrapper.classList.remove('has-error');
      errorEl.textContent = '';
      input.removeAttribute('aria-invalid');
    }
  }

  form.addEventListener('submit', function (event) {
    event.preventDefault();

    let firstInvalid = null;
    let allValid = true;

    fields.forEach(({ id, validate, message }) => {
      const input = document.getElementById(id);
      const isValid = validate(input.value);
      setError(id, isValid ? '' : message);
      if (!isValid) {
        allValid = false;
        if (!firstInvalid) firstInvalid = input;
      }
    });

    if (!allValid) {
      firstInvalid.focus();
      return;
    }

    // No backend is wired up: simulate a successful submission.
    form.classList.add('is-submitted');
    status.classList.add('is-visible');
    status.setAttribute('tabindex', '-1');
    status.focus();
  });
})();
