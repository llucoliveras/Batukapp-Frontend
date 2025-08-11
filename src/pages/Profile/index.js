import { Fragment, useCallback, useEffect, useState } from 'react';
import ShowEntityProfile from './ShowEntityProfile'
import EditModal from './EditModal';

const Profile = () => {
    const [userData, setUserData] = useState(null);
    const [allInstruments, setAllInstruments] = useState([])
    const [roleTypes, setRoleTypes] = useState(null);
    const [editModalInformation, setEditModalInformation] = useState([]);
    const [isLoadingData, setIsLoadingData] = useState(true);

    useEffect(() => {
        let user = JSON.parse(localStorage.getItem("user"));
        getProfileData(user.iduser);
    }, []);

    const getProfileData = async (iduser) => {
        try {
            const responseUserData = await fetch(`http://localhost:4000/users/?iduser=${iduser}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include"
            })

            const userData = await responseUserData.json();
            if (userData && userData.iduser) {
                setUserData(userData);
            }

            const allInstrumentsData = await fetch(`http://localhost:4000/instruments`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include"
            })

            const instrumentsData = await allInstrumentsData.json();
            if (instrumentsData && Array.isArray(instrumentsData) && instrumentsData[0].idinstrument) {
                setAllInstruments(instrumentsData);
            }

            const allRoleTypes = await fetch('http://localhost:4000/bands/roles', {
                method: 'GET',
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include"
            })

            const roleTypes = await allRoleTypes.json();
            if (roleTypes) {
                setRoleTypes(roleTypes)
            }
        } catch (error) {
            console.error("Error fetching user data:", error);
        }
        setIsLoadingData(false);
    }

    return (
        <Fragment>
            <EditModal
                show={editModalInformation.context && editModalInformation.id && editModalInformation.fields.length > 0}
                editModalInformation={editModalInformation}
                handleClose={() => setEditModalInformation([])}
                allInstruments={allInstruments}
                rolesTypes={roleTypes}
                onSave={(updatedData, id) => {
                    const context = editModalInformation.context;
                    if (context === "user") {
                        setUserData(prev => ({ ...prev, ...updatedData }));
                    } else if (context === "band") {
                        setUserData(prev => ({ ...prev, bands: prev.bands.map(b => b.idband === id ? { ...b, ...updatedData } : b) }));
                    }
                }}
            />
            <ShowEntityProfile setEditModalInformation={setEditModalInformation} isLoadingData={isLoadingData} data={{
                    context: "user",
                    title: "Your ",
                    id: userData?.iduser,
                    profile_picture: userData?.profile_picture,
                    color_code: "#c8dcf0",
                    modal_size: "md",
                    fields: [
                        { type: 'text', name: 'name', title: 'Name', value: userData?.name },
                        { type: 'email', name: 'email', title: 'Email Address', value: userData?.email, disabled: true },
                        { type: 'date', name: 'birth_date', title: 'Birth Date', value: userData?.birth_date }
                    ]
                }}
            />
            {userData && userData.bands && userData.bands.length > 0 ? (
                userData.bands.map((band, index) => (
                    <ShowEntityProfile key={index} setEditModalInformation={setEditModalInformation} isLoadingData={isLoadingData} data={{
                        context: "band",
                        title: band.name.charAt(0).toUpperCase() + band.name.slice(1),
                        id: band.idband,
                        profile_picture: band.profile_picture,
                        color_code: band.color_code,
                        modal_size: "lg",
                        fields: [
                            { type: 'text', name: 'name', title: 'Name', value: band.name },
                            { type: 'email', name: 'email', title: 'Email Address', value: band.email, disabled: true },
                            { type: 'text', name: 'location', title: 'Location', value: band.location },
                            { type: 'color', name: 'color_code', title: 'Color Code', value: band.color_code, max_length: 7, pattern: /^#[0-9A-Fa-f]{6}$/ }
                        ],
                        instruments: band.instruments || [],
                        users: band.users || []
                    }} />
                ))
            ) : (
                <p>No bands found.</p>
            )}
        </Fragment>
    )
}

export default Profile;