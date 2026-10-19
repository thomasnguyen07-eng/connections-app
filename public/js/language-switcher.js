// language-switcher.js - Updated Version with Report Refresh
document.addEventListener("DOMContentLoaded", function () {
  const TRANSLATABLE_ELEMENTS = {
    appTitle: "header h1",
    newReportTab: '[data-tab="new-report"]',
    savedReportsTab: '[data-tab="saved-reports"]',
    reportTypeLabel: 'label[for="report-type"]',
    titleLabel: 'label[for="report-title"]',
    descriptionLabel: 'label[for="report-description"]',
    locationLabel: 'label[for="location-text-input"]',
    contactLabel: 'label[for="reporter-contact"]',
    imageLabel: 'label[for="report-image"]',
    submitButton: '#report-form button[type="submit"]',
    useLocationButton: 'button[onclick*="useCurrentLocation"]',
    showOnMapButton: 'button[onclick*="findAddress"]',
    "buttons.clearAll": "#clear-all",
    "buttons.backToDashboard": ".back-btn",
    noReports: ".no-reports",
    loading: ".loading-reports",
    "buttons.reshare": ".reshare-btn",
    "buttons.delete": ".delete-btn",
    // ✅ ADD THIS LINE
    "buttons.subscribe": "#subscribeBtn span",
  };

  window.currentTranslations = {};

  function translate(key) {
    // Add this fallback check
    if (!window.currentTranslations) return key;

    const keys = key.split(".");
    let result = window.currentTranslations;
    for (const k of keys) {
      result = result?.[k];
      if (!result) break;
    }
    return result || key;
  }

  async function loadLanguage(lang) {
    try {
      const response = await fetch(`./lang/${lang}.json`);
      if (!response.ok) throw new Error("Language file not found");

      // Core language system updates
      window.currentLanguage = lang; // CRITICAL ADDITION
      window.currentTranslations = await response.json();
      localStorage.setItem("appLanguage", lang);
      document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";

      // ▼▼▼ REPLACE this block ▼▼▼
      applyTranslations();

      // 👇 ADD THIS LINE 👇
      if (typeof loadCompactWarning === "function") {
        loadCompactWarning(); // Reload the compact warning with new language
      }
      // 👆 ADD THIS LINE 👆

      // ▲▲▲ Add your function call RIGHT AFTER applyTranslations ▲▲▲
      if (typeof updateDashboardIntro === "function") {
        updateDashboardIntro();
      }

      // Force language update on all elements
      document.querySelectorAll("[data-lang]").forEach((el) => {
        el.setAttribute("data-lang", lang);
      });
      translateButtons(); // Now handles both existing and new elements

      // ▼▼▼ Add this right after translations load ▼▼▼
      if (typeof renderSavedReports === "function") renderSavedReports();
    } catch (error) {
      if (lang !== "en") await loadLanguage("en"); // Fallback to English
    }
  }

  function applyTranslations() {
    Object.entries(TRANSLATABLE_ELEMENTS).forEach(([key, selector]) => {
      const elements = document.querySelectorAll(selector);
      if (elements.length) {
        const value = translate(key);
        elements.forEach((el) => (el.textContent = value));
      }
    });

    // Remove the duplicate dropdown translation code here
    // Keep only the DEBUG log if needed
    console.log("Loaded translations:", {
      reshare: window.currentTranslations?.buttons?.reshare,
      delete: window.currentTranslations?.buttons?.delete,
    });
    // ▼ Add this line ▼ (translates dropdown after all other elements)
    translateDropdown();
    // Add this at the end
  }

  function initLanguageSwitcher() {
    // Use the same storage key as your main app
    const savedLang = localStorage.getItem("appLanguage") || "en";
    const switcher = document.getElementById("language-switcher");

    if (switcher) {
      switcher.value = savedLang;
      switcher.addEventListener("change", (e) => {
        const selectedLang = e.target.value;
        // Use main app's storage key
        localStorage.setItem("appLanguage", selectedLang);
        loadLanguage(selectedLang);
      });
    }

    loadLanguage(savedLang);
  }

  function updateAllButtonTexts() {
    const lang = (window.currentLanguage || "en").substring(0, 2);

    // Update Clear All button
    const clearAllText = TRANSLATION_PATCH.clearAllBtn?.[lang] || "Clear all";
    document.querySelector(".clear-all-text").textContent = clearAllText;

    // Update existing report buttons
    document.querySelectorAll(".reshare-btn").forEach((btn) => {
      btn.innerHTML = `<i class="fas fa-share-alt"></i> ${
        TRANSLATION_PATCH.reshareBtn[lang] || "Reshare"
      }`;
    });

    document.querySelectorAll(".delete-btn").forEach((btn) => {
      btn.innerHTML = `<i class="fas fa-trash"></i> ${
        TRANSLATION_PATCH.deleteBtn[lang] || "Delete"
      }`;
    });
  }

  // Call this after every language change
  initLanguageSwitcher();
  window.translate = translate;
});
