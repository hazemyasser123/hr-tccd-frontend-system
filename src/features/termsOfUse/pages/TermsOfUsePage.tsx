import tccd_logo from "@/assets/TCCD_logo.svg";
import { Link } from "react-router-dom";
import { IoArrowBack } from "react-icons/io5";

type ContentBlock =
  | { type: "paragraph"; text: string }
  | { type: "list"; items: string[] };

interface TermsSection {
  title: string;
  blocks: ContentBlock[];
}

const LAST_UPDATED = "August 29, 2026";

const TERMS_SECTIONS: TermsSection[] = [
  {
    title: "Access to Services",
    blocks: [
      {
        type: "paragraph",
        text: "Some TCCD systems and features are available only to authorized and approved members.",
      },
      {
        type: "paragraph",
        text: "Other features, including specific forms and submission pages, may be made publicly accessible.",
      },
      {
        type: "paragraph",
        text: "Access to internal systems may be granted, modified, suspended, or revoked by TCCD according to organizational requirements.",
      },
      {
        type: "paragraph",
        text: "Users must not allow unauthorized individuals to access restricted features using their accounts.",
      },
    ],
  },
  {
    title: "Purpose of the Services",
    blocks: [
      {
        type: "paragraph",
        text: "TCCD systems may support organizational activities including:",
      },
      {
        type: "list",
        items: [
          "Organizing and managing meetings;",
          "Creating Google Meet meetings through the system;",
          "Generating attendance reports;",
          "Collecting applications, registrations, and requests through forms;",
          "Receiving and processing submitted information and files; and",
          "Supporting activities involving TCCD and its partners.",
        ],
      },
      {
        type: "paragraph",
        text: "Services must be used only for their intended purpose.",
      },
    ],
  },
  {
    title: "Google Account Authorization",
    blocks: [
      {
        type: "paragraph",
        text: "Certain internal features require an authorized user to connect a Google Account.",
      },
      {
        type: "paragraph",
        text: "When a user connects a Google Account, the user authorizes the system to access Google Meet information permitted through the permissions presented during the Google authorization process.",
      },
      {
        type: "paragraph",
        text: "Users may revoke this authorization through their Google Account settings. Revoking authorization may prevent certain features from functioning.",
      },
    ],
  },
  {
    title: "Form Submissions and File Uploads",
    blocks: [
      {
        type: "paragraph",
        text: "Some forms may allow users to submit personal information, documents, or other files.",
      },
      {
        type: "paragraph",
        text: "The purpose of the form and any relevant partner organizations or parties with whom submissions may be shared will be described in the relevant form where applicable.",
      },
      {
        type: "paragraph",
        text: "By submitting a form and uploading files after being informed of the relevant purpose and intended recipients, the user authorizes TCCD to process and share the submitted information and files for the purposes described in that form.",
      },
      {
        type: "paragraph",
        text: "Users are responsible for ensuring that information and files submitted through TCCD systems are accurate and that they have the necessary right or permission to submit them.",
      },
    ],
  },
  {
    title: "User Responsibilities",
    blocks: [
      { type: "paragraph", text: "Users are responsible for:" },
      {
        type: "list",
        items: [
          "Using TCCD systems only for their intended and authorized purposes;",
          "Providing accurate information where required;",
          "Maintaining the security of their accounts;",
          "Ensuring they have the necessary authorization to submit information or files;",
          "Using meeting management features responsibly;",
          "Managing access to reports they generate; and",
          "Not attempting to access information belonging to others without authorization.",
        ],
      },
    ],
  },
  {
    title: "Meeting and Attendance Reports",
    blocks: [
      {
        type: "paragraph",
        text: "The system may retrieve information from Google Meet in order to generate attendance reports for meetings created through the system.",
      },
      {
        type: "paragraph",
        text: "Reports may contain information about meeting participants and their attendance.",
      },
      {
        type: "paragraph",
        text: "Users who generate reports are responsible for granting access only to individuals who are authorized to view the information contained in those reports.",
      },
    ],
  },
  {
    title: "Report Retention",
    blocks: [
      {
        type: "paragraph",
        text: "Generated attendance reports are retained for up to 24 hours and may be automatically deleted after that period.",
      },
      {
        type: "paragraph",
        text: "Users who require a report for future use should download it before the retention period expires.",
      },
      {
        type: "paragraph",
        text: "TCCD is not responsible for restoring reports after they have been automatically deleted.",
      },
    ],
  },
  {
    title: "Appropriate Use",
    blocks: [
      { type: "paragraph", text: "Users must not use TCCD systems to:" },
      {
        type: "list",
        items: [
          "Access information, meetings, files, or reports without authorization;",
          "Submit files they do not have the right to share;",
          "Share restricted information with unauthorized individuals;",
          "Attempt to interfere with the security or operation of the systems;",
          "Circumvent authentication or authorization controls;",
          "Use the systems for unlawful or unauthorized purposes; or",
          "Misrepresent their identity or provide deliberately misleading information.",
        ],
      },
    ],
  },
  {
    title: "Availability and Changes",
    blocks: [
      {
        type: "paragraph",
        text: "TCCD may modify, suspend, restrict, or discontinue any part of its systems or services when necessary.",
      },
      {
        type: "paragraph",
        text: "Some functionality may depend on third-party services, including Google services.",
      },
      {
        type: "paragraph",
        text: "TCCD does not guarantee uninterrupted or error-free operation of its systems or services.",
      },
    ],
  },
  {
    title: "Suspension or Termination of Access",
    blocks: [
      {
        type: "paragraph",
        text: "TCCD may suspend or terminate access to restricted services when a user:",
      },
      {
        type: "list",
        items: [
          "Is no longer authorized to access the service;",
          "Violates these Terms;",
          "Misuses a TCCD system or service; or",
          "Creates a security, operational, or organizational risk.",
        ],
      },
    ],
  },
  {
    title: "Changes to These Terms",
    blocks: [
      { type: "paragraph", text: "TCCD may update these Terms when necessary." },
      {
        type: "paragraph",
        text: "The latest version will be published on this page.",
      },
    ],
  },
  {
    title: "Contact",
    blocks: [
      {
        type: "paragraph",
        text: "For questions regarding these Terms or TCCD systems and services, please contact TCCD through the organization's official email address.",
      },
    ],
  },
];

