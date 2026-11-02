"use client";

import React from "react";
import Image from "next/image";
import { FiX } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/src/components/ui/button";
import { PaymentTransaction } from "@/features/assessment-centre/types";
import { ASSETS_URL } from "@/assets";

interface TransactionReceiptModalProps {
  isOpen: boolean;
  transaction: PaymentTransaction | null;
  onClose: () => void;
}

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function buildSinglePageJpegPdf(
  jpegBytes: Uint8Array,
  pixelWidth: number,
  pixelHeight: number,
  pageWidthPt: number,
  pageHeightPt: number,
): Uint8Array {
  const encoder = new TextEncoder();
  const chunks: Uint8Array[] = [];
  const offsets: number[] = [];
  let currentOffset = 0;

  const pushStr = (str: string) => {
    const bytes = encoder.encode(str);
    chunks.push(bytes);
    currentOffset += bytes.length;
  };

  const pushBytes = (bytes: Uint8Array) => {
    chunks.push(bytes);
    currentOffset += bytes.length;
  };

  pushStr("%PDF-1.4\n%\xFF\xFF\xFF\xFF\n");

  // 1 0 obj: Catalog
  offsets[1] = currentOffset;
  pushStr("1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n");

  // 2 0 obj: Pages
  offsets[2] = currentOffset;
  pushStr("2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n");

  // 3 0 obj: Page
  offsets[3] = currentOffset;
  pushStr(
    `3 0 obj\n<< /Type /Page /Parent 2 0 R /Resources << /XObject << /Im0 4 0 R >> >> /MediaBox [0 0 ${pageWidthPt} ${pageHeightPt}] /Contents 5 0 R >>\nendobj\n`,
  );

  // 4 0 obj: Image XObject
  offsets[4] = currentOffset;
  pushStr(
    `4 0 obj\n<< /Type /XObject /Subtype /Image /Width ${pixelWidth} /Height ${pixelHeight} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpegBytes.length} >>\nstream\n`,
  );
  pushBytes(jpegBytes);
  pushStr("\nendstream\nendobj\n");

  // 5 0 obj: Page content stream
  const contentStream = `q\n${pageWidthPt} 0 0 ${pageHeightPt} 0 0 cm\n/Im0 Do\nQ\n`;
  const contentBytes = encoder.encode(contentStream);
  offsets[5] = currentOffset;
  pushStr(`5 0 obj\n<< /Length ${contentBytes.length} >>\nstream\n`);
  pushBytes(contentBytes);
  pushStr("\nendstream\nendobj\n");

  // xref
  const xrefOffset = currentOffset;
  pushStr("xref\n0 6\n0000000000 65535 f \n");
  for (let i = 1; i <= 5; i++) {
    const padded = String(offsets[i]).padStart(10, "0");
    pushStr(`${padded} 00000 n \n`);
  }

  pushStr(
    `trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`,
  );

  const totalLength = chunks.reduce((acc, c) => acc + c.length, 0);
  const result = new Uint8Array(totalLength);
  let pos = 0;
  for (const chunk of chunks) {
    result.set(chunk, pos);
    pos += chunk.length;
  }
  return result;
}

export const TransactionReceiptModal: React.FC<
  TransactionReceiptModalProps
