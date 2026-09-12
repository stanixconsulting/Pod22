(function () {
  "use strict";

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

    form.classList.add("is-hidden");
    if (status) {
      status.classList.add("is-visible");
      status.setAttribute("tabindex", "-1");
      status.focus();
    }
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
