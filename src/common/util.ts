import type { JWTClaims } from "./types.js";

export function getUsername() {
	const jwt = localStorage.getItem("auth");
	if (!jwt) return null;
	const encoded = jwt?.split(".")[1];
	if (!encoded) return null;
	return (JSON.parse(window.atob(encoded)) as JWTClaims).username;
}
