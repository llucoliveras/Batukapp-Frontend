import { useState } from "react";
import { DragProvider } from "../components/DragContext";
import DragNDropList from "../components/DragNDropList";



const Test = () => {
    const instruments = [
        {id: "1", name: "Caixa"},
        {id: "2", name: "Tamborí"},
        {id: "3", name: "Surdo"},
        {id: "4", name: "Campana"},
        {id: "5", name: "Repenique"},
        {id: "6", name: "Shequere"}
    ];
    const [editableUsers, setEditableUsers] = useState([
        {iduser: 1, name: "Lluc", instruments: [instruments[5], instruments[3]]},
        {iduser: 2, name: "Isaac", instruments: [instruments[1], instruments[2]]},
        {iduser: 3, name: "Marina", instruments: [instruments[4], instruments[0]]}
    ]);

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

    return (
        <DragProvider>
            <div>
                <DragNDropList
                    key={"instruments"}
                    listId={"instruments"}
                    listItems={instruments}
                    isDroppable={false}
                />

                {editableUsers.map((user, index) => 
                    <DragNDropList
                        key={user.iduser}
                        listId={`user-${user.iduser}`}
                        listItems={user.instruments}
                        onChange={(newInstruments) => updateUserInstruments(index, newInstruments)}
                    />
                )}
            </div>
        </DragProvider>
    );
};

export default Test;
