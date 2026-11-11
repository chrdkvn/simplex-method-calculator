(() => {
	const storageKey = "simplex-theme";

	const getSavedTheme = () => {
		try {
			return localStorage.getItem(storageKey);
		} catch (error) {
			return null;
		}
	};

	const applyTheme = (isDark) => {
		if (document.body) {
			document.body.classList.toggle("dark", isDark);
		}

		try {
			localStorage.setItem(storageKey, isDark ? "dark" : "light");
		} catch (error) {
			// Theme changes still work when storage is unavailable.
		}
	};

	const initialize = () => {
		const savedTheme = getSavedTheme();
		const supportsColorPreference = typeof window.matchMedia === "function";
		const prefersDark = supportsColorPreference &&
			window.matchMedia("(prefers-color-scheme: dark)").matches;
		const shouldUseDarkTheme = savedTheme === "dark" || (!savedTheme && prefersDark);

		applyTheme(shouldUseDarkTheme);

		const toggleButton = document.getElementById("themeToggle");
		if (!toggleButton) {
			return;
		}

		toggleButton.addEventListener("click", () => {
			const isDark = document.body && document.body.classList.contains("dark");
			applyTheme(!isDark);
		});
	};

	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", initialize, { once: true });
	} else {
		initialize();
	}
})();