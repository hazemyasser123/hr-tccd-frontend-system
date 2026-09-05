import tccd_logo from "@/assets/TCCD_logo.svg";
import { Link } from "react-router-dom";
import { IoArrowBack } from "react-icons/io5";

type ContentBlock =
  | { type: "paragraph"; text: string }
  | { type: "list"; items: string[] }
  | { type: "subheading"; text: string }
  | { type: "code"; text: string };

interface PrivacySection {
  title: string;
  blocks: ContentBlock[];
}

const LAST_UPDATED = "August 29, 2026";

const INTRO_PARAGRAPHS = [
  'Technical Center for Career Development ("TCCD", "we", "us", or "our") operates systems and services that support organizational activities, including meeting management, attendance reporting, forms, and submissions.',
  "This Privacy Policy explains how we collect, access, use, store, and share information through these systems, including information obtained through Google services.",
];

const PRIVACY_SECTIONS: PrivacySection[] = [
  {
    title: "Scope of This Privacy Policy",
    blocks: [
      {
        type: "paragraph",
        text: "Some TCCD systems and features are available only to authorized and approved members, while other features, such as specific forms and submission pages, may be publicly accessible.",
      },
      {
        type: "paragraph",
        text: "The information collected and the way it is used may depend on the feature or service being used.",
      },
    ],
  },
  {
    title: "Information We Access and Collect",
    blocks: [
      { type: "subheading", text: "Google Meet Information" },
      {
        type: "paragraph",
        text: "Certain internal meeting management features allow authorized users to connect a Google Account to the system.",
      },
      {
        type: "paragraph",
        text: "With the user's authorization, the system uses the following Google permission:",
      },
      {
        type: "code",
        text: "https://www.googleapis.com/auth/meetings.space.created",
      },
      {
        type: "paragraph",
        text: "This permission allows the system to create and access Google Meet spaces created through the application.",
      },
      {
        type: "paragraph",
        text: "Information accessed may include, where available and necessary for the system's functionality:",
      },
      {
        type: "list",
        items: [
          "Meeting details and identifiers;",
          "Meeting links;",
          "Conference information;",
          "Participant information;",
          "Participant join and leave times;",
          "Attendance duration and participant sessions; and",
          "Other information required to generate attendance reports.",
        ],
      },
      {
        type: "paragraph",
        text: "Google Meet information is accessed solely to provide meeting management and attendance reporting functionality.",
      },
      { type: "subheading", text: "Authentication Information" },
      {
        type: "paragraph",
        text: "TCCD maintains its own authentication system to identify users and control access to internal features.",
      },
      {
        type: "paragraph",
        text: "Google authorization is used separately when an authorized user chooses to connect a Google Account for features that require access to Google Meet.",
      },
      { type: "subheading", text: "OAuth Credentials" },
      {
        type: "paragraph",
        text: "OAuth tokens and credentials may be securely stored when necessary to maintain an authorized connection to Google services.",
      },
      {
        type: "paragraph",
        text: "These credentials are used only to provide the functionality authorized by the user and are not used for advertising, marketing, or unrelated purposes.",
      },
      { type: "subheading", text: "Form Submissions and Uploaded Files" },
      {
        type: "paragraph",
        text: "Some TCCD forms may be publicly accessible and may allow users to submit information and upload files.",
      },
      {
        type: "paragraph",
        text: "The information collected through a form depends on the fields and requirements presented within that specific form.",
      },
      {
        type: "paragraph",
        text: "Before submitting a form, users may be informed that their submitted information or files will be shared with specific partner organizations or other parties involved in the activity described by the form.",
      },
      {
        type: "paragraph",
        text: "By submitting the form after such information is provided, the user authorizes TCCD to process and share the submitted information and files with the explicitly identified parties for the purpose described in the form.",
      },
    ],
  },
  {
    title: "How Information Is Used",
    blocks: [
      {
        type: "paragraph",
        text: "Information is used only for purposes related to the functionality through which it was provided or accessed.",
      },
      { type: "paragraph", text: "This may include:" },
      {
        type: "list",
        items: [
          "Organizing and managing meetings;",
          "Creating Google Meet spaces through the system;",
          "Generating attendance reports;",
          "Processing form submissions;",
          "Managing applications, registrations, or requests;",
          "Providing submitted information and files to explicitly identified partners;",
          "Supporting organizational activities; and",
          "Maintaining the operation and security of TCCD systems.",
        ],
      },
      {
        type: "paragraph",
        text: "TCCD does not use Google user data for advertising purposes and does not sell Google user data.",
      },
    ],
  },
  {
    title: "Generated Attendance Reports",
    blocks: [
      {
        type: "paragraph",
        text: "The system may generate attendance reports based on information retrieved from Google Meet.",
      },
      { type: "paragraph", text: "Reports may include information such as:" },
      {
        type: "list",
        items: [
          "Participant names;",
          "Attendance times;",
          "Join and leave times; and",
          "Attendance duration.",
        ],
      },
      { type: "paragraph", text: "A generated report may be accessed by:" },
      {
        type: "list",
        items: [
          "The user who requested or generated the report; and",
          "Other users explicitly authorized by that user.",
        ],
      },
      {
        type: "paragraph",
        text: "Access to reports is controlled through the system's authorization mechanisms.",
      },
    ],
  },
  {
    title: "File Storage and Access",
    blocks: [
      {
        type: "paragraph",
        text: "Files submitted through TCCD forms or systems may be stored using a Google Drive account managed by TCCD.",
      },
      {
        type: "paragraph",
        text: "Users submitting files do not authorize TCCD to access their personal Google Drive accounts.",
      },
      { type: "paragraph", text: "Access to submitted files is limited to:" },
      {
        type: "list",
        items: [
          "Authorized TCCD administrators; and",
          "Partner organizations or other parties explicitly identified in the relevant form, where sharing is necessary for the purpose described in that form.",
        ],
      },
      {
        type: "paragraph",
        text: "Files are not made publicly available unless explicitly stated otherwise.",
      },
    ],
  },
  {
    title: "Data Storage and Retention",
    blocks: [
      {
        type: "paragraph",
        text: "The system does not permanently store raw Google Meet conference records or participant activity solely for attendance reporting purposes.",
      },
      {
        type: "paragraph",
        text: "Meeting information required to generate a report may be retrieved from Google Meet when needed and processed for report generation.",
      },
      {
        type: "paragraph",
        text: "Generated attendance reports are retained for up to 24 hours and are automatically deleted after that period.",
      },
      {
        type: "paragraph",
        text: "Users may download reports before they are deleted.",
      },
      {
        type: "paragraph",
        text: "OAuth credentials may be retained only for as long as necessary to maintain authorized access or until authorization is revoked, removed, or no longer required.",
      },
      {
        type: "paragraph",
        text: "Form submissions and uploaded files may be retained for as long as necessary to fulfill the purpose described in the relevant form, support the associated organizational activity, or meet applicable administrative or legal requirements.",
      },
    ],
  },
  {
    title: "Data Sharing",
    blocks: [
      {
        type: "paragraph",
        text: "TCCD does not sell, rent, or trade personal information or Google user data.",
      },
      {
        type: "paragraph",
        text: "Information may be shared only when necessary for the relevant purpose, including:",
      },
      {
        type: "list",
        items: [
          "With authorized TCCD administrators;",
          "With users explicitly authorized to access a generated report;",
          "With partners or other parties explicitly identified in a form or submission process;",
          "When necessary to provide the requested functionality; or",
          "When required by applicable law.",
        ],
      },
    ],
  },
  {
    title: "Revoking Google Access",
    blocks: [
      {
        type: "paragraph",
        text: "Users may revoke the system's access to their Google Account through their Google Account security settings.",
      },
      {
        type: "paragraph",
        text: "Revoking access may prevent features that depend on Google Meet access from functioning.",
      },
      {
        type: "paragraph",
        text: "Users may also contact TCCD regarding the removal of their authorized Google connection, where applicable.",
      },
    ],
  },
  {
    title: "Data Security",
    blocks: [
      {
        type: "paragraph",
        text: "TCCD takes reasonable technical and organizational measures to protect information and credentials from unauthorized access, alteration, disclosure, or misuse.",
      },
      {
        type: "paragraph",
        text: "Access to internal features and administrative information is restricted through authentication and authorization controls.",
      },
    ],
  },
  {
    title: "Changes to This Privacy Policy",
    blocks: [
      {
        type: "paragraph",
        text: "TCCD may update this Privacy Policy when necessary to reflect changes to its systems, services, functionality, or applicable requirements.",
      },
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
        text: "If you have questions about this Privacy Policy or how information is handled by TCCD systems, please contact TCCD through the organization's official email address.",
      },
    ],
  },
];

