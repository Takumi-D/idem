import { useState, useRef, useEffect } from "react";
import getCaretCoordinates from "textarea-caret";

const USERS = [
    { id: 1, username: "ivanov", name: "Иван Иванов" },
    { id: 2, username: "petrov", name: "Петр Петров" },
    { id: 3, username: "alex", name: "Алексей Смирнов" },
    { id: 4, username: "sergey", name: "Сергей Сергеев" }
];

export default function DropDownTextarea() {
    const textareaRef = useRef(null);

    const [text, setText] = useState("");
    const [textQuery, setTextQuery] = useState("");
    const [dropdownVisible, setDropdownVisible] = useState(false);
    const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });

    const filteredUsers = USERS.filter((user) => {
        const q = textQuery.toLowerCase();
        return user.username.toLowerCase().includes(q) || user.name.toLowerCase().includes(q);
    });

    const handleTextChange = (e) => {
        const newText = e.target.value;
        const cursorPosition = e.target.selectionStart;
        setText(newText);

        const textBeforeCursor = newText.slice(0, cursorPosition);
        const match = textBeforeCursor.match(/@(\w*)$/);

        if (match) {
            setTextQuery(match[1]);
            setDropdownVisible(true);

            if (!textareaRef.current) return;

            const caret = getCaretCoordinates(textareaRef.current, cursorPosition);
            const rect = textareaRef.current.getBoundingClientRect();

            setDropdownPosition({
                top: rect.top + caret.top - textareaRef.current.scrollTop + window.scrollY + 2,
                left: rect.left + caret.left + window.scrollX
            });
        } else {
            setDropdownVisible(false);
        }
    };

    const selectUser = (user) => {
        if (!textareaRef.current) return;

        const cursor = textareaRef.current.selectionStart;
        const beforeCursor = text.slice(0, cursor).replace(/@\w*$/, "");
        const afterCursor = text.slice(cursor);

        const newText = `${beforeCursor}@${user.username} ${afterCursor}`;
        setText(newText);
        setDropdownVisible(false);

        requestAnimationFrame(() => {
            const newCursorPos = beforeCursor.length + user.username.length + 2;
            textareaRef.current.focus();
            textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
        });
    };

    const handleKeyDown = (e) => {
        if (e.key === "Escape") {
            setDropdownVisible(false);
        }
    };

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (textareaRef.current && !textareaRef.current.contains(e.target)) {
                setDropdownVisible(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <>
      <textarea
          ref={textareaRef}
          value={text}
          onChange={handleTextChange}
          onKeyDown={handleKeyDown}
          rows={6}
          placeholder="Напишите текст c @"
          style={{
              width: "100%",
              padding: "10px",
              fontSize: "14px",
              lineHeight: "1.45",
              borderRadius: "6px",
              border: "1px solid #d0d0d0",
              resize: "vertical"
          }}
      />

            {dropdownVisible && filteredUsers.length > 0 && (
                <div
                    style={{
                        position: "absolute",
                        top: dropdownPosition.top,
                        left: dropdownPosition.left,
                        background: "white",
                        border: "1px solid #ddd",
                        borderRadius: "6px",
                        width: "220px",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                        zIndex: 9999
                    }}
                >
                    {filteredUsers.map((user) => (
                        <div
                            key={user.id}
                            onMouseDown={() => selectUser(user)}
                            style={{
                                padding: "8px 10px",
                                cursor: "pointer",
                                borderBottom: "1px solid #f0f0f0"
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.background = "#f5faff")}
                            onMouseLeave={(e) => (e.currentTarget.style.background = "white")}
                        >
                            <span style={{ fontWeight: 500 }}>{user.name}</span>
                            <span style={{ color: "#777", marginLeft: "8px" }}>@{user.username}</span>
                        </div>
                    ))}
                </div>
            )}
        </>
    );
}