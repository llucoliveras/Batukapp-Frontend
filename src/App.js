import MainNavbar from "./components/MainNavbar";
import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Community from "./pages/Community";
import Profile from "./pages/Profile";

const App = () => {
	return (
		<Router>
			<MainNavbar></MainNavbar>
			<Routes>
				<Route path="/" element={<Community/>} />
				<Route path="/about" element={<h1>About Page</h1>} />
				<Route path="/contact" element={<h1>Contact Page</h1>} />
				<Route path="/settings" element={<h1>Settings Page</h1>} />
				<Route path="/profile" element={<Profile />} />
				<Route path="*" element={<h1>404 Not Found</h1>} />
			</Routes>
		</Router>
	);
}

export default App;