> = ({ isOpen, transaction, onClose }) => {
  if (!isOpen || !transaction) return null;

  const handleDownloadOrPrint = async () => {
    const scale = 2;
    const width = 480;
    const height = 580;

    const canvas = document.createElement("canvas");
    canvas.width = width * scale;
    canvas.height = height * scale;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.scale(scale, scale);

    // Outer background
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, width, height);

    const padX = 32;
    const boxW = width - padX * 2;
    let curY = 32;

    // 1. Header Banner
    const headerH = 116;
    drawRoundedRect(ctx, padX, curY, boxW, headerH, 16);
    ctx.fillStyle = "#FEF2F3";
    ctx.fill();
    ctx.lineWidth = 1;
    ctx.strokeStyle = "#FCE3E6";
    ctx.stroke();

    // Try drawing the logo image
    try {
      const logoSrc =
        typeof ASSETS_URL.logoIcon2 === "string"
          ? ASSETS_URL.logoIcon2
          : (ASSETS_URL.logoIcon2 as any)?.src || "";
      if (logoSrc) {
        const img = new window.Image();
        img.crossOrigin = "anonymous";
        await new Promise<void>((resolve) => {
          img.onload = () => resolve();
          img.onerror = () => resolve();
          img.src = logoSrc;
        });
        if (img.complete && img.naturalWidth > 0) {
          const logoW = 104;
          const logoH = (img.naturalHeight / img.naturalWidth) * logoW;
          ctx.drawImage(
            img,
            width / 2 - logoW / 2,
            curY + 20,
            logoW,
            Math.min(logoH, 34),
          );
        }
      }
    } catch {
      // Fallback if logo fails to load
    }

    ctx.fillStyle = "#8A1538";
    ctx.font =
      '800 22px system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.textAlign = "center";
    ctx.fillText("Transaction Receipt", width / 2, curY + 88);

    curY += headerH + 18;

    // 2. Details Grid Box
    const gridH = 118;
    drawRoundedRect(ctx, padX, curY, boxW, gridH, 16);
    ctx.fillStyle = "#F8F9FA";
    ctx.fill();
    ctx.strokeStyle = "#F1F3F5";
    ctx.stroke();

    ctx.textAlign = "left";
    const col1X = padX + 16;
    const col2X = padX + boxW / 2 + 8;
    const maxColW = boxW / 2 - 24;

    const truncateText = (text: string, maxW: number) => {
      if (ctx.measureText(text).width <= maxW) return text;
      let t = text;
      while (t.length > 0 && ctx.measureText(t + "...").width > maxW) {
        t = t.slice(0, -1);
      }
      return t + "...";
    };

    // Row 1: Date & Transaction ID
    ctx.fillStyle = "#4B5563";
    ctx.font = '500 11px system-ui, -apple-system, sans-serif';
    ctx.fillText("Date", col1X, curY + 28);
    ctx.fillText("Transaction ID", col2X, curY + 28);

    ctx.fillStyle = "#111827";
    ctx.font = '700 13px system-ui, -apple-system, sans-serif';
    ctx.fillText(String(transaction.date || "—"), col1X, curY + 47);
    ctx.fillText(
      truncateText(String(transaction.transactionId || "—"), maxColW),
      col2X,
      curY + 47,
    );

    // Row 2: Payment Method & Status
    ctx.fillStyle = "#4B5563";
    ctx.font = '500 11px system-ui, -apple-system, sans-serif';
    ctx.fillText("Payment Method", col1X, curY + 78);
    ctx.fillText("Status", col2X, curY + 78);

    ctx.fillStyle = "#111827";
    ctx.font = '600 13px system-ui, -apple-system, sans-serif';
    ctx.fillText(String(transaction.paymentMethod || "—"), col1X, curY + 97);
    ctx.font = '700 13px system-ui, -apple-system, sans-serif';
    ctx.fillText(
      transaction.status === "Paid" ? "Completed" : "Pending",
      col2X,
      curY + 97,
    );

    curY += gridH + 18;

    // 3. Assessment Item Box
    const itemH = 74;
    drawRoundedRect(ctx, padX, curY, boxW, itemH, 16);
    ctx.fillStyle = "#F8F9FA";
    ctx.fill();
    ctx.strokeStyle = "#F1F3F5";
    ctx.stroke();

    ctx.textAlign = "left";
    ctx.fillStyle = "#111827";
    ctx.font = '700 13px system-ui, -apple-system, sans-serif';
    ctx.fillText(
      `${transaction.assessmentType || "RPL"} Assessment`,
      col1X,
      curY + 31,
    );

    ctx.fillStyle = "#4B5563";
    ctx.font = '500 11px system-ui, -apple-system, sans-serif';
    ctx.fillText(
      truncateText(String(transaction.description || ""), boxW - 130),
      col1X,
      curY + 50,
    );

    ctx.textAlign = "right";
    ctx.fillStyle = "#1F2937";
    ctx.font = '800 15px system-ui, -apple-system, sans-serif';
    ctx.fillText(
      String(transaction.amountPaid || ""),
      padX + boxW - 16,
      curY + 42,
    );

    curY += itemH + 26;

    // 4. Summary Rows (Name, Vat, TOTAL)
    const leftEdge = padX + 4;
    const rightEdge = padX + boxW - 4;

    ctx.textAlign = "left";
    ctx.fillStyle = "#333333";
    ctx.font = '400 14px system-ui, -apple-system, sans-serif';
    ctx.fillText("Name", leftEdge, curY);
    ctx.textAlign = "right";
    ctx.font = '500 14px system-ui, -apple-system, sans-serif';
    ctx.fillText(String(transaction.candidateName || "—"), rightEdge, curY);

    curY += 30;
    ctx.textAlign = "left";
    ctx.font = '400 14px system-ui, -apple-system, sans-serif';
    ctx.fillText("Vat", leftEdge, curY);
    ctx.textAlign = "right";
    ctx.font = '500 14px system-ui, -apple-system, sans-serif';
    ctx.fillText("-", rightEdge, curY);

    curY += 20;
    ctx.beginPath();
    ctx.moveTo(leftEdge, curY);
    ctx.lineTo(rightEdge, curY);
    ctx.strokeStyle = "#E5E7EB";
    ctx.lineWidth = 1;
    ctx.stroke();

    curY += 32;
    ctx.textAlign = "left";
    ctx.fillStyle = "#333333";
    ctx.font = '700 20px system-ui, -apple-system, sans-serif';
    ctx.fillText("TOTAL", leftEdge, curY);
    ctx.textAlign = "right";
    ctx.font = '700 20px system-ui, -apple-system, sans-serif';
    ctx.fillText(String(transaction.amountPaid || ""), rightEdge, curY);

    // Export canvas to JPEG and wrap in a single-page PDF downloaded to device
    const dataUrl = canvas.toDataURL("image/jpeg", 0.95);
    const base64 = dataUrl.split(",")[1] || "";
    const binaryStr = window.atob(base64);
    const jpegBytes = new Uint8Array(binaryStr.length);
    for (let i = 0; i < binaryStr.length; i++) {
      jpegBytes[i] = binaryStr.charCodeAt(i);
    }

    const pdfBytes = buildSinglePageJpegPdf(
      jpegBytes,
      canvas.width,
      canvas.height,
      width,
      height,
    );

    const safeTxId = String(transaction.transactionId || "receipt")
      .replace(/[^a-zA-Z0-9_-]/g, "_")
      .slice(0, 40);
    const fileName = `Transaction_Receipt_${safeTxId}.pdf`;

    const blob = new Blob([pdfBytes as unknown as BlobPart], {
      type: "application/pdf",
    });
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

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-2 transition-opacity duration-300 select-none overflow-y-auto"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl relative flex flex-col items-center my-8 max-h-[90vh] overflow-y-auto scrollbar-thin"
        >
          <button
            type="button"
            onClick={onClose}
            className="absolute top-6 right-6 w-11 h-11 rounded-lg bg-primary/10 text-primary hover:bg-red-100 flex items-center justify-center transition-colors cursor-pointer focus:outline-none"
            aria-label="Close modal"
          >
            <FiX className="w-6 h-6" />
          </button>

          <div
            id="transaction-receipt-content"
            className="w-full flex flex-col items-center gap-4 mt-4 lg:mt-14"
          >
            <div className="bg-red-50/60 p-6 rounded-2xl w-full flex flex-col items-center justify-center gap-3 text-center border border-red-100/60">
              <div className="relative w-28 h-8">
                <Image
                  src={ASSETS_URL.logoIcon2}
                  alt="Elimi Logo"
                  fill
                  className="object-cover"
                />
              </div>
              <h3 className="text-xl lg:text-2xl font-extrabold text-primary tracking-tight">
                Transaction Reciept
              </h3>
            </div>

            <div className="bg-[#F8F9FA] p-2.5 rounded-2xl w-full grid grid-cols-2 gap-3 text-xs text-left border border-gray-100">
              <div className="flex flex-col">
                <span className="text-[10px] text-black">Date</span>
                <span className="font-bold text-neutral-primary mt-0.5">
                  {transaction.date}
                </span>
              </div>

              <div className="flex flex-col">
                <span className="text-[10px] text-black">Transaction ID</span>
                <span className="font-bold text-neutral-primary mt-0.5 truncate">
                  {transaction.transactionId}
                </span>
              </div>

              <div className="flex flex-col">
                <span className="text-[10px] text-black">Payment Method</span>
                <span className="font-medium text-black mt-0.5">
                  {transaction.paymentMethod}
                </span>
              </div>

              <div className="flex flex-col">
                <span className="text-[10px] text-black">Status</span>
                <span className="font-bold text-neutral-primary mt-0.5">
                  {transaction.status === "Paid" ? "Completed" : "Pending"}
                </span>
              </div>
            </div>

            <div className="bg-[#F8F9FA] p-4 rounded-2xl w-full flex items-center justify-between gap-4 text-xs border border-gray-100">
              <div className="flex flex-col text-left">
                <span className="font-bold text-neutral-primary">
                  {transaction.assessmentType} Assessment
                </span>
                <span className="text-[10px] text-black font-medium mt-0.5">
                  {transaction.description}
                </span>
              </div>
              <span className="font-extrabold text-[#333333] text-sm">
                {transaction.amountPaid}
              </span>
            </div>

            <div className="w-full flex flex-col gap-2.5 text-xs lg:text-sm text-left px-1">
              <div className="flex items-center justify-between text-[#333333]">
                <span>Name</span>
                <span className="font-medium">{transaction.candidateName}</span>
              </div>

              <div className="flex items-center justify-between text-[#333333]">
                <span>Vat</span>
                <span className="font-medium text-[#333333]">-</span>
              </div>

              <div className="pt-2 border-t border-gray-200 flex items-center justify-between">
                <span className="text-base lg:text-xl font-semibold text-[#333333]">
                  TOTAL
                </span>
                <span className="text-xl font-semibold text-[#333333]">
                  {transaction.amountPaid}
                </span>
              </div>
            </div>

            <Button
              type="button"
              onClick={handleDownloadOrPrint}
              variant="secondary"
              className="w-full!"
              size="lg"
            >
              Download
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
