import { lightenColor, darkenColor, getTextColorForBackground } from '../functions/Colors';
import { Badge, Button, Card, FloatingLabel, Form, Image, Modal } from 'react-bootstrap';
import { Fragment, useCallback, useEffect, useState } from 'react';
import { MdDeleteForever } from "react-icons/md";
import Skeleton from 'react-loading-skeleton';
import { IconContext } from 'react-icons';
import DragNDropList from '../components/DragNDropList';
import { DragProvider } from '../components/DragContext';

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

const EditModal = ({ show, editModalInformation, handleClose, allInstruments, rolesTypes, onSave }) => {
    const [editableData, setEditableData] = useState([]);
    const [editableInstruments, setEditableInstruments] = useState([]);
    const [editableUsers, setEditableUsers] = useState([]);
    const [isValidData, setIsValidData] = useState(false);
    const [modalSize, setModalSize] = useState('md');
    const [context, setContext] = useState('user');
    const [instrumentToAdd, setInstrumentToAdd] = useState({});

    const availableInstruments = allInstruments.filter(
        instr => !editableInstruments.some(e => e.idinstrument === instr.idinstrument)
    );

    useEffect(() => {
        if (editModalInformation?.fields) {
            setEditableData(editModalInformation.fields);
        }
        if (editModalInformation?.instruments) {
            setEditableInstruments(editModalInformation.instruments);
        }
        if (editModalInformation?.modal_size) {
            setModalSize(editModalInformation.modal_size);
        }
        if (editModalInformation?.context) {
            setContext(editModalInformation.context);
        }
        if (editModalInformation?.users) {
            setEditableUsers(editModalInformation.users);
        }
    }, [editModalInformation, show]);

    const validateData = useCallback(() => {
        // Check for data fields changes
        const fieldsValid = editModalInformation.fields && editableData.every((field, i) => {
            const original = editModalInformation.fields[i];
            const matchesValue = field.value === original?.value;
            const withinLength = !field.max_length || field.value.length <= field.max_length;
            const patternValid =
                !field.pattern ||
                (field.pattern instanceof RegExp && field.pattern.test(field.value));

            return matchesValue && withinLength && patternValid;
        })

        // Check for instruments changes
        const instrumentsValid = editModalInformation?.instruments?.every(original => {
            const edited = editableInstruments?.find(inst => inst.idinstrument === original.idinstrument);
            if (!edited) return false; // Deleted instrument → fail

            const matchesQuantity = edited.quantity === original.quantity;
            const matchesMinFormation = edited.min_formation === original.min_formation;

            return matchesQuantity && matchesMinFormation;
        });

        // Check for users changes
        const usersValid = editableUsers && editableUsers.every(user => {
            const originalUser = editModalInformation?.users?.find(u => u.iduser === user.iduser);
            if (!originalUser) return false;

            if (user.role !== originalUser.role) return false;

            if (user.instruments.length !== originalUser.instruments.length) return false;

            return user.instruments.every((inst, index) => {
                const originalInst = originalUser.instruments[index];
                return inst.idinstrument === originalInst.idinstrument;
            });
        });

        return fieldsValid && instrumentsValid && usersValid;
    }, [editableData, editableInstruments, editModalInformation, editableUsers]);

    useEffect(() => {
        setIsValidData(validateData());
    }, [validateData]);

    const handleSave = async () => {
        const id = editModalInformation?.id;

        const payload = {};
        editableData.forEach(field => {
            payload[field.name] = field.value;
        });
        payload.instruments = editableInstruments.map(inst => ({
            idinstrument: inst.idinstrument,
            name: inst.name,
            quantity: inst.quantity,
            min_formation: inst.min_formation
        }));

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

    const updateInstrument = (index, field, newValue) => {
        const updated = [...editableInstruments];
        updated[index] = {
            ...updated[index],
            [field]: Math.max(0, newValue), // prevents negative values
        };

        setEditableInstruments(updated);
    };

    const removeInstrument = (index) => {
        const updated = [...editableInstruments]; // or your state variable
        updated.splice(index, 1);
        setEditableInstruments(updated);
    };

    const handleAddInstrument = () => {
        if (!instrumentToAdd) return;
        const instrument = allInstruments.find(i => i.idinstrument === parseInt(instrumentToAdd));
        if (instrument) {
            setEditableInstruments(prev => [
                ...prev,
                {
                    ...instrument,
                    quantity: 0,
                    min_formation: 0
                }
            ]);
            setInstrumentToAdd({});
        }
    };

    const updateUserInstruments = (index, newInstruments) => {
        setEditableUsers(prev => {
            const newUsers = [...prev];
            newUsers[index] = {
                ...newUsers[index],
                instruments: newInstruments,
            };
            return newUsers;
        });
    };

    return(
        <Modal show={show} onHide={handleClose} size={modalSize} centered>
            <Modal.Header closeButton>
                <Modal.Title>Edit User Information</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {editableData && editableData.length > 0 && editableData.map((field, index) => (
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
                {context === "band" && editableInstruments && (
                    <div className="mt-3">
                        <h5>Instruments</h5>
                        <div className="d-flex flex-wrap gap-2">
                            {Array.isArray(editableInstruments) && editableInstruments.length > 0 && editableInstruments.map((instrument, index) => (
                                <div
                                    key={index}
                                    className="border rounded p-2"
                                    style={{ flex: "0 0 250px" }}
                                >
                                    <div className="d-flex justify-content-center align-items-center mb-1 gap-2">
                                        <h6 className="mb-0">{instrument.name}</h6>
                                        <Button
                                            variant="danger"
                                            size="sm"
                                            onClick={() => removeInstrument(index)}
                                            className="py-2 px-2 d-flex align-items-center justify-content-center"
                                        >
                                            <IconContext.Provider value={{ color: "white", size: "1.0rem" }}>
                                                <MdDeleteForever />
                                            </IconContext.Provider>
                                        </Button>
                                    </div>


                                    <div className="d-flex flex-column gap-2">
                                        <div className="d-flex align-items-center gap-2 flex-wrap">
                                            <span>🔢 Quantity:</span>
                                            <Button
                                                variant="secondary"
                                                size="sm"
                                                onClick={() => updateInstrument(index, 'quantity', instrument.quantity - 1)}
                                                disabled={instrument.quantity <= 0}
                                            >–</Button>
                                            <span>{instrument.quantity}</span>
                                            <Button
                                                variant="secondary"
                                                size="sm"
                                                onClick={() => updateInstrument(index, 'quantity', instrument.quantity + 1)}
                                            >+</Button>
                                        </div>

                                        <div className="d-flex align-items-center gap-2 flex-wrap">
                                            <span>👥 Min. Formation:</span>
                                            <Button
                                                variant="secondary"
                                                size="sm"
                                                onClick={() => updateInstrument(index, 'min_formation', instrument.min_formation - 1)}
                                                disabled={instrument.min_formation <= 0}
                                            >–</Button>
                                            <span>{instrument.min_formation}</span>
                                            <Button
                                                variant="secondary"
                                                size="sm"
                                                onClick={() => updateInstrument(index, 'min_formation', instrument.min_formation + 1)}
                                            >+</Button>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {/* Add Instrument Row */}
                            <div className="border rounded p-3 d-flex flex-column" style={{ flex: "0 0 250px", boxSizing: 'border-box', gap: '12px' }}>
                                <h6 className="mb-0 text-center">
                                    Add instrument
                                </h6>

                                <Form.Select
                                    value={instrumentToAdd}
                                    onChange={(e) => setInstrumentToAdd(e.target.value)}
                                >
                                    <option value={{}} disabled hidden>
                                        Select an instrument
                                    </option>
                                    {availableInstruments.map(instr => (
                                        <option key={instr.idinstrument} value={instr.idinstrument}>
                                            {instr.name}
                                        </option>
                                    ))}
                                </Form.Select>

                                <Button
                                    variant="primary"
                                    onClick={handleAddInstrument}
                                    disabled={!instrumentToAdd}
                                    className='w-100'
                                >
                                    Add Instrument
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
                {context === "band" && editableUsers && (
                    <div className="mt-3">
                        <h5>Users</h5>
                        
                        <DragProvider>
                            <div className="d-flex gap-3" style={{ maxWidth: "100%", overflow: "hidden" }}>
                                {/* LEFT: Users list */}
                                <div className="flex-grow-1 d-flex flex-column gap-1" style={{ minWidth: 0 }}>
                                    {editableUsers.map((user, index) => (
                                        <div
                                            key={index}
                                            className="border rounded py-1 px-2 d-flex align-items-center gap-3 flex-wrap"
                                            style={{ boxSizing: "border-box" }}
                                        >
                                            {/* User Name */}
                                            <div
                                                style={{
                                                    flex: "0 0 7rem",
                                                    overflow: "hidden",
                                                    textOverflow: "ellipsis",
                                                    whiteSpace: "nowrap"
                                                }}
                                                title={user.name}
                                            >
                                                <h6
                                                className="mb-0"
                                                style={{
                                                    overflow: "hidden",
                                                    textOverflow: "ellipsis",
                                                    whiteSpace: "nowrap",
                                                    display: "inline-block",
                                                    maxWidth: "100%"
                                                }}
                                                >
                                                    {user.iduser}
                                                </h6>
                                            </div>

                                            {/* Role Select */}
                                            <Form.Select
                                                value={user.role || ""}
                                                onChange={(e) => {
                                                    const newUsers = [...editableUsers];
                                                    newUsers[index] = { ...user, role: e.target.value };
                                                    setEditableUsers(newUsers);
                                                }}
                                                style={{ flex: "0 0 8rem" }}
                                                >
                                                {rolesTypes &&
                                                    rolesTypes.map((role, idx) => (
                                                        <option key={idx} value={role}>
                                                        {role}
                                                        </option>
                                                    ))
                                                }
                                            </Form.Select>

                                            {/* Instrument Drop Area */}
                                            <DragNDropList
                                                key={user.iduser}
                                                listId={`user-${user.iduser}`}
                                                listItems={user.instruments.map(inst => { return { ...inst, id: inst.idinstrument } })}
                                                onChange={(newInstruments) => updateUserInstruments(index, newInstruments)}
                                            />
                                        </div>
                                    ))}
                                </div>

                                {/* RIGHT: Band Instruments */}
                                <DragNDropList
                                    listId={"instruments"}
                                    listItems={editableInstruments.map(inst => { return { ...inst, id: inst.idinstrument } })}
                                    isDroppable={false}
                                />
                            </div>
                        </DragProvider>
                    </div>
                )}
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}> Close </Button>
                <Button variant="primary" onClick={handleSave} disabled={isValidData}> Save Changes </Button>
            </Modal.Footer>
        </Modal>
    )
}

const ShowEntityProfile = ({ data, setEditModalInformation, isLoadingData }) => {
    const transparencyPercentage = 70;
    const hexTransparency = Math.round((transparencyPercentage / 100) * 255).toString(16).padStart(2, '0');
    const backgroundColor = lightenColor((data?.color_code || '#FFFFFF') + hexTransparency);
    const textColor = getTextColorForBackground(backgroundColor);

    return (
        <Card className="m-4 mb-4" style={{ border: `2px solid ${darkenColor(backgroundColor)}`, overflow: 'hidden' }}>
            <Card.Header className="h3" style={{ backgroundColor: backgroundColor, color: textColor, textShadow: '2px 2px 4px rgba(0, 0, 0, 0.6)', borderRadius: '0' }} >
                {data ? data.title : isLoadingData ? <Skeleton width={200} /> : "No data found"} Information
                <Button variant='warning' className="float-end" onClick={() => setEditModalInformation(data)}>Edit</Button>
            </Card.Header>
            <Card.Body className='position-relative' style={{ backgroundColor: lightenColor(backgroundColor), color: textColor, textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)' }}>
                <div className="position-absolute top-0 end-0 p-3 height-100 width-auto object-fit-cover">
                    {data ? <Image src={data.profile_picture} style={{ width: '100px', height: '100px', objectFit: 'cover' }} /> : isLoadingData ? <Skeleton width={100} height={100} /> : "No data found"}
                </div>
                { data.fields && data.fields.length > 0 && data.fields.map((field, index) => (
                    <CustomCardField key={index} field={field} isLoadingData={isLoadingData} />
                ))}
                {data.instruments && data.instruments.length > 0 &&
                    <div className="mt-3">
                        <h5>Instruments</h5>
                        <div
                            style={{
                                display: 'flex',
                                flexWrap: 'wrap',
                                gap: '0.5rem',
                            }}
                        >
                            {data.instruments.map((instrument, index) => (
                                <div
                                    key={index}
                                    className="d-flex align-items-center gap-1 px-2 py-2"
                                    style={{
                                        backgroundColor: darkenColor(backgroundColor, 0.05),
                                        borderRadius: '8px',
                                        border: `1px solid ${darkenColor(backgroundColor)}`,
                                        padding: '8px',
                                        whiteSpace: 'nowrap', // prevent wrapping inside the box
                                    }}
                                >
                                    <span style={{ whiteSpace: 'nowrap' }}>
                                        <strong>{instrument.name.charAt(0).toUpperCase() + instrument.name.slice(1)}</strong>
                                    </span>
                                    <Badge
                                        bg='undefined'
                                        style={{
                                            backgroundColor: darkenColor(backgroundColor, 0.2),
                                            color: textColor,
                                        }}
                                        pill
                                        className="ms-1"
                                    >
                                        🔢 {instrument.quantity} : 👨‍👩‍👧‍👦 {instrument.min_formation}
                                    </Badge>
                                </div>
                            ))}
                        </div>
                    </div>
                }
            </Card.Body>
        </Card>
    )
}

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