import Demo from "./client/Demo";

export default function Home() {
	return (
		<main className="text-white h-screen w-screen">
			<div className="absolute top-1/3 left-1/2 translate-x-[-50%] translate-y-[-33.33%]">
				<h1 className="text-center pb-12 text-4xl font-gilroy font-medium text-white">Demo</h1>
				<Demo />
			</div>
		</main>
	);
}