const TermsOfUsePage = () => {
  return (
    <main className="min-h-screen bg-gradient-to-b from-page-gradient-start via-page-gradient-middle to-page-gradient-end text-text-body-main">
      <div className="mx-auto max-w-5xl px-4 py-10 md:py-16">
        <Link
          to="/"
          className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-text-muted-foreground transition-colors hover:text-primary"
        >
          <IoArrowBack size={16} />
          Back to Home
        </Link>
        <section
          className="rounded-2xl bg-surface-glass-bg/60 p-6 shadow-2xl backdrop-blur md:p-12"
          aria-labelledby="terms-title"
        >
          <header className="mb-8 flex flex-col items-center gap-3 text-center">
            <img src={tccd_logo} width={72} alt="TCCD logo" />
            <h1
              id="terms-title"
              className="text-2xl font-bold text-text-title md:text-3xl"
            >
              Terms of Service
            </h1>
            <p className="text-sm text-text-caption">
              Last updated: {LAST_UPDATED}
            </p>
            <p className="max-w-xl text-sm text-text-muted-foreground md:text-base">
              These Terms of Service govern the use of systems and services
              operated by the Technical Center for Career Development
              ("TCCD", "we", "us", or "our"). By accessing or using a TCCD
              system or service, you agree to these Terms.
            </p>
          </header>

          <div className="space-y-8">
            {TERMS_SECTIONS.map((section, index) => (
              <section key={section.title} aria-labelledby={`terms-section-${index}`}>
                <h2
                  id={`terms-section-${index}`}
                  className="mb-2 text-lg font-bold text-text-title md:text-xl"
                >
                  {index + 1}. {section.title}
                </h2>
                {section.blocks.map((block, blockIndex) =>
                  block.type === "paragraph" ? (
                    <p
                      key={blockIndex}
                      className="mb-3 leading-relaxed text-text-body-main last:mb-0"
                    >
                      {block.text}
                    </p>
                  ) : (
                    <ul
                      key={blockIndex}
                      className="mb-3 list-inside list-disc space-y-1 pl-1 text-text-body-main last:mb-0"
                    >
                      {block.items.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  ),
                )}
              </section>
            ))}
          </div>

          <footer className="mt-10 border-t border-dashboard-border pt-6 text-center text-sm text-text-caption">
            Technical Center for Career Development (TCCD)
          </footer>
        </section>
      </div>
    </main>
  );
};

export default TermsOfUsePage;
