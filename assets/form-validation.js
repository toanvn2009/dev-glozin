function debounce(fn, wait) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn.apply(this, args), wait);
  };
}
function validateRequiredInputs(container = document) {
  const requiredInputs = container.querySelectorAll(`
    input[required][type="text"],
    input[required][type="email"], 
    input[required][type="password"],
    input[required][type="tel"],
    textarea[required],
    select[required]
  `);

  let isValid = true;
  const inputGroups = {
    text: [],
    email: [],
    tel: [],
    password: [],
    textarea: [],
    select: [],
  };

  requiredInputs.forEach((input) => {
    const type =
      input.tagName.toLowerCase() === "textarea"
        ? "textarea"
        : input.tagName.toLowerCase() === "select"
        ? "select"
        : input.type;
    if (inputGroups[type]) {
      inputGroups[type].push(input);
    }
  });

  Object.keys(inputGroups).forEach((type) => {
    inputGroups[type].forEach((input) => {
      const inputIsValid = validateInputByType(input, type);
      if (!inputIsValid) {
        isValid = false;
      }
    });
  });

  return isValid;
}

function validateInputByType(input, type) {
  let isValid = true;

  if (input.value.trim()) {
    switch (type) {
      case "email":
        if (!isValidEmail(input.value)) {
          isValid = false;
        }
        break;
      case "tel":
        if (!isValidPhone(input.value)) {
          isValid = false;
        }
        break;
      case "text":
      case "textarea":
        if (input.value.trim().length < 2) {
          isValid = false;
        }
        break;
      case "select":
        if (!input.value || input.value === "" || input.value === "0") {
          isValid = false;
        }
        break;
    }
  } else if (input.hasAttribute("required")) {
    isValid = false;
  }

  if (isValid) {
    removeErrorMessage(input);
  } else {
    showErrorMessage(input);
  }

  return isValid;
}

function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function isValidPhone(phone) {
  const phoneRegex = /^[0-9\-]*$/;
  if (!phoneRegex.test(phone)) {
    return false;
  }
  const digitCount = phone.replace(/\-/g, "").length;
  return digitCount >= 8;
}

function showErrorMessage(input) {
  if (!input.classList.contains("error-input")) {
    input.classList.add("error-input");
  }
}

function removeErrorMessage(input) {
  input.classList.remove("error-input");
}

function validateFormOnSubmit(submitButton) {
  const form = submitButton.closest("form");
  if (!form) return true;

  const requiredInputs = form.querySelectorAll(`
    input[required][type="text"],
    input[required][type="email"], 
    input[required][type="password"],
    input[required][type="tel"],
    textarea[required],
    select[required]
  `);

  let isValid = true;

  requiredInputs.forEach((input) => {
    const type =
      input.tagName.toLowerCase() === "textarea"
        ? "textarea"
        : input.tagName.toLowerCase() === "select"
        ? "select"
        : input.type;
    const inputIsValid = validateInputByType(input, type);

    if (!inputIsValid) {
      isValid = false;
    }
  });

  return isValid;
}

function initFormValidation() {
  let isValidating = false;

  document.addEventListener(
    "input",
    debounce(function (e) {
      const input = e.target;
      const supportedTypes = ["text", "email", "password", "tel"];
      const isTextarea = input.tagName.toLowerCase() === "textarea";
      const isSelect = input.tagName.toLowerCase() === "select";

      if (
        input.hasAttribute("required") &&
        (supportedTypes.includes(input.type) || isTextarea || isSelect) &&
        !input.classList.contains("no-js-validation")
      ) {
        isValidating = true;
        const type = isTextarea ? "textarea" : isSelect ? "select" : input.type;
        validateInputByType(input, type);
        isValidating = false;
      }
    }, 300),
    true
  );

  document.addEventListener(
    "focus",
    function (e) {
      const input = e.target;
      const supportedTypes = ["text", "email", "password", "tel"];
      const isTextarea = input.tagName.toLowerCase() === "textarea";
      const isSelect = input.tagName.toLowerCase() === "select";
      if (
        input.hasAttribute("required") &&
        (supportedTypes.includes(input.type) || isTextarea || isSelect) &&
        input.classList.contains("error-input") &&
        !input.classList.contains("no-js-validation")
      ) {
        const type = isTextarea ? "textarea" : isSelect ? "select" : input.type;
        let shouldRemoveError = false;

        if (input.value.trim()) {
          switch (type) {
            case "email":
              shouldRemoveError = isValidEmail(input.value);
              break;
            case "tel":
              shouldRemoveError = isValidPhone(input.value);
              break;
            case "text":
            case "textarea":
              shouldRemoveError = input.value.trim().length >= 2;
              break;
            case "select":
              shouldRemoveError =
                input.value && input.value !== "" && input.value !== "0";
              break;
          }
        }

        if (shouldRemoveError) {
          removeErrorMessage(input);
        }
      }
    },
    true
  );

  document.addEventListener(
    "blur",
    function (e) {
      const input = e.target;
      const supportedTypes = ["text", "email", "password", "tel"];
      const isTextarea = input.tagName.toLowerCase() === "textarea";
      const isSelect = input.tagName.toLowerCase() === "select";

      if (
        input.hasAttribute("required") &&
        (supportedTypes.includes(input.type) || isTextarea || isSelect) &&
        !input.classList.contains("no-js-validation")
      ) {
        const type = isTextarea ? "textarea" : isSelect ? "select" : input.type;
        validateInputByType(input, type);
      }
    },
    true
  );

  document.addEventListener(
    "click",
    function (e) {
      const button = e.target;

      if (
        button.type === "submit" ||
        button.getAttribute("type") === "submit" ||
        (button.tagName.toLowerCase() === "button" &&
          button.closest("form") &&
          !button.type) ||
        (button.tagName.toLowerCase() === "input" && button.type === "submit")
      ) {
        isValidating = true;
        const isFormValid = validateFormOnSubmit(button);
        isValidating = false;

        if (!isFormValid) {
          e.preventDefault();
          e.stopPropagation();

          const form = button.closest("form");
          if (form) {
            const firstErrorInput = form.querySelector(".error-input");
            if (firstErrorInput) {
              firstErrorInput.focus();

              setTimeout(() => {
                firstErrorInput.classList.add("error-input");
                firstErrorInput.reportValidity();
              }, 10);
            }
          }
          return false;
        }
      }
    },
    true
  );
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initFormValidation);
} else {
  initFormValidation();
}
