import DOMPurify from "dompurify";
import parse, { domToReact, Element } from "html-react-parser";

type RenderHtmlProps = {
  content: string;
  className?: string;
};

export function HTMLText({ content, className }: RenderHtmlProps) {
  if (!content) return null;

  const decodeHtmlEntities = (str: string) => {
    const txt = document.createElement("textarea");
    txt.innerHTML = str;
    return txt.value;
  };

  const decoded = /&lt;|&gt;|&amp;/.test(content)
    ? decodeHtmlEntities(content)
    : content;

  const safeHtml = DOMPurify.sanitize(decoded, {
    ALLOWED_TAGS: [
      "b",
      "strong",
      "i",
      "em",
      "br",
      "p",
      "ul",
      "ol",
      "li",
      "a",
      "u",
    ],
    ALLOWED_ATTR: ["href", "target", "rel"],
  });

  const reactNodes = parse(safeHtml, {
    replace: (domNode) => {
      if (domNode instanceof Element && domNode.name === "a") {
        const props = domNode.attribs || {};
        
        let childContent = null;
        if (domNode.children && domNode.children.length === 1 && domNode.children[0].type === "text") {
           const textData = (domNode.children[0] as any).data;
           if (textData && textData.length > 40) {
               childContent = textData.substring(0, 40) + "...";
           }
        }

        return (
          <a
            href={props.href}
            target={props.target || "_blank"}
            rel={props.rel || "noopener noreferrer"}
            className={` ${
              className || "underline text-primary font-semibold"
            }`}
          >
            {childContent ? childContent : domToReact(
              domNode.children as import("html-react-parser").DOMNode[]
            )}
          </a>
        );
      }

      if (domNode.type === "text") {
        const textNode = domNode as any;
        const text = textNode.data;
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        
        if (text && urlRegex.test(text)) {
          const parts = text.split(urlRegex);
          return (
            <>
              {parts.map((part: string, i: number) => {
                if (part.match(/^https?:\/\//)) {
                  const maxLength = 40;
                  const display =
                    part.length > maxLength
                      ? part.substring(0, maxLength) + "..."
                      : part;
                  return (
                    <a
                      key={i}
                      href={part}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={` ${
                        className || "underline text-primary font-semibold"
                      }`}
                    >
                      {display}
                    </a>
                  );
                }
                return part;
              })}
            </>
          );
        }
      }
      return undefined;
    },
  });

  return <>{reactNodes}</>;
}
