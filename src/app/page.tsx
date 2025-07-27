"use client";
import { useState } from "react";
import {
  CircularProgressbar,
  buildStyles,
} from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { SunMedium } from 'lucide-react';
import { Moon } from 'lucide-react';

export default function Home() {
  const [url, setUrl] = useState("");
  const [report, setReport] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");

  const isDark = theme === "dark";

  // Basic URL validation function
  const isValidUrl = (input: string) => {
    try {
      const urlObj = new URL(input.trim());
      return urlObj.protocol === "http:" || urlObj.protocol === "https:";
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setError(null);
    setReport(null);

    const trimmedUrl = url.trim();

    // Validate URL client side before submitting
    if (!isValidUrl(trimmedUrl)) {
      setError("Please enter a valid URL starting with http:// or https://");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: trimmedUrl }),
      });
      if (!res.ok) {
        throw new Error(`Server responded with status ${res.status}`);
      }
      const data = await res.json();
      setReport(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const styles = {
    page: {
      fontFamily: "system-ui, sans-serif",
      backgroundColor: isDark ? "#1e1e1e" : "#f4f4f4",
      color: isDark ? "#eaeaea" : "#1e1e1e",
      minHeight: "100vh",
      padding: 20,
      transition: "all 0.3s ease",
    },
    container: {
      maxWidth: 600,
      margin: "auto",
      backgroundColor: isDark ? "#2a2a2a" : "#fff",
      padding: 30,
      borderRadius: 10,
      boxShadow: isDark
        ? "0 0 10px rgba(255,255,255,0.05)"
        : "0 0 15px rgba(0,0,0,0.1)",
    },
    input: {
      width: "100%",
      padding: 10,
      fontSize: 16,
      borderRadius: 6,
      border: error ? "1.5px solid #e74c3c" : "1px solid #ccc",
      marginBottom: 10,
      outline: "none",
      transition: "border-color 0.3s ease",
      backgroundColor: isDark ? "#1c1c1c" : "#fff",
      color: isDark ? "#eaeaea" : "#1e1e1e",
    },
    button: {
      padding: "10px 20px",
      fontSize: 16,
      borderRadius: 6,
      backgroundColor: isDark ? "#4a90e2" : "#0070f3",
      color: "#fff",
      border: "none",
      cursor: "pointer",
      minWidth: 150,
    },
    toggle: {
      marginBottom: 20,
      textAlign: "right" as const,
    },
    reportBox: {
      marginTop: 20,
      padding: 15,
      borderRadius: 6,
      backgroundColor: isDark ? "#333" : "#f9f9f9",
      whiteSpace: "pre-wrap" as const,
      fontSize: 14,
      color: isDark ? "#eaeaea" : "#333",
    },
    chartGrid: {
      display: "flex",
      justifyContent: "space-around",
      flexWrap: "wrap" as const,
      gap: 20,
      marginTop: 20,
    },
    chartItem: {
      width: 100,
      textAlign: "center" as const,
    },
    httpsStatus: {
      marginTop: 20,
      fontSize: 16,
      textAlign: "center" as const,
    },
    errorText: {
      color: "#e74c3c",
      marginBottom: 10,
      textAlign: "center" as const,
      fontWeight: "bold",
    },
  };

  const renderMetric = (
    emoji: string,
    label: string,
    value: number,
    color: string
  ) => (
    <div style={styles.chartItem}>
      <CircularProgressbar
        value={value}
        text={`${value}%`}
        styles={buildStyles({
          textColor: isDark ? "#eaeaea" : "#333",
          pathColor: color,
          trailColor: isDark ? "#555" : "#ddd",
        })}
      />
      <div style={{ marginTop: 8, textAlign: "center" }}>
        <div style={{ fontSize: 24 }}>{emoji}</div>
        <div>{label}</div>
      </div>
    </div>
  );

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.toggle}>
          <button
            onClick={() => setTheme(isDark ? "light" : "dark")}
            style={{
              ...styles.button,
              backgroundColor: isDark ? "#777" : "#222",
              fontSize: 14,
              padding: "6px 12px",
              minWidth: "auto",
            }}
            aria-label="Toggle dark mode"
          >
            {isDark ? <SunMedium /> : <Moon />}
          </button>
        </div>

        <h1 style={{ textAlign: "center", marginBottom: 20 }}>
          🌐 Website Reviewer
        </h1>

        <form onSubmit={handleSubmit}>
          <input
            type="url"
            placeholder="Enter website URL (http:// or https://)"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            required
            maxLength={2048}
            style={styles.input}
            aria-invalid={!!error}
            aria-describedby="url-error"
          />
          {error && (
            <div id="url-error" style={styles.errorText} role="alert">
              {error}
            </div>
          )}

          <div className="flex justify-center">
            <button
              type="submit"
              disabled={loading}
              style={styles.button}
              className="w-300"
              aria-busy={loading}
            >
              {loading ? "Reviewing..." : "Review Website"}
            </button>
          </div>
        </form>

        {report && !error && (
          <div style={styles.reportBox}>
            <h3 style={{ textAlign: "center" }}>📊 Audit Summary</h3>
            <div style={styles.chartGrid}>
              {renderMetric("🌐", "Performance", report.performance, "#f39c12")}
              {renderMetric("♿", "Accessibility", report.accessibility, "#2ecc71")}
              {renderMetric("🔍", "SEO", report.seo, "#3498db")}
            </div>
            <div style={styles.httpsStatus}>
              🔒 HTTPS Used:{" "}
              {report.httpsUsed ? (
                <span style={{ color: "green" }}>Yes</span>
              ) : (
                <span style={{ color: "red" }}>No</span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
