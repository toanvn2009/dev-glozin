function setupFormValidation({
  formSelector,
  fields,
  buttonSelector = 'button[type="submit"]',
}) {
  const forms = document.querySelectorAll(formSelector);
  if (!forms.length) return;
  forms.forEach((form) => {
    form.addEventListener("submit", (e) => {
      const submitButton = e.submitter || form.querySelector(buttonSelector);
      const spinner = submitButton?.querySelector(".icon-load");
      const text = submitButton?.querySelector(
        ".hidden-on-load.transition-short"
      );

      submitButton?.classList.add("loading");
      spinner?.classList.remove("opacity-0", "pointer-none");
      text?.classList.add("opacity-0");
    });
  });
}
setupFormValidation({
  formSelector: "form.form-validation",
});
