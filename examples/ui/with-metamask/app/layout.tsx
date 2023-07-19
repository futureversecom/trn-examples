import "@trne/ui-utils/globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
	title: "Using MetaMask to sign and send Extrinsic",
	description:
		"This example shows how to sign and send an Asset Transfer extrinsic with MetaMask and Next.js.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en">
			<body className={inter.className}>{children}</body>
		</html>
	);
}
