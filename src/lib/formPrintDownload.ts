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

  const styles = Array.from(
    document.querySelectorAll("style, link[rel='stylesheet']")
  )
    .map((s) => s.outerHTML)
    .join("\n");

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
  ${styles}
  <style>
    body {
      background-color: #f8fafc;
      padding: 24px;
      font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      color: #0f172a;
    }
    .no-print, button {
      display: none !important;
    }
    .printable-container {
      max-width: 960px;
      margin: 0 auto;
      background: #ffffff;
      padding: 32px;
      border-radius: 16px;
      border: 1px solid #e2e8f0;
    }
    @media print {
      body {
        background: #ffffff !important;
        padding: 0 !important;
      }
      .printable-container {
        border: none !important;
        padding: 0 !important;
        max-width: 100% !important;
      }
    }
  </style>
</head>
<body>
  <div class="printable-container">
    ${el.outerHTML}
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
