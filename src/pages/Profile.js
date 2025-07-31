import { Button, Card, FloatingLabel, Form, Image, Modal, Toast, ToastContainer } from 'react-bootstrap';
import { Fragment, useCallback, useEffect, useState } from 'react';
import Skeleton from 'react-loading-skeleton';
import { lightenColor, darkenColor, getTextColorForBackground } from '../functions/Colors';

const CustomCardField = ({ field, isLoadingData }) => (field.type === 'color'
    ? (
        <Card.Text key={field.name}>
            <strong>{field.title}:</strong>{" "}
            {isLoadingData ? (
                <Skeleton width={200} />
            ) : (
                <span style={{ backgroundColor: field.value, padding: '5px 10px', borderRadius: '5px', color: getTextColorForBackground(field.value), border: '1px solid #ccc', boxShadow: '0 0 5px rgba(0,0,0,0.3)' }}>
                    {field.value}
                </span>
            )}
        </Card.Text>
    ) : (
        <Card.Text key={field.name}>
            <strong>{field.title}:</strong>{" "}
            {isLoadingData ? (
                <Skeleton width={200} />
            ) : field.value ? (
                field.value
        ) : (
            "No data found"
        )}
        </Card.Text>
    )
);

const EditProfileModal = ({ show, editModalInformation, handleClose, onSave }) => {
    const [editableData, setEditableData] = useState([]);
    const [isValidData, setIsValidData] = useState(false);

    useEffect(() => {
        if (editModalInformation?.fields) {
            setEditableData(editModalInformation.fields);
        }
    }, [editModalInformation, show]);

    const validateData = useCallback(() => {
        return editModalInformation.fields &&
            editableData.every((field, i) => {
                const original = editModalInformation.fields[i];
                const matchesValue = field.value === original?.value;
                const withinLength = !field.max_length || field.value.length <= field.max_length;
                const patternValid =
                    !field.pattern ||
                    (field.pattern instanceof RegExp && field.pattern.test(field.value));

                return matchesValue && withinLength && patternValid;
            });
    }, [editableData, editModalInformation.fields]);

    useEffect(() => {
        setIsValidData(validateData());
    }, [validateData]);

    const handleSave = async () => {
        const context = editModalInformation?.context;
        const id = editModalInformation?.id;

        const payload = {};
        editableData.forEach(field => {
            payload[field.name] = field.value;
        });

        let url = '';
        if (context === 'user') {
            url = `/users/${id}`;
        } else if (context === 'band') {
            url = `/bands/${id}`;
        }

        try {
            const res = await fetch(`http://localhost:4000${url}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!res.ok) throw new Error('Save failed');

            onSave(payload, id);
            handleClose();
        } catch (err) {
            alert(`Failed to save ${context} info`);
        }
    };

    return(
        <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>Edit User Information</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {editableData.map((field, index) => (
                    <FloatingLabel
                        key={field.title}
                        label={field.title.charAt(0).toUpperCase() + field.title.slice(1)}
                        className="mb-3"
                    >
                        <Form.Control
                            type={field.type}
                            placeholder={
                                field.type === 'date' ? 'YYYY-MM-DD'
                                : field.type === 'email' ? 'name@example.com'
                                : field.type === 'text' ? 'Enter text'
                                : field.type === 'color' ? 'Select color'
                                : ''
                            }
                            style={ field.type === 'color' ? { minWidth: '150px' } : {} }
                            value={field.value}
                            onChange={(e) => {
                                const updated = [...editableData];
                                updated[index] = { ...field, value: e.target.value };
                                setEditableData(updated);
                            }}
                            disabled={field.disabled || false}
                        />
                    </FloatingLabel>
                ))}
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}> Close </Button>
                <Button variant="primary" onClick={handleSave} disabled={isValidData}> Save Changes </Button>
            </Modal.Footer>
        </Modal>
    )
}

const ShowEntityProfile = ({ data, setEditModalInformation, isLoadingData }) => {
    const transparencyPercentage = data.transparency || 70;  // example
    const hexTransparency = Math.round((transparencyPercentage / 100) * 255).toString(16).padStart(2, '0');
    const backgroundColor = (data?.color_code || '#FFFFFF') + hexTransparency;
    const textColor = getTextColorForBackground(backgroundColor);

    return (
        <Card className="m-4 mb-4" style={{ border: `2px solid ${darkenColor(backgroundColor)}`, overflow: 'hidden' }}>
            <Card.Header className="h3" style={{ backgroundColor: backgroundColor, color: textColor, textShadow: '2px 2px 4px rgba(0, 0, 0, 0.6)', borderRadius: '0' }} >
                {data ? data.title : isLoadingData ? <Skeleton width={200} /> : "No data found"} Information
                <Button variant='warning' className="float-end" onClick={() => setEditModalInformation(data)}>Edit</Button>
            </Card.Header>
            <Card.Body className='position-relative' style={{ backgroundColor: lightenColor(backgroundColor), color: textColor, textShadow: '2px 2px 4px rgba(0, 0, 0, 0.6)' }}>
                <div className="position-absolute top-0 end-0 p-3 height-100 width-auto object-fit-cover">
                    {data ? <Image src={data.profile_picture} style={{ width: '100px', height: '100px', objectFit: 'cover' }} /> : isLoadingData ? <Skeleton width={100} height={100} /> : "No data found"}
                </div>
                { data.fields && data.fields.length > 0 && data.fields.map((field, index) => (
                    <CustomCardField key={index} field={field} isLoadingData={isLoadingData} />
                ))}
                { 
                    // Instruments 
                }
            </Card.Body>
        </Card>
    )
}

const Profile = () => {
    const [userData, setUserData] = useState(null);
    const [editModalInformation, setEditModalInformation] = useState([]);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [isLoadingData, setIsLoadingData] = useState(true);

    useEffect(() => {
        let user = JSON.parse(localStorage.getItem("user"));
        getProfileData(user.iduser);
    }, []);

    const getProfileData = async (iduser) => {
        try {
            const response = await fetch(`http://localhost:4000/users/?iduser=${iduser}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include"
            })

            const data = await response.json();
            if (data && data.iduser) {
                setUserData(data);
            }
        } catch (error) {
            console.error("Error fetching user data:", error);
        }
        setIsLoadingData(false);
    }

    return (
        <Fragment>
            <ToastContainer position="bottom-end" className="p-3">
                <Toast bg="danger" onClose={() => setShowToast(false)} show={showToast} delay={5000} autohide>
                    <Toast.Header>
                        <strong className="me-auto">Save Failed</strong>
                    </Toast.Header>
                    <Toast.Body>{toastMessage}</Toast.Body>
                </Toast>
            </ToastContainer>
            <EditProfileModal
                show={editModalInformation.context && editModalInformation.id && editModalInformation.fields.length > 0}
                editModalInformation={editModalInformation}
                handleClose={() => setEditModalInformation([])}
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
                        fields: [
                            { type: 'text', name: 'name', title: 'Name', value: band.name },
                            { type: 'email', name: 'email', title: 'Email Address', value: band.email, disabled: true },
                            { type: 'text', name: 'location', title: 'Location', value: band.location },
                            { type: 'color', name: 'color_code', title: 'Color Code', value: band.color_code, max_length: 7, pattern: /^#[0-9A-Fa-f]{6}$/ }
                        ]
                    }} />
                ))
            ) : (
                <p>No bands found.</p>
            )}
        </Fragment>
    )
}

export default Profile;