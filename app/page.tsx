"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import axios from "axios";

// I'll use the real agent list from Agent_Abilities_Library.md
const workAgents = [
	{
		name: "Image Generator",
		description: "Generate photorealistic images from prompts or reference images.",
		href: "/image-generator",
		icon: "🖼️",
		enabled: true,
	},
	{
		name: "Career Development Agent",
		description: "Resume writing, interview prep, branding, portfolio support.",
		href: "#",
		icon: "💼",
		enabled: false,
	},
	{
		name: "Communications Agent",
		description: "Email, meetings, business writing, proposals.",
		href: "/communications",
		icon: "✉️",
		enabled: true,
	},
	{
		name: "Growth & Feedback Agent",
		description: "Annual reviews, performance check-ins, feedback.",
		href: "#",
		icon: "📈",
		enabled: false,
	},
	{
		name: "Fact Checker",
		description: "Research for all agents, research papers, info gathering.",
		href: "/fact-checker",
		icon: "🕵️",
		enabled: true,
	},
	{
		name: "Full Stack Developer",
		description: "Coding, automation, technical projects.",
		href: "#",
		icon: "💻",
		enabled: false,
	},
	{
		name: "Data Scientist",
		description: "Data analysis, reporting, visualization.",
		href: "#",
		icon: "📊",
		enabled: false,
	},
	{
		name: "Security & Compliance",
		description: "Security, privacy, compliance checks.",
		href: "#",
		icon: "🔒",
		enabled: false,
	},
	{
		name: "Technical Program Manager",
		description: "Specs, project planning, requirements, coordination.",
		href: "#",
		icon: "🗂️",
		enabled: false,
	},
	{
		name: "Business & Planning",
		description: "Planning cycles, OKRs, business reviews.",
		href: "#",
		icon: "📅",
		enabled: false,
	},
];
const personalAgents = [
	{
		name: "Vinyl Researcher",
		description: "Lookup vinyl record info, prices, and metadata.",
		href: "/vinyl-info-page",
		icon: "💿",
		enabled: true,
	},
	{
		name: "Memorias-AI",
		description: "Record and transcribe stories in Argentine Spanish accent.",
		href: "/memorias-ai",
		icon: "🎙️",
		enabled: true,
	},
	{
		name: "Small Business Advisor",
		description: "Business planning, strategy, and growth guidance for small businesses.",
		href: "#",
		icon: "🏢",
		enabled: false,
	},
	{
		name: "Retirement Planner",
		description: "Personal finance, retirement planning.",
		href: "#",
		icon: "🏦",
		enabled: false,
	},
	{
		name: "f.insight.AI",
		description: "Autonomous trading agent with AI-driven analysis and risk management.",
		href: "/f-insight-ai",
		icon: "📈",
		enabled: true,
	},
	{
		name: "Health & Nutrition Coach",
		description: "Health, wellness, nutrition.",
		href: "#",
		icon: "🥗",
		enabled: false,
	},
	{
		name: "Music Coach",
		description: "Music learning, practice, and coaching.",
		href: "#",
		icon: "🎵",
		enabled: false,
	},
];

interface FactCheckResult {
	decision: string;
	sources: {
		for: { title: string; link: string }[];
		against: { title: string; link: string }[];
		inconclusive: { title: string; link: string }[];
	};
}

