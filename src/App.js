import MainNavbar from "./components/MainNavbar";
import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Community, Profile, Dashboard, Test } from "./pages/index";
import { useState } from "react";
import Calendar from "./pages/Calendar";

const App = () => {
	const [savedUserLoginData] = useState(() => {
		const storedUser = localStorage.getItem("user");
		return storedUser ? JSON.parse(storedUser) : null;
	});

    // Protected route wrapper
    const PrivateRoute = ({ children }) => {
        return savedUserLoginData ? children : <Navigate to="/" replace />;
    };

	const Layout = ({ children }) => (
		<div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
			<MainNavbar savedUserLoginData={savedUserLoginData} />
			<main style={{ flexGrow: 1 }}>
				{children}
			</main>
		</div>
	);

	return (
		<Router>
			<Layout>
				<Routes>
					<Route path="/" element={savedUserLoginData ? <Dashboard savedUserLoginData={savedUserLoginData} key="in" /> : <Community key="out" />} />
					<Route path="/community" element={<Community />} />
					<Route path="/dashboard" element={<PrivateRoute><Dashboard savedUserLoginData={savedUserLoginData} /></PrivateRoute>} />
					<Route path="/profile" element={<PrivateRoute><Profile savedUserLoginData={savedUserLoginData} /></PrivateRoute>} />
					<Route path="/calendar" element={<PrivateRoute><Calendar savedUserLoginData={savedUserLoginData} /></PrivateRoute>} />
					<Route path="/test" element={<Test />} />
					<Route path="*" element={<h1>404 Not Found</h1>} />
				</Routes>
			</Layout>
		</Router>
	);
}

export default App;
