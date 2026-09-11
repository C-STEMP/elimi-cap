/**
 * Helper utilities for application form printing and downloading.
 */

/**
 * Trigger download of a form element as a clean, styled standalone HTML document.
 */
export const downloadFormElement = (elementId: string, formName: string) => {
  if (typeof window === "undefined") return;

  const el = document.getElementById(elementId);
  if (!el) {
    console.warn(`Element with id "${elementId}" not found for download.`);
    return;
  }

  // Clone element to sanitize and convert relative URLs
  const clone = el.cloneNode(true) as HTMLElement;

  // Remove buttons and non-printable elements from clone
  clone.querySelectorAll("button, .no-print, [data-no-print='true']").forEach((node) => {
    node.remove();
  });

  // Convert all image sources to absolute URLs and remove relative srcsets
  clone.querySelectorAll("img").forEach((img) => {
    if (img.src) {
      img.setAttribute("src", img.src);
    }
    if (img.hasAttribute("srcset")) {
      img.removeAttribute("srcset");
    }
    // Prevent unstyled image expansion
    img.style.maxWidth = "100%";
    if (
      img.classList.contains("object-cover") ||
      img.alt?.toLowerCase().includes("passport") ||
      img.closest("[class*='border-dashed']")
    ) {
      img.style.width = "100%";
      img.style.height = "100%";
      img.style.objectFit = "cover";
    }
  });

  // Collect full CSS rules from loaded document stylesheets
  let inlinedCss = "";
  Array.from(document.styleSheets).forEach((sheet) => {
    try {
      const rules = Array.from(sheet.cssRules || []);
      rules.forEach((rule) => {
        inlinedCss += rule.cssText + "\n";
      });
    } catch {
      if (sheet.href) {
        inlinedCss += `@import url("${sheet.href}");\n`;
      }
    }
  });

  const safeFileName = formName.replace(/[\\/:*?"<>|]/g, "_").trim();
  const fileName = safeFileName.endsWith(".html")
    ? safeFileName
    : `${safeFileName}.html`;

  const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${formName}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    ${inlinedCss}
  </style>
  <style>
    *, ::before, ::after {
      box-sizing: border-box;
    }
    body {
      background-color: #f8fafc;
      padding: 32px 16px;
      font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      color: #0f172a;
      margin: 0;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .no-print, button {
      display: none !important;
    }
    .printable-container {
      max-width: 960px;
      margin: 0 auto;
      width: 100%;
    }
    img {
      max-width: 100%;
    }
    @media print {
      body {
        background: #ffffff !important;
        padding: 0 !important;
      }
      .printable-container {
        max-width: 100% !important;
      }
    }
  </style>
</head>
<body>
  <div class="printable-container">
    ${clone.outerHTML}
  </div>
</body>
</html>`;

  const blob = new Blob([htmlContent], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.setAttribute("download", fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1500);
};

/**
 * Prints the application form directly on the current page.
 * Uses print-media CSS to isolate the application card while omitting all headers, sidebars, and buttons.
 */
export const printFormElement = (elementId?: string, formTitle?: string) => {
  if (typeof window === "undefined") return;

  const originalTitle = document.title;
  if (formTitle) {
    document.title = formTitle;
  }

  // Ensure scroll is at top so print starts from the top of the card
  window.scrollTo(0, 0);

  // Trigger browser's native print
  window.print();

  // Restore title after print dialog closes
  setTimeout(() => {
    document.title = originalTitle;
  }, 1000);
};