export default function MissionControl() {
	const [query, setQuery] = useState("");
	const [result, setResult] = useState<FactCheckResult | null>(null);

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

	const handleFactCheck = async () => {
		try {
			const response = await axios.get(`/api/rss-test`, { params: { query } });
			setResult(response.data);
		} catch (error) {
			console.error("Error fetching fact-check result:", error);
		}
	};

	return (
		<>
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
						maxWidth: 700,
						margin: "0 auto",
						padding: 40,
						background: "rgba(34, 40, 49, 0.98)",
						borderRadius: 20,
						boxShadow: "0 8px 32px rgba(0,0,0,0.25)",
						minHeight: 600,
					}}
				>
					<h1
						style={{
							textAlign: "center",
							color: "#ffb347",
							letterSpacing: 1,
							fontSize: 36,
							marginBottom: 8,
						}}
					>
						AI Advisor Team Mission Control
					</h1>
					<p
						style={{
							textAlign: "center",
							color: "#ccc",
							marginBottom: 40,
						}}
					>
						Choose an agent to get started...
					</p>
					<div
						style={{
							display: "flex",
							gap: 32,
							justifyContent: "center",
						}}
					>
						{/* Work Agents (left) */}
						<div style={{ minWidth: 260, flex: 1 }}>
							<h2
								style={{
									color: "#ffb347",
									fontSize: 20,
									marginBottom: 16,
									textAlign: "center",
									letterSpacing: 1,
								}}
							>
								Work Agents
							</h2>
							<div
								style={{
									display: "flex",
									flexDirection: "column",
									gap: 16,
								}}
							>
								{/* Enabled agents */}
								{workAgents.filter((a) => a.enabled).map((agent) => (
									<Link
										key={agent.name}
										href={agent.href}
										style={{
											display: "flex",
											alignItems: "center",
											gap: 12,
											background: "#232526",
											borderRadius: 10,
											padding: "14px 18px",
											color: "#f3f3f3",
											fontWeight: 600,
											fontSize: 17,
											border: "1px solid #444",
											textDecoration: "none",
											transition: "background 0.15s, box-shadow 0.15s",
											boxShadow: "0 2px 8px rgba(0,0,0,0.10)",
											cursor: "pointer",
										}}
										onMouseOver={(e) => {
											(e.currentTarget as HTMLElement).style.background =
												"#2d3136";
										}}
										onMouseOut={(e) => {
											(e.currentTarget as HTMLElement).style.background =
												"#232526";
										}}
									>
										<span style={{ fontSize: 28 }}>{agent.icon}</span>
										<span>{agent.name}</span>
									</Link>
								))}
							</div>
						</div>
						{/* Personal Agents (right) */}
						<div style={{ minWidth: 260, flex: 1 }}>
							<h2
								style={{
									color: "#ffb347",
									fontSize: 20,
									marginBottom: 16,
									textAlign: "center",
									letterSpacing: 1,
								}}
							>
								Personal Agents
							</h2>
							<div
								style={{
									display: "flex",
									flexDirection: "column",
									gap: 16,
								}}
							>
								{/* Enabled agents */}
								{personalAgents.filter((a) => a.enabled).map((agent) => (
									<Link
									key={agent.name}
										href={agent.href}
										style={{
											display: "flex",
											alignItems: "center",
											gap: 12,
											background: "#232526",
											borderRadius: 10,
											padding: "14px 18px",
											color: "#f3f3f3",
											fontWeight: 600,
											fontSize: 17,
											border: "1px solid #444",
											textDecoration: "none",
											transition: "background 0.15s, box-shadow 0.15s",
											boxShadow: "0 2px 8px rgba(0,0,0,0.10)",
											cursor: "pointer",
										}}
										onMouseOver={(e) => {
											(e.currentTarget as HTMLElement).style.background =
												"#2d3136";
										}}
										onMouseOut={(e) => {
											(e.currentTarget as HTMLElement).style.background =
												"#232526";
										}}
									>
										<span style={{ fontSize: 28 }}>{agent.icon}</span>
										<span>{agent.name}</span>
									</Link>
								))}
							</div>
						</div>
					</div>
					{/* Unified Coming Soon Divider */}
					{(workAgents.some((a) => !a.enabled) ||
						personalAgents.some((a) => !a.enabled)) && (
						<div
							style={{
								display: "flex",
								alignItems: "center",
								margin: "32px 0 18px 0",
							}}
						>
							<hr
								style={{
									flex: 1,
									border: 0,
									borderTop: "2.5px solid #ffb347",
									margin: 0,
								}}
							/>
							<span
								style={{
									color: "#ffb347",
									fontWeight: 700,
									padding: "0 18px",
									fontSize: 17,
									letterSpacing: 1,
								}}
							>
								Coming Soon
							</span>
							<hr
								style={{
									flex: 1,
									border: 0,
									borderTop: "2.5px solid #ffb347",
									margin: 0,
								}}
							/>
						</div>
					)}
					{/* Disabled agents, side by side */}
					{(workAgents.filter((a) => !a.enabled).length > 0 ||
						personalAgents.filter((a) => !a.enabled).length > 0) && (
						<div style={{ display: "flex", gap: 32, justifyContent: "center" }}>
							<div style={{ minWidth: 260, flex: 1 }}>
								<div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
									{workAgents.filter((a) => !a.enabled).map((agent) => (
										<div
											key={agent.name}
											style={{
												display: "flex",
												alignItems: "center",
												gap: 12,
												background: "#181a1b",
												borderRadius: 10,
												padding: "14px 18px",
												color: "#888",
												fontWeight: 600,
												fontSize: 17,
												border: "1px solid #333",
												textDecoration: "none",
												cursor: "not-allowed",
												opacity: 0.7,
											}}
										>
											<span style={{ fontSize: 28 }}>{agent.icon}</span>
											<span>{agent.name}</span>
										</div>
									))}
								</div>
							</div>
							<div style={{ minWidth: 260, flex: 1 }}>
								<div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
									{personalAgents.filter((a) => !a.enabled).map((agent) => (
										<div
											key={agent.name}
											style={{
												display: "flex",
												alignItems: "center",
												gap: 12,
												background: "#181a1b",
												borderRadius: 10,
												padding: "14px 18px",
												color: "#888",
												fontWeight: 600,
												fontSize: 17,
												border: "1px solid #333",
												textDecoration: "none",
												cursor: "not-allowed",
												opacity: 0.7,
											}}
										>
											<span style={{ fontSize: 28 }}>{agent.icon}</span>
											<span>{agent.name}</span>
										</div>
									))}
								</div>
							</div>
						</div>
					)}
					{/* Fact-Checking Tool Section */}
					<div style={{ marginTop: 40 }}>
						<h2
							style={{
								color: "#ffb347",
								fontSize: 20,
								marginBottom: 16,
								textAlign: "center",
							}}
						>
							Fact-Checking Tool
						</h2>
						<div style={{ textAlign: "center", marginBottom: 20 }}>
							<input
								type="text"
								placeholder="Enter a fact-check query..."
								value={query}
								onChange={(e) => setQuery(e.target.value)}
								style={{
									padding: 10,
									width: "80%",
									borderRadius: 5,
									border: "1px solid #ccc",
								}}
							/>
							<button
								onClick={handleFactCheck}
								style={{
									marginLeft: 10,
									padding: "10px 20px",
									borderRadius: 5,
									background: "#ffb347",
									color: "#fff",
									border: "none",
									cursor: "pointer",
								}}
							>
								Check
							</button>
						</div>
						{result && (
							<div
								style={{
									background: "#232526",
									padding: 20,
									borderRadius: 10,
									color: "#f3f3f3",
								}}
							>
								<h3>Decision: {result.decision}</h3>
								<div>
									<h4>For:</h4>
									<ul>
										{result.sources.for.map((article, index) => (
											<li key={index}>
												<a
													href={article.link}
													target="_blank"
													rel="noopener noreferrer"
													style={{ color: "#ffb347" }}
												>
													{article.title}
												</a>
											</li>
										))}
									</ul>
								</div>
								<div>
									<h4>Against:</h4>
									<ul>
										{result.sources.against.map((article, index) => (
											<li key={index}>
												<a
													href={article.link}
													target="_blank"
													rel="noopener noreferrer"
													style={{ color: "#ffb347" }}
												>
													{article.title}
												</a>
											</li>
										))}
									</ul>
								</div>
								<div>
									<h4>Inconclusive:</h4>
									<ul>
										{result.sources.inconclusive.map((article, index) => (
											<li key={index}>
												<a
													href={article.link}
													target="_blank"
													rel="noopener noreferrer"
													style={{ color: "#ffb347" }}
												>
													{article.title}
												</a>
											</li>
										))}
									</ul>
								</div>
							</div>
						)}
					</div>
				</main>
			</div>
		</>
	);
}
