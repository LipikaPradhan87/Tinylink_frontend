import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getLink, clickLink } from "../api"; // import clickLink

export default function StatsPage() {
  const { code } = useParams();
  const [link, setLink] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function load() {
      try {
        const data = await getLink(code);
        setLink(data);
      } catch (err) {
        console.error(err);
      }
    }
    load();
  }, [code]);

  if (!link) return <div>Loading…</div>;

  const handleClick = async (e) => {
    e.preventDefault(); 
    try {
      const updated = await clickLink(link.code);
      setLink(updated); // update stats
      window.open(link.target, "_blank"); // then open the target
    } catch (err) {
      console.error(err);
      alert("Failed to open link");
    }
  };

  return (
    <div className="p-4">
      <button
        className="mb-4 text-blue-600 flex items-center gap-1"
        onClick={() => navigate("/")}>
        ← Back
      </button>

      <h1 className="text-2xl font-semibold mb-4">Stats for {link.code}</h1>
      <p>
        <strong>Target URL:</strong>{" "}
        <a href={link.target} target="_blank" className="text-blue-600" onClick={handleClick}>
          {link.target}
        </a>
      </p>
      <p><strong>Clicks:</strong> {link.clicks}</p>
      <p>
        <strong>Last Clicked:</strong>{" "}
        {link.last_clicked
          ? new Date(link.last_clicked).toLocaleString("en-IN", {
              timeZone: "Asia/Kolkata",
              hour12: true,
            })
          : "-"}
      </p>
      <p>
        <strong>Created At:</strong>{" "}
        {link.created_at
          ? new Date(link.created_at).toLocaleString("en-IN", {
              timeZone: "Asia/Kolkata",
              hour12: true,
            })
          : "-"}
      </p>
    </div>
  );
}
