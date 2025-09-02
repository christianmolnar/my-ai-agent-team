"use client";

import { useState, useEffect } from "react";

export default function VinylInfoPage() {
  const [artist, setArtist] = useState("");
  const [album, setAlbum] = useState("");
  const [catalogNumber, setCatalogNumber] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.body.style.background =
      "linear-gradient(135deg, #181a1b 0%, #232526 100%)";
    document.body.style.color = "#f3f3f3";
    document.body.style.fontFamily = "Segoe UI, Arial, sans-serif";
    return () => {
      document.body.style.background = "";
      document.body.style.color = "";
      document.body.style.fontFamily = "";
    };
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    const res = await fetch("/api/vinyl", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ artist, album, catalogNumber }),
    });
    const data = await res.json();
    setResult(data);
    setLoading(false);
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100vw",
        background: "linear-gradient(135deg, #181a1b 0%, #232526 100%)",
        color: "#f3f3f3",
        fontFamily: "Segoe UI, Arial, sans-serif",
        padding: 0,
        margin: 0,
      }}
    >
      <main
        style={{
          maxWidth: 600,
          margin: "0 auto",
          padding: 32,
          background: "rgba(34, 40, 49, 0.98)",
          borderRadius: 16,
          boxShadow: "0 8px 32px rgba(0,0,0,0.25)",
          minHeight: 600,
        }}
      >
        <h1
          style={{
            textAlign: "center",
            color: "#ffb347",
            letterSpacing: 1,
          }}
        >
          Vinyl Record Info Lookup
        </h1>
        <form
          onSubmit={handleSubmit}
          style={{
            marginBottom: 32,
            display: "flex",
            flexDirection: "column",
            gap: 16,
          }}
        >
          <input
            type="text"
            placeholder="Artist"
            value={artist}
            onChange={(e) => setArtist(e.target.value)}
            style={{
              padding: 10,
              borderRadius: 6,
              border: "1px solid #888",
              background: "#232526",
              color: "#f3f3f3",
              fontSize: 16,
            }}
          />
          <input
            type="text"
            placeholder="Album"
            value={album}
            onChange={(e) => setAlbum(e.target.value)}
            style={{
              padding: 10,
              borderRadius: 6,
              border: "1px solid #888",
              background: "#232526",
              color: "#f3f3f3",
              fontSize: 16,
            }}
          />
          <input
            type="text"
            placeholder="Catalog Number (optional)"
            value={catalogNumber}
            onChange={(e) => setCatalogNumber(e.target.value)}
            style={{
              padding: 10,
              borderRadius: 6,
              border: "1px solid #888",
              background: "#232526",
              color: "#f3f3f3",
              fontSize: 16,
            }}
          />
          <button
            type="submit"
            disabled={loading || (!artist && !album && !catalogNumber)}
            style={{
              padding: "12px 0",
              borderRadius: 6,
              border: "none",
              background:
                "linear-gradient(90deg, #ffb347 0%, #ffcc33 100%)",
              color: "#232526",
              fontWeight: 700,
              fontSize: 18,
              cursor: loading ? "not-allowed" : "pointer",
              boxShadow: "0 2px 8px rgba(0,0,0,0.10)",
            }}
          >
            {loading ? "Searching..." : "Search"}
          </button>
        </form>
        {loading && (
          <div style={{ textAlign: "center", color: "#ffb347" }}>Searching...</div>
        )}
        {result && result.error && (
          <div
            style={{
              color: "#ff6f61",
              textAlign: "center",
              fontWeight: 600,
            }}
          >
            {result.error}
          </div>
        )}
        {result && !result.error && (
          <div
            style={{
              background: "rgba(44, 62, 80, 0.98)",
              borderRadius: 12,
              padding: 24,
              marginTop: 16,
              boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
            }}
          >
            <h2
              style={{
                color: "#ffb347",
                marginBottom: 12,
              }}
            >
              {result.artist} – {result.album}
            </h2>
            {result.coverImage && (
              <img
                src={result.coverImage}
                alt="cover"
                style={{
                  maxWidth: 220,
                  marginBottom: 18,
                  borderRadius: 10,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.18)",
                }}
              />
            )}
            <div>
              <strong>Catalog #:</strong> {result.catalogNumber}
            </div>
            <div>
              <strong>Label:</strong> {result.label}
            </div>
            <div>
              <strong>Country:</strong> {result.country}
            </div>
            <div>
              <strong>Format:</strong> {result.format}
            </div>
            <div>
              <strong>Pressing Date:</strong> {result.pressingDate}
            </div>
            {result.notes && (
              <div style={{ marginTop: 8 }}>
                <strong>Notes:</strong> {result.notes}
              </div>
            )}
            <div style={{ marginTop: 18 }}>
              <strong>Price Guide:</strong>
              <ul style={{ margin: "8px 0 0 0", paddingLeft: 24 }}>
                {Object.entries(result.priceGuide || {}).map(
                  ([cond, val]: any) => (
                    <li key={cond} style={{ marginBottom: 2 }}>
                      <strong>{cond}:</strong> {val.value ? `$${val.value}` : val}
                    </li>
                  )
                )}
              </ul>
            </div>
            {/* Other Price Sources section, improved formatting */}
            <div style={{ marginTop: 22 }}>
              <strong>Other Price Sources:</strong>
              <ul
                style={{
                  listStyle: "disc",
                  paddingLeft: 20,
                  marginTop: 8,
                  marginBottom: 0,
                }}
              >
                {(result.extraPriceSources || []).map((src: any) => (
                  <li
                    key={src.name}
                    style={{
                      marginBottom: 8,
                      background: "#232526",
                      borderRadius: 6,
                      padding: "8px 16px",
                      color: "#ffcc33",
                      fontWeight: 500,
                      boxShadow: "0 1px 4px rgba(0,0,0,0.10)",
                      transition: "background 0.2s",
                      display: "block",
                      maxWidth: 320,
                      marginLeft: 0,
                    }}
                  >
                    <a
                      href={src.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        color: "#ffcc33",
                        textDecoration: "underline",
                        fontWeight: 600,
                      }}
                    >
                      {src.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            {/* Discogs Details Section styled to match dark theme */}
            {result.discogsDetails && (
              <div
                style={{
                  marginTop: 24,
                  background: "#232526",
                  borderRadius: 8,
                  padding: 16,
                  color: "#f3f3f3",
                }}
              >
                <h3 style={{ color: "#ffb347" }}>Discogs Details</h3>
                <div>
                  <strong>Year:</strong> {result.discogsDetails.year}
                </div>
                <div>
                  <strong>Country:</strong> {result.discogsDetails.country}
                </div>
                <div>
                  <strong>Label:</strong> {result.discogsDetails.label}
                </div>
                <div>
                  <strong>Catalog #:</strong> {result.discogsDetails.catalogNumber}
                </div>
                <div>
                  <strong>Format:</strong> {result.discogsDetails.format}
                </div>
                <div>
                  <strong>Genres:</strong>{" "}
                  {(result.discogsDetails.genres || []).join(", ")}
                </div>
                <div>
                  <strong>Styles:</strong>{" "}
                  {(result.discogsDetails.styles || []).join(", ")}
                </div>
                {result.discogsDetails.images &&
                  result.discogsDetails.images.length > 0 && (
                    <div style={{ marginTop: 8 }}>
                      <strong>Images:</strong>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                        {result.discogsDetails.images.map(
                          (img: string, i: number) => (
                            <img
                              key={i}
                              src={img}
                              alt="release"
                              style={{
                                maxWidth: 120,
                                maxHeight: 120,
                                borderRadius: 4,
                              }}
                            />
                          )
                        )}
                      </div>
                    </div>
                  )}
                {result.discogsDetails.tracklist && (
                  <div style={{ marginTop: 8 }}>
                    <strong>Tracklist:</strong>
                    <ul style={{ columns: 2, color: "#f3f3f3" }}>
                      {result.discogsDetails.tracklist.map((t: any, i: number) => (
                        <li key={i}>
                          {t.position} {t.title} {t.duration && `(${t.duration})`}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {result.discogsDetails.notes && (
                  <div style={{ marginTop: 8 }}>
                    <strong>Notes:</strong> {result.discogsDetails.notes}
                  </div>
                )}
                {result.discogsDetails.lowestPrice && (
                  <div style={{ marginTop: 8 }}>
                    <strong>Lowest Price for Sale:</strong> ${result.discogsDetails.lowestPrice}
                  </div>
                )}
                {result.discogsDetails.numForSale && (
                  <div style={{ marginTop: 8 }}>
                    <strong>Copies for Sale:</strong> {result.discogsDetails.numForSale}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
