import { useEffect, useState } from "react";
import { useNavigate }  from "react-router-dom";
import Layout from "../components/Layout";
import { api } from "../lib/api";
import mockInternships from "../mock/mockInternships"
interface AggregatedInternship {
  id?: string;
  title: string;
  description: string;
  location: string;
  companyName?: string;
  applyUrl?: string;
  source: string;
  internalId?: string; // present for NextStep DB internships
}

const Internships = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<AggregatedInternship[]>([]);
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState("");
  const [location, setLocation] = useState("");
  const [error, setError] = useState<string | null>(null);

  const [applyingId, setApplyingId] = useState<string | null>(null);
  const [appliedIds, setAppliedIds] = useState<string[]>([]);
  const [applyError, setApplyError] = useState<string | null>(null);
  const [applySuccess, setApplySuccess] = useState<string | null>(null);
//making change here just for the mock data b/c backend is not ready
 /* const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/internships/aggregated/list", {
        params: {
          q: q || undefined,
          location: location || undefined,
        },
      });
      setItems(res.data.items || []);
    } catch (err: any) {
      setError(
        err?.response?.data?.message || "Failed to fetch internships"
      );
    } finally {
      setLoading(false);
    }
  };*/

  //ye bas frontend k liye mock data use kr rha h jb tk backend ready ni hota
  const fetchData = async () => {
  setLoading(true);
  setError(null);

  try {
    // filter mock results
    const filtered = mockInternships.filter((job) => {
      const matchKeyword = q
        ? job.title.toLowerCase().includes(q.toLowerCase()) ||
          job.description.toLowerCase().includes(q.toLowerCase())
        : true;

      const matchLocation = location
        ? job.location.toLowerCase().includes(location.toLowerCase())
        : true;

      return matchKeyword && matchLocation;
    });

    setItems(filtered);
  } catch (err) {
    setError("Failed to load sample internships.");
  } finally {
    setLoading(false);
  }
};
  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchData();
  };

  const handleApply = async (internalId: string) => {
    setApplyingId(internalId);
    setApplyError(null);
    setApplySuccess(null);
    try {
      await api.post(`/applications/${internalId}/apply`);
      setAppliedIds((prev) => [...prev, internalId]);
      setApplySuccess("Application submitted successfully.");
    } catch (err: any) {
      setApplyError(
        err?.response?.data?.message || "Failed to submit application."
      );
    } finally {
      setApplyingId(null);
      // Clear success/error after a short delay
      setTimeout(() => {
        setApplyError(null);
        setApplySuccess(null);
      }, 3000);
    }
  };

  const skeletonCards = (
    <div className="job-list">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="skeleton-card">
          <div className="skeleton skeleton-text lg" style={{ width: "60%" }} />
          <div style={{ height: 6 }} />
          <div className="skeleton skeleton-text sm" style={{ width: "40%" }} />
          <div style={{ height: 8 }} />
          <div className="skeleton skeleton-text sm" style={{ width: "80%" }} />
          <div style={{ height: 4 }} />
          <div className="skeleton skeleton-text sm" style={{ width: "75%" }} />
        </div>
      ))}
    </div>
  );

  return (
    <Layout>
      <section className="hero">
        <div className="hero-inner">
          <p className="hero-kicker">NextStep internships</p>
          <h1 className="hero-title">
            Over <span className="hero-highlight">thousands of internships</span>{" "}
            curated for students.
          </h1>
          <p className="hero-subtitle">
            Discover real-time opportunities from companies and trusted
            platforms. Filter by skills, location and mode to find your perfect
            next step.
          </p>

          <form className="hero-search" onSubmit={handleSearch}>
            <div className="hero-input-group">
              <span style={{ fontSize: "0.8rem", opacity: 0.75 }}>🔎</span>
              <input
                className="hero-input"
                placeholder="Search by role, skill or keyword (e.g., MERN, React)"
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            </div>
            <div className="hero-input-group">
              <span style={{ fontSize: "0.8rem", opacity: 0.75 }}>📍</span>
              <input
                className="hero-input"
                placeholder="Location (e.g., Bangalore, Remote)"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
            <button className="btn btn-primary" type="submit" disabled={loading}>
              {loading ? "Searching..." : "Search"}
            </button>
          </form>

          <div className="hero-meta">
            <span className="hero-meta-strong">Real-time aggregated results</span>{" "}
            · manually posted + external sources
          </div>
        </div>
      </section>

      <div className="trusted-row">
        <span>Trusted by students preparing for</span>
        <div className="trusted-logos">
          <span className="logo-pill">FAANG Prep</span>
          <span className="logo-pill">Service-based roles</span>
          <span className="logo-pill">Startups</span>
          <span className="logo-pill">Remote internships</span>
        </div>
      </div>

      <section className="jobs-layout">
        <aside className="jobs-filters">
          <h3 className="filter-title">Quick filters</h3>
          <p className="filter-sub">
            These are just shortcuts that tweak your search box.
          </p>

          <div className="filter-group">
            <div className="filter-group-label">Popular skills</div>
            <div className="filter-chips">
              {["MERN", "React", "Node.js", "Data Science"].map((skill) => (
                <button
                  key={skill}
                  type="button"
                  className="chip"
                  onClick={() => setQ(skill)}
                >
                  {skill}
                </button>
              ))}
            </div>
          </div>

          <div className="filter-group">
            <div className="filter-group-label">Locations</div>
            <div className="filter-chips">
              {["Remote", "Bangalore", "Hyderabad", "Chennai"].map((loc) => (
                <button
                  key={loc}
                  type="button"
                  className="chip"
                  onClick={() => setLocation(loc)}
                >
                  {loc}
                </button>
              ))}
            </div>
          </div>

          <div className="filter-group">
            <div className="filter-group-label">Tips</div>
            <p
              style={{
                fontSize: "0.78rem",
                color: "var(--ns-text-soft)",
                margin: 0,
              }}
            >
              Use searches like <strong>"remote react"</strong> or{" "}
              <strong>"data science in Bangalore"</strong> to get better
              matches.
            </p>
          </div>
        </aside>

        <div className="jobs-list">
          <div className="jobs-header-row">
            <div>
              <h2 className="jobs-header-title">Latest results</h2>
              <p className="jobs-header-sub">
                Internships from NextStep companies + allowed external partners.
              </p>
            </div>
            <span className="jobs-count-pill">
              {loading
                ? "Loading..."
                : `${items.length} internship${items.length === 1 ? "" : "s"} found`}
            </span>
          </div>

          {error && (
            <div style={{ color: "#fecaca", fontSize: "0.85rem" }}>{error}</div>
          )}

          {applyError && (
            <div style={{ color: "#fecaca", fontSize: "0.8rem" }}>
              {applyError}
            </div>
          )}
          {applySuccess && (
            <div style={{ color: "#bbf7d0", fontSize: "0.8rem" }}>
              {applySuccess}
            </div>
          )}

          {loading && skeletonCards}

          {!loading && !error && items.length === 0 && (
            <p style={{ fontSize: "0.86rem", color: "var(--ns-text-soft)" }}>
              No internships match your query yet. Try a simpler keyword or
              remove the location filter.
            </p>
          )}

          {!loading && !error && items.length > 0 && (
            <div className="job-list">
              {items.map((i, idx) => {
                const canApplyInternally = !!i.internalId;
                const applied = i.internalId
                  ? appliedIds.includes(i.internalId)
                  : false;

                return (
                  <div key={idx} className="job-card">
                    <div className="job-card-main" style={{ cursor: "pointer" }} onClick={() =>navigate(`/internships/${i.id ?? idx}`, {
                      state: { internship: i },  // pass full data
                      })}>

                      <h3>{i.title}</h3>
                      {i.companyName && (
                        <div className="job-company">{i.companyName}</div>
                      )}
                      <div className="job-pill-row">
                        <span className="job-pill">📍 {i.location}</span>
                        <span className="job-pill">Source · {i.source}</span>
                      </div>
                      <p className="job-desc">{i.description}</p>
                    </div>
                    <div className="job-card-actions">
                      <div className="job-source-tag">
                        {i.applyUrl
                          ? "Apply on external site"
                          : canApplyInternally
                          ? "Apply directly via NextStep"
                          : "Application flow coming soon"}
                      </div>

                      {i.applyUrl && (
                        <a
                          href={i.applyUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="btn btn-primary"
                          style={{ fontSize: "0.8rem", paddingInline: "0.9rem" }}
                          onClick={(e) => e.stopPropagation()}   // ✅ important
                        >

                          Apply now
                        </a>
                      )}

                      {canApplyInternally && (
                        <button
                          type="button"
                          className="btn btn-primary"
                          style={{ fontSize: "0.8rem", paddingInline: "0.9rem" }}
                          disabled={applyingId === i.internalId || applied}
                          onClick={(e) => {
                            e.stopPropagation();  // ✅ prevents navigation
                            i.internalId && handleApply(i.internalId);
                          }}
                        >

                          {applied
                            ? "Applied"
                            : applyingId === i.internalId
                            ? "Applying..."
                            : "Apply on NextStep"}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default Internships;
