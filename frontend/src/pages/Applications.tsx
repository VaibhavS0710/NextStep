import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import ProtectedRoute from "../components/ProtectedRoute";
import { api } from "../lib/api";

interface Application {
  _id: string;
  status: string;
  appliedAt: string;
  internshipId?: {
    title?: string;
    location?: string;
  };
}

const ApplicationsPage = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchApplications = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/applications/student/me");
      setApplications(res.data.applications || []);
    } catch (err: any) {
      setError(
        err?.response?.data?.message || "Failed to fetch applications"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const skeleton = (
    <div className="applications-list">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="skeleton-card">
          <div className="skeleton skeleton-text lg" style={{ width: "55%" }} />
          <div style={{ height: 8 }} />
          <div className="skeleton skeleton-text sm" style={{ width: "35%" }} />
          <div style={{ height: 10 }} />
          <div className="skeleton skeleton-text sm" style={{ width: "40%" }} />
        </div>
      ))}
    </div>
  );

  return (
    <ProtectedRoute>
      <Layout>
        <h1>My Applications</h1>
        <p
          style={{
            fontSize: "0.85rem",
            color: "var(--ns-text-soft)",
            marginTop: 0,
          }}
        >
          Track the internships you&apos;ve applied to and their status.
        </p>

        {loading && skeleton}
        {error && <div style={{ color: "#fecaca" }}>{error}</div>}
        {!loading && applications.length === 0 && !error && (
          <div style={{ fontSize: "0.86rem", color: "var(--ns-text-soft)" }}>
            You haven&apos;t applied to any internships yet. Start by exploring
            the internships page.
          </div>
        )}

        {!loading && !error && applications.length > 0 && (
          <div className="applications-list">
            {applications.map((app) => (
              <div key={app._id} className="app-card">
                <h3>{app.internshipId?.title || "Unknown internship"}</h3>
                <p
                  style={{
                    margin: "0.25rem 0 0.4rem",
                    fontSize: "0.84rem",
                    color: "var(--ns-text-soft)",
                  }}
                >
                  {app.internshipId?.location || "Location not specified"}
                </p>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    fontSize: "0.8rem",
                  }}
                >
                  <span className="app-status-pill">
                    Status: {app.status.toUpperCase()}
                  </span>
                  <span style={{ color: "var(--ns-text-soft)" }}>
                    Applied: {new Date(app.appliedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Layout>
    </ProtectedRoute>
  );
};

export default ApplicationsPage;
