import React, { useRef, useState } from "react";
import { FaBold, FaItalic, FaUnderline, FaEye, FaLink } from "react-icons/fa";
import { VscNewline } from "react-icons/vsc";
import { HTMLFormattedText } from "./HTMLFormattedText";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  maxLength?: number;
  error?: string;
  label?: string;
  labelClassName?: string;
  errorClassName?: string;
  id?: string;
  showPreview?: boolean;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = "Enter text...",
  maxLength,
  error,
  label,
  labelClassName,
  errorClassName,
  id,
  showPreview = true,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  const insertMarkup = (startTag: string, endTag: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    
    const beforeText = value.substring(0, start);
    const afterText = value.substring(end);
    
    const newText = `${beforeText}${startTag}${selectedText}${endTag}${afterText}`;
    onChange(newText);

    // Set cursor position after the inserted markup
    setTimeout(() => {
      const newPosition = start + startTag.length + selectedText.length;
      textarea.focus({ preventScroll: true });
      textarea.setSelectionRange(newPosition, newPosition);
    }, 0);
  };

  const insertLineBreak = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const beforeText = value.substring(0, start);
    const afterText = value.substring(start);
    
    const newText = `${beforeText}*br*${afterText}`;
    onChange(newText);

    // Set cursor position after the break
    setTimeout(() => {
      const newPosition = start + 4; // length of *br*
      textarea.focus({ preventScroll: true });
      textarea.setSelectionRange(newPosition, newPosition);
    }, 0);
  };

  const insertLink = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end) || "Link text";
    
    const url = prompt("Enter the URL:", "https://");
    if (!url) return;

    const beforeText = value.substring(0, start);
    const afterText = value.substring(end);
    
    const newText = `${beforeText}*a href="${url}"*${selectedText}*/a*${afterText}`;
    onChange(newText);

    // Set cursor position after the link
    setTimeout(() => {
      const newPosition = start + `*a href="${url}"*${selectedText}*/a*`.length;
      textarea.focus({ preventScroll: true });
      textarea.setSelectionRange(newPosition, newPosition);
    }, 0);
  };

  const toolbarButtons = [
    {
      icon: <FaBold />,
      label: "Bold",
      action: () => insertMarkup("*b*", "*/b*"),
      shortcut: "Ctrl+B",
    },
    {
      icon: <FaItalic />,
      label: "Italic",
      action: () => insertMarkup("*i*", "*/i*"),
      shortcut: "Ctrl+I",
    },
    {
      icon: <FaUnderline />,
      label: "Underline",
      action: () => insertMarkup("*u*", "*/u*"),
      shortcut: "Ctrl+U",
    },
    {
      icon: <FaLink />,
      label: "Link",
      action: insertLink,
      shortcut: "Ctrl+L",
    },
    {
      icon: <VscNewline className="size-5"/>,
      label: "Line Break",
      action: insertLineBreak,
      shortcut: "Shift+Enter",
    },
  ];

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.ctrlKey || e.metaKey) {
      if (e.key === "b") {
        e.preventDefault();
        insertMarkup("*b*", "*/b*");
      } else if (e.key === "i") {
        e.preventDefault();
        insertMarkup("*i*", "*/i*");
      } else if (e.key === "u") {
        e.preventDefault();
        insertMarkup("*u*", "*/u*");
      } else if (e.key === "l") {
        e.preventDefault();
        insertLink();
      }
    } else if (e.shiftKey && e.key === "Enter") {
      e.preventDefault();
      insertLineBreak();
    }
  };

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={id}
          className={labelClassName || "text-sm font-medium text-gray-700 mb-1 block"}
        >
          {label}
        </label>
      )}
      
      <div
        className={`border rounded-lg overflow-hidden transition-colors ${
          isFocused
            ? "border-primary"
            : error
            ? "border-red-500"
            : "border-gray-400"
        }`}
      >
        {/* Toolbar */}
        <div className="bg-gray-50 border-b border-gray-400 px-3 py-1 flex items-center gap-4">
          {toolbarButtons.map((button, index) => (
            <button
              key={index}
              type="button"
              onClick={button.action}
              title={`${button.label} (${button.shortcut})`}
              className="text-xs md:text-sm cursor-pointer transition-colors text-gray-700 hover:text-primary flex items-center justify-center"
              disabled={isPreviewMode}
            >
              {button.icon}
            </button>
          ))}
          
          {showPreview && (
            <>
              <div className="w-px h-6 bg-gray-300 -mx-1" />
              <button
                type="button"
                onClick={() => setIsPreviewMode(!isPreviewMode)}
                title="Toggle Preview"
                className={`rounded transition-colors cursor-pointer hover:text-primary flex items-center justify-center ${
                  isPreviewMode ? "text-primary" : "text-gray-700"
                }`}
              >
                <FaEye />
              </button>
            </>
          )}
          
          <div className="ml-auto text-xs text-gray-500">
            {maxLength && `${value.length}/${maxLength}`}
          </div>
        </div>

        {/* Textarea or Preview */}
        {isPreviewMode ? (
          <div className="w-full px-3 py-2 min-h-[150px] text-sm bg-gray-50">
            <div className="prose prose-sm max-w-none">
              <HTMLFormattedText content={value} />
            </div>
            {!value && (
              <p className="text-gray-400 italic">{placeholder}</p>
            )}
          </div>
        ) : (
          <textarea
            ref={textareaRef}
            id={id}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={placeholder}
            maxLength={maxLength}
            className="w-full px-3 py-2 resize-none outline-none min-h-[150px] text-sm"
            rows={6}
          />
        )}
      </div>

      {error && (
        <p className={`text-xs text-red-500 mt-1 ${errorClassName || ""}`}>
          {error}
        </p>
      )}
    </div>
  );
};
