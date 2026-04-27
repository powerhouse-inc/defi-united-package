import { useCallback, useState } from "react";

interface CollapsibleSectionProps {
  title: string;
  children: React.ReactNode;
  isExpanded?: boolean;
  isCollapsedByDefault?: boolean;
}

export function CollapsibleSection({
  title,
  children,
  isExpanded = true,
  isCollapsedByDefault = false,
}: CollapsibleSectionProps) {
  const [expanded, setExpanded] = useState(isExpanded && !isCollapsedByDefault);

  const toggle = useCallback(() => {
    setExpanded((prev) => !prev);
  }, []);

  return (
    <section
      className={`defi-united-ops__collapsible${expanded ? " defi-united-ops__collapsible--expanded" : ""}`}
    >
      <button
        className="defi-united-ops__collapsible-toggle"
        type="button"
        onClick={toggle}
        aria-expanded={expanded}
      >
        <span
          className="defi-united-ops__collapsible-chevron"
          aria-hidden="true"
        >
          {expanded ? "▼" : "▶"}
        </span>
        <span className="defi-united-ops__collapsible-title">{title}</span>
      </button>

      {expanded ? (
        <div className="defi-united-ops__collapsible-body">{children}</div>
      ) : null}

      <style>{`
        .defi-united-ops__collapsible {
          background: #ffffff;
          border: 1px solid #e6e8ec;
          border-radius: 12px;
          box-shadow: 0 1px 2px rgba(15, 17, 21, 0.04);
          overflow: hidden;
        }
        .defi-united-ops__collapsible-toggle {
          display: flex;
          align-items: center;
          gap: 8px;
          width: 100%;
          padding: 14px 18px;
          background: none;
          border: none;
          cursor: pointer;
          text-align: left;
        }
        .defi-united-ops__collapsible-toggle:hover {
          background-color: #f7f8fa;
        }
        .defi-united-ops__collapsible-toggle:focus {
          outline: 2px solid #1a4dd6;
          outline-offset: -2px;
        }
        .defi-united-ops__collapsible-chevron {
          font-size: 10px;
          color: #9aa1ad;
          line-height: 1;
          flex-shrink: 0;
          transition: color 120ms ease;
        }
        .defi-united-ops__collapsible-toggle:hover .defi-united-ops__collapsible-chevron {
          color: #525a6b;
        }
        .defi-united-ops__collapsible-title {
          font-size: 13px;
          font-weight: 600;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          color: #525a6b;
        }
        .defi-united-ops__collapsible-body {
          padding: 0 18px 16px 18px;
        }
      `}</style>
    </section>
  );
}
