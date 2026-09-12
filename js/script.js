(function () {
  "use strict";

  // ---------------------------------------------------------------------
  // Contact form is wired to Formspree (https://formspree.io) — works on
  // any host, no server code required.
  //   1. Sign up at formspree.io and create a form pointed at
  //      hello@fieldnotepress.studio (Formspree will email that address
  //      a confirmation link the first time — click it once).
  //   2. Copy the form's endpoint (looks like
  //      https://formspree.io/f/abcd1234) and paste it as the `action`
  //      attribute on the <form id="contact-form"> tag in contact.html,
  //      replacing YOUR_FORM_ID.
  //   3. That's it — no redeploy, no environment variables.
  // ---------------------------------------------------------------------

  /* Reveal elements as they enter the viewport. */
  var revealEls = Array.prototype.slice.call(document.querySelectorAll(".reveal"));
  if (revealEls.length) {
    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(
        function (entries) {
          for (var i = 0; i < entries.length; i++) {
            if (entries[i].isIntersecting) {
              entries[i].target.classList.add("is-visible");
              io.unobserve(entries[i].target);
            }
          }
        },
        { threshold: 0.15, rootMargin: "0px 0px -5% 0px" }
      );
      for (var i = 0; i < revealEls.length; i++) io.observe(revealEls[i]);
    } else {
      for (var i = 0; i < revealEls.length; i++) revealEls[i].classList.add("is-visible");
    }
  }

  /* Contact form: inline validation + a friendly confirmation state. */
  var form = document.getElementById("contact-form");
  if (!form) return;

  var status = document.getElementById("form-status");

  var fields = [
    { id: "name", message: "Let us know your name." },
    { id: "email", message: "Enter an email so we can reply.", isEmail: true },
    { id: "project-type", message: "Choose the kind of project." },
    { id: "message", message: "Tell us a little about the project." }
  ];

  function setError(fieldId, message) {
    var input = document.getElementById(fieldId);
    var errorEl = document.getElementById(fieldId + "-error");
    var wrap = input.closest(".field");
    if (message) {
      wrap.classList.add("has-error");
      errorEl.textContent = message;
      input.setAttribute("aria-invalid", "true");
    } else {
      wrap.classList.remove("has-error");
      errorEl.textContent = "";
      input.removeAttribute("aria-invalid");
    }
  }

  function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  var submitBtn = form.querySelector("button[type=submit]");
  var submitNote = document.getElementById("submit-note");

  function setNote(message, isPending) {
    if (!submitNote) return;
    submitNote.textContent = message || "";
    submitNote.classList.toggle("is-pending", !!isPending);
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    var firstInvalid = null;

    fields.forEach(function (field) {
      var input = document.getElementById(field.id);
      var value = input.value.trim();
      var invalid = value.length === 0 || (field.isEmail && !isValidEmail(value));
      setError(field.id, invalid ? field.message : "");
      if (invalid && !firstInvalid) firstInvalid = input;
    });

    if (firstInvalid) {
      firstInvalid.focus();
      return;
    }

    // Bots that run JS but still fill the hidden field: pretend success,
    // don't waste a real submission.
    var gotcha = form.querySelector("[name='_gotcha']");
    if (gotcha && gotcha.value.trim()) {
      form.reset();
      form.classList.add("is-hidden");
      if (status) status.classList.add("is-visible");
      return;
    }

    submitBtn.disabled = true;
    setNote("Sending…", true);

    fetch(form.action, {
      method: "POST",
      body: new FormData(form),
      headers: { Accept: "application/json" }
    })
      .then(function (response) {
        return response.json().catch(function () { return {}; }).then(function (data) {
          return { ok: response.ok, data: data };
        });
      })
      .then(function (result) {
        if (!result.ok) {
          var message = "Couldn't send the message. Please try again.";
          if (result.data && Array.isArray(result.data.errors) && result.data.errors.length) {
            message = result.data.errors.map(function (e) { return e.message; }).join(", ");
          } else if (result.data && result.data.error) {
            message = result.data.error;
          }
          setNote(message, false);
          submitBtn.disabled = false;
          return;
        }

        setNote("", false);
        form.classList.add("is-hidden");
        if (status) {
          status.classList.add("is-visible");
          status.setAttribute("tabindex", "-1");
          status.focus();
        }
      })
      .catch(function () {
        setNote("Couldn't reach the server. Check your connection and try again.", false);
        submitBtn.disabled = false;
      });
  });

  fields.forEach(function (field) {
    var input = document.getElementById(field.id);
    input.addEventListener("input", function () {
      if (input.closest(".field").classList.contains("has-error")) {
        var value = input.value.trim();
        var invalid = value.length === 0 || (field.isEmail && !isValidEmail(value));
        if (!invalid) setError(field.id, "");
      }
    });
  });
})();
