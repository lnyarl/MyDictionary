import { useEffect, useState } from "react";
import "./index.css";

export default function Selector({
  text,
  options,
  onSelection,
}: {
  text: string;
  options: { id: string; text: string }[];
  onSelection: ({ id, text }: { id: string; text: string }) => any;
}) {
  const t = text.substring(2).toLowerCase().replace(/\]*/g, "");
  const nomalizedOptions = options?.filter((o) => {
    return o.text.toLowerCase().includes(t) || t === "";
  });

  const [activeOptionID, setActiveOptionID] = useState<string | undefined>("a");

  useEffect(() => {
    const res = nomalizedOptions.find((o) => o.id === activeOptionID);
    if (!res) {
      if (nomalizedOptions.length === 0) {
        setActiveOptionID(undefined);
      } else {
        setActiveOptionID(nomalizedOptions[0].id);
      }
    }
  }, [nomalizedOptions, activeOptionID]);

  return (
    <div className="suggestion-container">
      {nomalizedOptions.map((o) => (
        <div
          className={
            activeOptionID === o.id ? "active-option suggestion-option" : "suggestion-option"
          }
          key={o.id}
          onKeyDownCapture={(ev) => {
            if (ev.key === "ArrowDown") {
              ev.preventDefault();
              const index = options.findIndex((e) => e.id === activeOptionID);
              if (index > -1 && options.length > index + 1) {
                setActiveOptionID(options[index + 1].id);
              }
            } else if (ev.key === "ArrowUp") {
              ev.preventDefault();
              const index = options.findIndex((e) => e.id === activeOptionID);
              if (index > 0) {
                setActiveOptionID(options[index - 1].id);
              }
            } else if (ev.key === "Enter" || ev.key === "Tab") {
              onSelection(o);
            }
          }}
        >
          {o.text}
        </div>
      ))}
    </div>
  );
}
