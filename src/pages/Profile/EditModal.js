import { Button, FloatingLabel, Form, Modal } from 'react-bootstrap';
import { MdDeleteForever } from "react-icons/md";
import { IconContext } from 'react-icons';
import DragNDropList from '../../components/DragNDropList';
import { DragProvider } from '../../components/DragContext';
import { useState, useEffect, useCallback } from 'react';

const EditModal = ({ show, editModalInformation, handleClose, allInstruments, rolesTypes, onSave }) => {
    const [editableData, setEditableData] = useState([]);
    const [editableInstruments, setEditableInstruments] = useState([]);
    const [editableUsers, setEditableUsers] = useState([]);
    const [isDataChanged, setIsDataChanged] = useState({
        fieldsUnchanged: false,
        instrumentsUnchanged: false,
        usersUnchanged: false,
    });
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

    const checkChangedData = useCallback(() => {
        // Check for data fields changes
        const fieldsUnchanged = editModalInformation.fields && editableData.every((field, i) => {
            const original = editModalInformation.fields[i];
            const matchesValue = field.value === original?.value;
            const withinLength = !field.max_length || field.value.length <= field.max_length;
            const patternValid =
                !field.pattern ||
                (field.pattern instanceof RegExp && field.pattern.test(field.value));

            return matchesValue && withinLength && patternValid;
        })

        // Check for instruments changes
        const instrumentsUnchanged = (() => {
            if (editableInstruments?.length !== editModalInformation?.instruments?.length) {
                return false; // Added or removed instrument → fail
            }

            return editModalInformation?.instruments?.every(original => {
                const edited = editableInstruments?.find(inst => inst.idinstrument === original.idinstrument);
                if (!edited) return false; // Deleted instrument → fail

                const matchesQuantity = edited.quantity === original.quantity;
                const matchesMinFormation = edited.min_formation === original.min_formation;

                return matchesQuantity && matchesMinFormation;
            });
        })();

        // Check for users changes
        const usersUnchanged = editableUsers && editableUsers.every(user => {
            const originalUser = editModalInformation?.users?.find(u => u.iduser === user.iduser);
            if (!originalUser) return false;

            if (user.role !== originalUser.role) return false;

            if (user.instruments.length !== originalUser.instruments.length) return false;

            return user.instruments.every((inst, index) => {
                const originalInst = originalUser.instruments[index];
                return inst.idinstrument === originalInst.idinstrument;
            });
        });

        return {
            "fieldsUnchanged": fieldsUnchanged,
            "instrumentsUnchanged": instrumentsUnchanged,
            "usersUnchanged": usersUnchanged
        }
    }, [editModalInformation, editableData, editableInstruments, editableUsers]);

    useEffect(() => {
        setIsDataChanged(checkChangedData());
    }, [checkChangedData]);

    const handleSave = async () => {
        const id = editModalInformation?.id;

        const payload = {};
        editableData.forEach(field => {
            payload[field.name] = field.value;
        });
        payload.instruments = editableInstruments;
        payload.users = editableUsers;

        let url = '';
        if (context === 'user') {
            url = `/users/${id}`;
        } else if (context === 'band') {
            url = `/bands/${id}?${Object.keys(isDataChanged).map(key => `${key}=${isDataChanged[key]}`).join("&")}`;
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
                                                    {user.name}
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
                <Button variant="primary" onClick={handleSave} disabled={isDataChanged.fieldsUnchanged && isDataChanged.instrumentsUnchanged && isDataChanged.usersUnchanged}> Save Changes </Button>
            </Modal.Footer>
        </Modal>
    )
}

export default EditModal;