import { useLocation, useParams } from "react-router-dom";
import Layout from "../components/Layout";
import mockInternships from "../mock/mockInternships";

interface Internship {
  id?: string;
  title: string;
  description: string;
  location: string;
  companyName?: string;
  applyUrl?: string;
  source: string;
  salary?: string;
  qualification?: string;
  degree?: string;
  experience?: string;
  gapYearsAllowed?: string;
  skills?: string[];
  aboutCompany?: string;
  fullDescription?: string;
}

const InternshipDetails = () => {
  const { id } = useParams<{ id: string }>();
  const locationState = useLocation() as { state?: { internship?: Internship } };

  const internshipFromState = locationState.state?.internship;
  const internship =
    internshipFromState ||
    mockInternships.find((job) => job.id === id);

  if (!internship) {
    return (
      <Layout>
        <div style={{ padding: "3rem", textAlign: "center" }}>Internship not found</div>
      </Layout>
    );
  }

  return (
  <Layout>
    <div
      className="details-shell"
    >
      <div className="details-card">
        <h1 className="details-title">
          {internship.title}
        </h1>

        <p className="details-subtitle">
          {internship.companyName} · {internship.location}
        </p>

        <section className="details-section">
          <h2>📌 Job Description</h2>
          <p className="details-text">
            {internship.fullDescription || internship.description}
          </p>
        </section>

        <hr className="details-divider" />

        <section className="details-section">
          <h2>🎓 Requirements</h2>
          <div className="details-grid">
            <Info label="Qualification" value={internship.qualification} />
            <Info label="Degree" value={internship.degree} />
            <Info label="Experience" value={internship.experience} />
            <Info label="Gap Years" value={internship.gapYearsAllowed} />
            <Info label="Salary / Stipend" value={internship.salary} />
          </div>
        </section>

        {internship.skills && internship.skills.length > 0 && (
          <section className="details-section">
            <h2>🛠 Required Skills</h2>
            <div className="details-skills">
              {internship.skills.map((skill, idx) => (
                <span key={idx} className="chip">
                  {skill}
                </span>
              ))}
            </div>
          </section>
        )}

        {internship.aboutCompany && (
          <section className="details-section">
            <h2>🏢 About the Company</h2>
            <p className="details-text">
              {internship.aboutCompany}
            </p>
          </section>
        )}

        <div className="details-footer">
          <span className="details-source">
            Source · {internship.source}
          </span>

          {internship.applyUrl && (
            <a
              href={internship.applyUrl}
              target="_blank"
              rel="noreferrer"
              className="btn btn-primary"
            >
              Apply Now
            </a>
          )}
        </div>
      </div>
    </div>
  </Layout>
);
};

const Info = ({ label, value }: { label: string; value?: string }) => {
  if (!value) return null;

  return (
    <div style={{
      background: "var(--ns-bg-glass)",
      padding: "1rem",
      borderRadius: "8px"
    }}>
      <p style={{ fontSize: "0.75rem", opacity: 0.7 }}>{label}</p>
      <p style={{ fontWeight: 500 }}>{value}</p>
    </div>
  );
};

export default InternshipDetails;
