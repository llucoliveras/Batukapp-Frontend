import { Container, Nav, Navbar, NavDropdown, Image } from 'react-bootstrap';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import { useState } from 'react';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const MainNavbar = ({ savedUserLoginData }) => {
    const [userData, setUserData] = useState(savedUserLoginData ?? null);
    const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (credentialResponse) => {
        const user = jwtDecode(credentialResponse.credential);
        const response = await fetch("http://localhost:4000/users", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify({
                email: user.email,
                name: user.name,
                profile_picture: user.picture
            })
        })

        const data = await response.json();
        if (data && data.iduser) {
            let parsedData = {
                email: user.email,
                name: user.name,
                profile_picture: user.picture,
                iduser: data.iduser
            }
            localStorage.setItem("user", JSON.stringify(parsedData));
            setUserData(parsedData);
            navigate("/", { replace: true });
            navigate(0);
        }
    }

    const handleLogout = () => {
        localStorage.removeItem("user");
        setUserData(null);
        navigate("/", { replace: true });
        navigate(0);
    }

    console.log(userData)

    return (
        <Navbar className="bg-body-tertiary sticky-top" expand="md">
            <Container>
                <Navbar.Brand href="/">BatukApp</Navbar.Brand>
                <Navbar.Toggle />
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="me-auto">
                        {userData && <Nav.Link href="/community">Community</Nav.Link>}
                        {userData && <Nav.Link href="/calendar">Calendar</Nav.Link>}
                        {userData && <Nav.Link href="/formation">Formation</Nav.Link>}
                        {userData && <Nav.Link href="/composer">Composer</Nav.Link>}
                        {/* 
                        // Dropdown example
                        <NavDropdown title="Dropdown" id="basic-nav-dropdown">
                            <NavDropdown.Item href="#action/3.1">Action</NavDropdown.Item>
                            <NavDropdown.Item href="#action/3.2">
                                Another action
                            </NavDropdown.Item>
                            <NavDropdown.Item href="#action/3.3">Something</NavDropdown.Item>
                            <NavDropdown.Divider />
                            <NavDropdown.Item href="#action/3.4">
                                Separated link
                            </NavDropdown.Item>
                        </NavDropdown>
                        */}
                    </Nav>
                </Navbar.Collapse>
                <Navbar.Collapse className="justify-content-end">
                    { userData
                        ? <NavDropdown 
                            title={
                                <span style={{ height: '40px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                                    <Image
                                        src={userData.profile_picture}
                                        roundedCircle
                                        width={30}
                                        height={30}
                                        alt="Profile Picture"
                                    />
                                    <span>{userData.name}</span>
                                    {isProfileDropdownOpen
                                        ? <FaChevronUp size={12} style={{ marginTop: '4px' }} />
                                        : <FaChevronDown size={12} style={{ marginTop: '4px' }} />
                                    }
                                </span>
                            }
                            id="profile-dropdown"
                            className="no-default-arrow"
                            show={isProfileDropdownOpen}
                            onToggle={(isOpen) => setIsProfileDropdownOpen(isOpen)}
                        >
                            <NavDropdown.Item href="/profile">Profile</NavDropdown.Item>
                            <NavDropdown.Item href="/">Settings</NavDropdown.Item>
                            <NavDropdown.Divider />
                            <NavDropdown.Item onClick={handleLogout}>Logout</NavDropdown.Item>
                        </NavDropdown>
                        : <GoogleLogin
                            onSuccess={handleLogin}
                            onError={() => {
                                console.log('Login Failed');
                            }}
                            type='standard'
                            theme='outline' // filled_black, outline, filled_blue
                            size='large' // small, medium, large
                            text='signin' // signin_with, signup_with, continue_with
                            shape='pill' // rectangular, circle, pill, square
                            logo_alignment='left' // left, center
                            locale='es' // es, en, ca, fr, de, it, pt
                        />
                    }
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
}

export default MainNavbar;