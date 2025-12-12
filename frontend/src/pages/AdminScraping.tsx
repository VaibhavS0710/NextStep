import { type FormEvent, useEffect, useState } from "react";
import Layout from "../components/Layout";
import ProtectedRoute from "../components/ProtectedRoute";
import { api } from "../lib/api";
import { useAuth } from "../context/AuthContext";

type ProviderType = "html" | "api";

interface ScrapeSource {
  _id: string;
  name: string;
  baseUrl: string;
  listPath?: string;
  providerType: ProviderType;
  enabled: boolean;
  frequencyMinutes?: number;
  selectors?: Record<string, string>;
  apiConfig?: {
    endpoint?: string;
    apiKeyEnvVar?: string;
    extraParams?: Record<string, any>;
  };
  lastRunAt?: string;
  createdAt: string;
}

interface ScrapedPreviewItem {
  title: string;
  description: string;
  location: string;
  companyName?: string;
  applyUrl?: string;
}

const AdminScrapingPage = () => {
  const { user } = useAuth();

  // Only admins
  if (user?.role !== "admin") {
    return (
      <ProtectedRoute>
        <Layout>
          <h1>Not authorized</h1>
          <p style={{ fontSize: "0.9rem", color: "var(--ns-text-soft)" }}>
            This page is only available for admin accounts.
          </p>
        </Layout>
      </ProtectedRoute>
    );
  }

  const [sources, setSources] = useState<ScrapeSource[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Create form state
  const [name, setName] = useState("");
  const [baseUrl, setBaseUrl] = useState("");
  const [listPath, setListPath] = useState("");
  const [providerType, setProviderType] = useState<ProviderType>("html");
  const [enabled, setEnabled] = useState(true);
  const [frequencyMinutes, setFrequencyMinutes] = useState<number | undefined>(
    1440
  );

  // For HTML selectors we’ll accept key=value lines
  const [selectorsText, setSelectorsText] = useState(
    "item=.job-card\n" +
      "title=.job-title\n" +
      "location=.job-location\n" +
      "company=.company-name\n" +
      "link=a.apply-link"
  );

  // API config (for providerType=api)
  const [apiEndpoint, setApiEndpoint] = useState("");
  const [apiKeyEnvVar, setApiKeyEnvVar] = useState("");
  const [apiExtraParamsText, setApiExtraParamsText] = useState("{}");

  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [createSuccess, setCreateSuccess] = useState<string | null>(null);

  // Preview state
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewItems, setPreviewItems] = useState<ScrapedPreviewItem[]>([]);
  const [selectedSourceForPreview, setSelectedSourceForPreview] =
    useState<ScrapeSource | null>(null);
  const [previewError, setPreviewError] = useState<string | null>(null);

  // Run job state
  const [runningSourceId, setRunningSourceId] = useState<string | null>(null);
  const [runMessage, setRunMessage] = useState<string | null>(null);

  const fetchSources = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const res = await api.get("/admin/scraping/sources");
      setSources(res.data.sources || []);
    } catch (err: any) {
      setLoadError(
        err?.response?.data?.message || "Failed to fetch scraping sources."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSources();
  }, []);

  const parseSelectors = (): Record<string, string> => {
    const lines = selectorsText
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
    const result: Record<string, string> = {};
    for (const line of lines) {
      const idx = line.indexOf("=");
      if (idx === -1) continue;
      const key = line.slice(0, idx).trim();
      const val = line.slice(idx + 1).trim();
      if (key && val) result[key] = val;
    }
    return result;
  };

  const parseExtraParams = (): Record<string, any> | undefined => {
    if (!apiExtraParamsText.trim()) return undefined;
    try {
      const parsed = JSON.parse(apiExtraParamsText);
      if (typeof parsed === "object") return parsed;
      return undefined;
    } catch {
      return undefined;
    }
  };

  const handleCreateSource = async (e: FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setCreateError(null);
    setCreateSuccess(null);
    try {
      const payload: any = {
        name,
        baseUrl,
        providerType,
        enabled,
        frequencyMinutes,
      };

      if (listPath.trim()) payload.listPath = listPath.trim();

      if (providerType === "html") {
        payload.selectors = parseSelectors();
      } else if (providerType === "api") {
        payload.apiConfig = {
          endpoint: apiEndpoint || undefined,
          apiKeyEnvVar: apiKeyEnvVar || undefined,
          extraParams: parseExtraParams(),
        };
      }

      await api.post("/admin/scraping/sources", payload);

      setCreateSuccess("Scrape source created successfully.");
      setName("");
      setBaseUrl("");
      setListPath("");
      setApiEndpoint("");
      setApiKeyEnvVar("");
      setApiExtraParamsText("{}");

      fetchSources();
    } catch (err: any) {
      setCreateError(
        err?.response?.data?.message || "Failed to create scrape source."
      );
    } finally {
      setCreating(false);
      setTimeout(() => {
        setCreateError(null);
        setCreateSuccess(null);
      }, 3000);
    }
  };

  const handleToggleEnabled = async (source: ScrapeSource) => {
    try {
      const newEnabled = !source.enabled;
      await api.put(`/admin/scraping/sources/${source._id}`, {
        enabled: newEnabled,
      });
      setSources((prev) =>
        prev.map((s) =>
          s._id === source._id ? { ...s, enabled: newEnabled } : s
        )
      );
    } catch (err: any) {
      alert(
        err?.response?.data?.message || "Failed to update enabled state for source."
      );
    }
  };

  const handleRunNow = async (source: ScrapeSource) => {
    setRunningSourceId(source._id);
    setRunMessage(null);
    try {
      const res = await api.post(
        `/admin/scraping/sources/${source._id}/run`
      );
      setRunMessage(
        res.data.message ||
          "Scrape job queued. It will run in the background."
      );
    } catch (err: any) {
      setRunMessage(
        err?.response?.data?.message || "Failed to trigger scrape job."
      );
    } finally {
      setRunningSourceId(null);
      setTimeout(() => setRunMessage(null), 4000);
    }
  };

  const handlePreview = async (source: ScrapeSource) => {
    setSelectedSourceForPreview(source);
    setPreviewItems([]);
    setPreviewError(null);
    setPreviewLoading(true);
    try {
      const res = await api.get(
        `/admin/scraping/sources/${source._id}/live-preview`
      );
      setPreviewItems(res.data.items || []);
    } catch (err: any) {
      setPreviewError(
        err?.response?.data?.message || "Failed to run live preview scrape."
      );
    } finally {
      setPreviewLoading(false);
    }
  };

  const skeletonList = (
    <div className="applications-list">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="skeleton-card">
          <div className="skeleton skeleton-text lg" style={{ width: "60%" }} />
          <div style={{ height: 8 }} />
          <div className="skeleton skeleton-text sm" style={{ width: "35%" }} />
          <div style={{ height: 8 }} />
          <div className="skeleton skeleton-text sm" style={{ width: "45%" }} />
        </div>
      ))}
    </div>
  );

  return (
    <ProtectedRoute>
      <Layout>
        <h1>Admin · Scraping Sources</h1>
        <p
          style={{
            fontSize: "0.85rem",
            color: "var(--ns-text-soft)",
            marginTop: 0,
            marginBottom: "1rem",
          }}
        >
          Manage HTML/API sources that feed real-time internships into NextStep.
          You can enable/disable sources, configure selectors, and run live
          previews.
        </p>

        <section
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 1.1fr) minmax(0, 0.9fr)",
            gap: "1.2rem",
          }}
        >
          {/* Left side: list of sources + actions */}
          <div className="jobs-list">
            <div className="jobs-header-row">
              <div>
                <h2 className="jobs-header-title">Configured sources</h2>
                <p className="jobs-header-sub">
                  Each source corresponds to an external site or API.
                </p>
              </div>
              <span className="jobs-count-pill">
                {loading
                  ? "Loading..."
                  : `${sources.length} source${
                      sources.length === 1 ? "" : "s"
                    }`}
              </span>
            </div>

            {loadError && (
              <div style={{ color: "#fecaca", fontSize: "0.85rem" }}>
                {loadError}
              </div>
            )}

            {runMessage && (
              <div style={{ color: "#bbf7d0", fontSize: "0.8rem" }}>
                {runMessage}
              </div>
            )}

            {loading && skeletonList}

            {!loading && !loadError && sources.length === 0 && (
              <p style={{ fontSize: "0.86rem", color: "var(--ns-text-soft)" }}>
                No scraping sources configured yet. Use the form on the right to
                create your first source.
              </p>
            )}

            {!loading && !loadError && sources.length > 0 && (
              <div className="applications-list">
                {sources.map((s) => (
                  <div key={s._id} className="app-card">
                    <h3>{s.name}</h3>
                    <p
                      style={{
                        margin: "0.25rem 0 0.35rem",
                        fontSize: "0.82rem",
                        color: "var(--ns-text-soft)",
                      }}
                    >
                      {s.baseUrl}
                      {s.listPath && (
                        <>
                          <br />
                          List path: <code>{s.listPath}</code>
                        </>
                      )}
                    </p>

                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: "0.5rem",
                        marginBottom: "0.5rem",
                        fontSize: "0.78rem",
                      }}
                    >
                      <span className="job-pill">
                        Provider: {s.providerType.toUpperCase()}
                      </span>
                      <span className="job-pill">
                        {s.enabled ? "Enabled" : "Disabled"}
                      </span>
                      {s.frequencyMinutes && (
                        <span className="job-pill">
                          Every {s.frequencyMinutes} min
                        </span>
                      )}
                    </div>

                    <p
                      style={{
                        margin: "0 0 0.5rem",
                        fontSize: "0.78rem",
                        color: "var(--ns-text-soft)",
                      }}
                    >
                      Last run:{" "}
                      {s.lastRunAt
                        ? new Date(s.lastRunAt).toLocaleString()
                        : "Never"}
                    </p>

                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        gap: "0.5rem",
                        flexWrap: "wrap",
                      }}
                    >
                      <div style={{ display: "flex", gap: "0.5rem" }}>
                        <button
                          type="button"
                          className="btn btn-outline"
                          style={{
                            paddingInline: "0.75rem",
                            fontSize: "0.78rem",
                          }}
                          onClick={() => handleToggleEnabled(s)}
                        >
                          {s.enabled ? "Disable" : "Enable"}
                        </button>
                        <button
                          type="button"
                          className="btn btn-primary"
                          style={{
                            paddingInline: "0.75rem",
                            fontSize: "0.78rem",
                          }}
                          onClick={() => handleRunNow(s)}
                          disabled={runningSourceId === s._id}
                        >
                          {runningSourceId === s._id
                            ? "Running..."
                            : "Run now"}
                        </button>
                      </div>
                      <button
                        type="button"
                        className="btn btn-outline"
                        style={{
                          paddingInline: "0.75rem",
                          fontSize: "0.78rem",
                        }}
                        onClick={() => handlePreview(s)}
                      >
                        Preview
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Preview results panel */}
            {selectedSourceForPreview && (
              <div style={{ marginTop: "1rem" }}>
                <h3
                  style={{
                    fontSize: "0.95rem",
                    marginBottom: "0.4rem",
                  }}
                >
                  Live preview · {selectedSourceForPreview.name}
                </h3>
                {previewLoading && (
                  <div className="applications-list">
                    {Array.from({ length: 2 }).map((_, i) => (
                      <div key={i} className="skeleton-card">
                        <div
                          className="skeleton skeleton-text lg"
                          style={{ width: "60%" }}
                        />
                        <div style={{ height: 6 }} />
                        <div
                          className="skeleton skeleton-text sm"
                          style={{ width: "40%" }}
                        />
                      </div>
                    ))}
                  </div>
                )}
                {previewError && (
                  <div style={{ color: "#fecaca", fontSize: "0.8rem" }}>
                    {previewError}
                  </div>
                )}
                {!previewLoading && !previewError && previewItems.length === 0 && (
                  <p
                    style={{
                      fontSize: "0.8rem",
                      color: "var(--ns-text-soft)",
                    }}
                  >
                    No preview items returned yet.
                  </p>
                )}
                {!previewLoading && previewItems.length > 0 && (
                  <div className="applications-list">
                    {previewItems.slice(0, 5).map((p, idx) => (
                      <div key={idx} className="app-card">
                        <h3>{p.title}</h3>
                        <p
                          style={{
                            margin: "0.25rem 0 0.3rem",
                            fontSize: "0.84rem",
                            color: "var(--ns-text-soft)",
                          }}
                        >
                          {p.companyName && `${p.companyName} · `}
                          {p.location}
                        </p>
                        <p
                          style={{
                            margin: 0,
                            fontSize: "0.8rem",
                            color: "var(--ns-text-soft)",
                          }}
                        >
                          {p.description}
                        </p>
                        {p.applyUrl && (
                          <p
                            style={{
                              marginTop: "0.4rem",
                              fontSize: "0.78rem",
                            }}
                          >
                            Apply URL:{" "}
                            <a
                              href={p.applyUrl}
                              target="_blank"
                              rel="noreferrer"
                            >
                              {p.applyUrl}
                            </a>
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right side: create new source */}
          <div className="jobs-filters">
            <h3 className="filter-title">Create new source</h3>
            <p className="filter-sub">
              Define how NextStep should fetch internships from an external site
              or API. For HTML, use CSS selectors. For APIs, configure endpoint
              and auth.
            </p>

            <form onSubmit={handleCreateSource}>
              <div className="form-field">
                <label className="form-label">Name</label>
                <input
                  required
                  className="form-input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. DemoJobSite"
                />
              </div>

              <div className="form-field">
                <label className="form-label">Base URL</label>
                <input
                  required
                  className="form-input"
                  value={baseUrl}
                  onChange={(e) => setBaseUrl(e.target.value)}
                  placeholder="https://example.com"
                />
              </div>

              <div className="form-field">
                <label className="form-label">List path (optional)</label>
                <input
                  className="form-input"
                  value={listPath}
                  onChange={(e) => setListPath(e.target.value)}
                  placeholder="/jobs or /internships"
                />
              </div>

              <div className="form-field">
                <label className="form-label">Provider type</label>
                <select
                  className="form-select"
                  value={providerType}
                  onChange={(e) =>
                    setProviderType(e.target.value as ProviderType)
                  }
                >
                  <option value="html">HTML (web scraping)</option>
                  <option value="api">API provider</option>
                </select>
              </div>

              <div className="form-field">
                <label className="form-label">
                  Frequency (minutes, optional)
                </label>
                <input
                  type="number"
                  min={5}
                  className="form-input"
                  value={frequencyMinutes ?? ""}
                  onChange={(e) =>
                    setFrequencyMinutes(
                      e.target.value ? Number(e.target.value) : undefined
                    )
                  }
                />
              </div>

              <div className="form-field">
                <label className="form-label">Enabled</label>
                <select
                  className="form-select"
                  value={enabled ? "true" : "false"}
                  onChange={(e) => setEnabled(e.target.value === "true")}
                >
                  <option value="true">Enabled</option>
                  <option value="false">Disabled</option>
                </select>
              </div>

              {providerType === "html" && (
                <div className="form-field">
                  <label className="form-label">
                    CSS selectors (key=selector, one per line)
                  </label>
                  <textarea
                    className="form-textarea"
                    rows={4}
                    value={selectorsText}
                    onChange={(e) => setSelectorsText(e.target.value)}
                  />
                  <p
                    style={{
                      margin: 0,
                      fontSize: "0.75rem",
                      color: "var(--ns-text-soft)",
                    }}
                  >
                    Required keys: <code>item</code>, <code>title</code>. Optional:
                    <code>location</code>, <code>company</code>, <code>link</code>.
                  </p>
                </div>
              )}

              {providerType === "api" && (
                <>
                  <div className="form-field">
                    <label className="form-label">API endpoint</label>
                    <input
                      className="form-input"
                      value={apiEndpoint}
                      onChange={(e) => setApiEndpoint(e.target.value)}
                      placeholder="https://api.partner.com/jobs"
                    />
                  </div>
                  <div className="form-field">
                    <label className="form-label">
                      API key env var (optional)
                    </label>
                    <input
                      className="form-input"
                      value={apiKeyEnvVar}
                      onChange={(e) => setApiKeyEnvVar(e.target.value)}
                      placeholder="LINKEDIN_API_KEY"
                    />
                  </div>
                  <div className="form-field">
                    <label className="form-label">
                      Extra params (JSON, optional)
                    </label>
                    <textarea
                      className="form-textarea"
                      rows={3}
                      value={apiExtraParamsText}
                      onChange={(e) => setApiExtraParamsText(e.target.value)}
                    />
                    <p
                      style={{
                        margin: 0,
                        fontSize: "0.75rem",
                        color: "var(--ns-text-soft)",
                      }}
                    >
                      Example: <code>{`{"location": "India", "type": "internship"}`}</code>
                    </p>
                  </div>
                </>
              )}

              {createError && (
                <div className="form-error">{createError}</div>
              )}
              {createSuccess && (
                <div
                  style={{
                    color: "#bbf7d0",
                    fontSize: "0.8rem",
                    marginBottom: "0.75rem",
                  }}
                >
                  {createSuccess}
                </div>
              )}

              <button
                type="submit"
                className="btn btn-primary"
                disabled={creating}
              >
                {creating ? "Creating..." : "Create source"}
              </button>
            </form>
          </div>
        </section>
      </Layout>
    </ProtectedRoute>
  );
};

export default AdminScrapingPage;