const PrivacyPolicyPage = () => {
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
          aria-labelledby="privacy-title"
        >
          <header className="mb-8 flex flex-col items-center gap-3 text-center">
            <img src={tccd_logo} width={72} alt="TCCD logo" />
            <h1
              id="privacy-title"
              className="text-2xl font-bold text-text-title md:text-3xl"
            >
              Privacy Policy
            </h1>
            <p className="text-sm text-text-caption">
              Last updated: {LAST_UPDATED}
            </p>
            {INTRO_PARAGRAPHS.map((paragraph) => (
              <p
                key={paragraph}
                className="max-w-xl text-sm text-text-muted-foreground md:text-base"
              >
                {paragraph}
              </p>
            ))}
          </header>

          <div className="space-y-8">
            {PRIVACY_SECTIONS.map((section, index) => (
              <section
                key={section.title}
                aria-labelledby={`privacy-section-${index}`}
              >
                <h2
                  id={`privacy-section-${index}`}
                  className="mb-2 text-lg font-bold text-text-title md:text-xl"
                >
                  {index + 1}. {section.title}
                </h2>
                {section.blocks.map((block, blockIndex) => {
                  switch (block.type) {
                    case "paragraph":
                      return (
                        <p
                          key={blockIndex}
                          className="mb-3 leading-relaxed text-text-body-main last:mb-0"
                        >
                          {block.text}
                        </p>
                      );
                    case "list":
                      return (
                        <ul
                          key={blockIndex}
                          className="mb-3 list-inside list-disc space-y-1 pl-1 text-text-body-main last:mb-0"
                        >
                          {block.items.map((item) => (
                            <li key={item}>{item}</li>
                          ))}
                        </ul>
                      );
                    case "subheading":
                      return (
                        <h3
                          key={blockIndex}
                          className="mb-2 mt-4 text-base font-semibold text-text-title first:mt-0"
                        >
                          {block.text}
                        </h3>
                      );
                    case "code":
                      return (
                        <code
                          key={blockIndex}
                          className="mb-3 block break-all rounded-md bg-dashboard-border/40 px-3 py-2 text-sm text-text-body-main last:mb-0"
                        >
                          {block.text}
                        </code>
                      );
                    default:
                      return null;
                  }
                })}
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

export default PrivacyPolicyPage;
