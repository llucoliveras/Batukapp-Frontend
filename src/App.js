import MainNavbar from "./components/MainNavbar";
import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Community, Profile, Dashboard, Test } from "./pages/index";
import { useEffect, useState } from "react";

const App = () => {
	const [user, setUser] = useState(null);

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);

    // Protected route wrapper
    const PrivateRoute = ({ children }) => {
        return user ? children : <Navigate to="/" replace />;
    };

	return (
		<Router>
			<MainNavbar></MainNavbar>
			<Routes>
				<Route path="/" element={user ? <Dashboard /> : <Community />} />
				<Route path="/community" element={<Community />} />
				<Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
				<Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
				<Route path="/test" element={<Test />} />
				<Route path="*" element={<h1>404 Not Found</h1>} />
			</Routes>
		</Router>
	);
}

export default App;
