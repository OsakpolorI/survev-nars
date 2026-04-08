import { api } from "./api";
import { proxy } from "./proxy";

let lastReportTime = 0;
const reportCooldownMs = 60_000;

/**
 * Weak signal only: client-side zoom can be forged. Logs when zoom was altered between frames.
 */
export function reportFovTamper(args: {
    drift: number;
    committed: number;
    actual: number;
    streak: number;
}) {
    if (!import.meta.env.PROD) {
        return;
    }
    const now = Date.now();
    if (now - lastReportTime < reportCooldownMs) {
        return;
    }
    lastReportTime = now;
    fetch(api.resolveUrl("/api/report_fov_flag"), {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-Requested-With": "XMLHttpRequest",
        },
        credentials: proxy.anyLoginSupported() ? "include" : "same-origin",
        body: JSON.stringify(args),
    }).catch(() => {});
}
